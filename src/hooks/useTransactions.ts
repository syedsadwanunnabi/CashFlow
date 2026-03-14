import { useState, useEffect, useCallback, useRef } from "react";
import type { Transaction, BankId, CategoryId } from "@/lib/data";
import { BANKS } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STORAGE_KEY = "cf-transactions";
const DATA_VERSION_KEY = "cf-data-version";
const CURRENT_VERSION = "4";

const sortTransactionsChronologically = (items: Transaction[]) =>
  items
    .map((tx, index) => ({ tx, index }))
    .sort((a, b) => {
      const timeDiff = new Date(a.tx.date).getTime() - new Date(b.tx.date).getTime();
      if (timeDiff !== 0) return timeDiff;
      return b.index - a.index;
    })
    .map(({ tx }) => tx);

const mapRowToTransaction = (row: any): Transaction => ({
  id: row.id,
  amount: Number(row.amount),
  type: row.type as "sent" | "received" | "balance",
  bank: row.bank as BankId,
  category: row.category as CategoryId,
  description: row.description,
  date: row.date,
});

const txnToRow = (txn: Transaction, userId: string) => ({
  id: txn.id,
  user_id: userId,
  amount: txn.amount,
  type: txn.type,
  bank: txn.bank,
  category: txn.category,
  description: txn.description,
  date: txn.date,
});

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  // Fetch ALL transactions from cloud (no row limit)
  const fetchAllFromCloud = useCallback(async (userId: string): Promise<Transaction[]> => {
    const allRows: any[] = [];
    let from = 0;
    const pageSize = 1000;

    while (true) {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) {
        console.error("Failed to fetch transactions:", error);
        break;
      }
      if (!data || data.length === 0) break;
      allRows.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
    }

    return allRows.map(mapRowToTransaction);
  }, []);

  // Single initialization effect — handles both login sync and loading
  useEffect(() => {
    const userId = user?.id ?? null;

    // Skip if same user already initialized
    if (userId === userIdRef.current && initializedRef.current) return;
    userIdRef.current = userId;
    initializedRef.current = true;

    if (userId) {
      initCloud(userId);
    } else {
      loadFromLocal();
    }
  }, [user]);

  const initCloud = async (userId: string) => {
    setLoading(true);

    // Step 1: Check if there's local data to sync
    const localStored = localStorage.getItem(STORAGE_KEY);
    let localTxns: Transaction[] = [];
    if (localStored) {
      try {
        const parsed = JSON.parse(localStored) as Transaction[];
        if (parsed.length > 0 && parsed.every(t => t.bank in BANKS)) {
          localTxns = parsed;
        }
      } catch { /* ignore */ }
    }

    // Step 2: If local data exists, upsert to cloud FIRST
    if (localTxns.length > 0) {
      const rows = localTxns.map(txn => txnToRow(txn, userId));
      const { error } = await supabase.from("transactions").upsert(rows, { onConflict: "id" });
      if (!error) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(DATA_VERSION_KEY);
      }
    }

    // Step 3: Then load everything from cloud (single source of truth)
    const cloudTxns = await fetchAllFromCloud(userId);
    setTransactions(cloudTxns);
    setLoading(false);
  };

  const loadFromLocal = () => {
    const storedVersion = localStorage.getItem(DATA_VERSION_KEY);
    if (storedVersion === CURRENT_VERSION) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Transaction[];
          if (parsed.every(t => t.bank in BANKS)) {
            setTransactions(parsed);
            setLoading(false);
            return;
          }
        } catch { /* fallback */ }
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_VERSION);
    setTransactions([]);
    setLoading(false);
  };

  // Persist to localStorage when not logged in
  useEffect(() => {
    if (!user && !loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions, user, loading]);

  const addTransaction = useCallback(async (txn: Transaction) => {
    // Optimistic update
    setTransactions(prev =>
      [txn, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );

    if (user) {
      const { error } = await supabase.from("transactions").insert(txnToRow(txn, user.id));
      if (error) {
        // Rollback on failure
        setTransactions(prev => prev.filter(t => t.id !== txn.id));
        toast.error("Failed to save transaction");
        console.error("Insert error:", error);
      }
    }
  }, [user]);

  const updateTransaction = useCallback(async (updated: Transaction) => {
    setTransactions(prev => {
      const old = prev.find(t => t.id === updated.id);
      // Store old for potential rollback
      if (old) (updated as any).__prev = old;
      return prev
        .map(t => t.id === updated.id ? updated : t)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    if (user) {
      const { error } = await supabase.from("transactions").update({
        amount: updated.amount,
        type: updated.type,
        bank: updated.bank,
        category: updated.category,
        description: updated.description,
        date: updated.date,
      }).eq("id", updated.id).eq("user_id", user.id);

      if (error) {
        // Rollback
        const prev = (updated as any).__prev;
        if (prev) {
          setTransactions(txns => txns.map(t => t.id === updated.id ? prev : t));
        }
        toast.error("Failed to update transaction");
        console.error("Update error:", error);
      }
    }
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    let removed: Transaction | undefined;
    setTransactions(prev => {
      removed = prev.find(t => t.id === id);
      return prev.filter(t => t.id !== id);
    });

    if (user) {
      const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);
      if (error) {
        // Rollback
        if (removed) {
          setTransactions(prev =>
            [...prev, removed!].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          );
        }
        toast.error("Failed to delete transaction");
        console.error("Delete error:", error);
      }
    }
  }, [user]);

  const clearAllData = useCallback(async () => {
    if (user) {
      const { error } = await supabase.from("transactions").delete().eq("user_id", user.id);
      if (error) {
        toast.error("Failed to clear data");
        return;
      }
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DATA_VERSION_KEY);
    setTransactions([]);
  }, [user]);

  const loadDemoData = useCallback(async () => {
    const { generateDemoTransactions } = await import("@/lib/data");
    const demo = generateDemoTransactions();

    if (user) {
      // Clear existing first, then insert demo
      await supabase.from("transactions").delete().eq("user_id", user.id);
      const rows = demo.map(txn => txnToRow(txn, user.id));
      const { error } = await supabase.from("transactions").insert(rows);
      if (error) {
        toast.error("Failed to load demo data");
        console.error("Demo insert error:", error);
        return;
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
      localStorage.setItem(DATA_VERSION_KEY, CURRENT_VERSION);
    }
    setTransactions(demo);
  }, [user]);

  // ─── Derived values ───

  const totalBalance = (() => {
    const sorted = sortTransactionsChronologically(transactions);
    const bankTotals = new Map<string, number>();
    for (const tx of sorted) {
      if (tx.type === "balance") {
        bankTotals.set(tx.bank, tx.amount);
      } else if (tx.type === "received") {
        bankTotals.set(tx.bank, (bankTotals.get(tx.bank) || 0) + tx.amount);
      } else {
        bankTotals.set(tx.bank, (bankTotals.get(tx.bank) || 0) - tx.amount);
      }
    }
    let total = 0;
    bankTotals.forEach(v => total += v);
    return total;
  })();

  const now = new Date();
  const thisMonthTxns = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthlySpend = thisMonthTxns.filter(t => t.type === "sent").reduce((s, t) => s + t.amount, 0);
  const monthlyIncome = thisMonthTxns.filter(t => t.type === "received").reduce((s, t) => s + t.amount, 0);

  const daysInMonth = now.getDate() || 1;
  const burnRate = Math.round(monthlySpend / daysInMonth);

  return { transactions, addTransaction, updateTransaction, deleteTransaction, clearAllData, loadDemoData, totalBalance, monthlySpend, monthlyIncome, burnRate, loading };
}
