import { useState, useEffect, useCallback } from "react";
import type { Transaction, BankId, CategoryId } from "@/lib/data";
import { generateDemoTransactions, BANKS } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Load transactions: from cloud if logged in, else localStorage
  useEffect(() => {
    if (user) {
      loadFromCloud();
    } else {
      loadFromLocal();
    }
  }, [user]);

  const loadFromCloud = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user!.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTransactions(data.map(row => ({
        id: row.id,
        amount: Number(row.amount),
        type: row.type as "sent" | "received" | "balance",
        bank: row.bank as BankId,
        category: row.category as CategoryId,
        description: row.description,
        date: row.date,
      })));
    }
    setLoading(false);
  };

  const loadFromLocal = () => {
    const storedVersion = localStorage.getItem(DATA_VERSION_KEY);
    if (storedVersion === CURRENT_VERSION) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Transaction[];
          const valid = parsed.every(t => t.bank in BANKS);
          if (valid) {
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

  const addTransaction = async (txn: Transaction) => {
    setTransactions(prev => [txn, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    if (user) {
      await supabase.from("transactions").insert({
        id: txn.id,
        user_id: user.id,
        amount: txn.amount,
        type: txn.type,
        bank: txn.bank,
        category: txn.category,
        description: txn.description,
        date: txn.date,
      });
    }
  };

  const clearAllData = useCallback(async () => {
    if (user) {
      await supabase.from("transactions").delete().eq("user_id", user.id);
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DATA_VERSION_KEY);
    setTransactions([]);
  }, [user]);

  const loadDemoData = useCallback(async () => {
    const demo = generateDemoTransactions();
    setTransactions(demo);

    if (user) {
      // Insert demo data to cloud
      const rows = demo.map(txn => ({
        id: txn.id,
        user_id: user.id,
        amount: txn.amount,
        type: txn.type,
        bank: txn.bank,
        category: txn.category,
        description: txn.description,
        date: txn.date,
      }));
      await supabase.from("transactions").insert(rows);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
      localStorage.setItem(DATA_VERSION_KEY, CURRENT_VERSION);
    }
  }, [user]);

  // Sync local data to cloud on first login
  const syncLocalToCloud = useCallback(async () => {
    if (!user) return;
    const localStored = localStorage.getItem(STORAGE_KEY);
    if (!localStored) return;
    try {
      const localTxns = JSON.parse(localStored) as Transaction[];
      if (localTxns.length === 0) return;

      const rows = localTxns.map(txn => ({
        id: txn.id,
        user_id: user.id,
        amount: txn.amount,
        type: txn.type,
        bank: txn.bank,
        category: txn.category,
        description: txn.description,
        date: txn.date,
      }));
      await supabase.from("transactions").upsert(rows, { onConflict: "id" });
      // Clear local after sync
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(DATA_VERSION_KEY);
      // Reload from cloud
      await loadFromCloud();
    } catch { /* ignore */ }
  }, [user]);

  // Trigger sync when user logs in
  useEffect(() => {
    if (user) {
      syncLocalToCloud();
    }
  }, [user]);

  // totalBalance: balance entries reset a bank's total, inflows/outflows adjust it
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

  return { transactions, addTransaction, clearAllData, loadDemoData, totalBalance, monthlySpend, monthlyIncome, burnRate, loading };
}
