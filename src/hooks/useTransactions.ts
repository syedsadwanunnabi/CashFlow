import { useState, useEffect } from "react";
import type { Transaction } from "@/lib/data";
import { generateDemoTransactions, BANKS } from "@/lib/data";

const STORAGE_KEY = "cf-transactions";
const DATA_VERSION_KEY = "cf-data-version";
const CURRENT_VERSION = "2"; // bump when bank IDs change

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const storedVersion = localStorage.getItem(DATA_VERSION_KEY);
    if (storedVersion === CURRENT_VERSION) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Transaction[];
          // Validate all bank IDs are still valid
          const valid = parsed.every(t => t.bank in BANKS);
          if (valid) return parsed;
        } catch { /* fallback */ }
      }
    }
    const demo = generateDemoTransactions();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_VERSION);
    return demo;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (txn: Transaction) => {
    setTransactions(prev => [txn, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const totalBalance = transactions.reduce((sum, t) => sum + (t.type === "received" ? t.amount : -t.amount), 0);

  const thisMonthTxns = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === 2 && d.getFullYear() === 2026;
  });

  const monthlySpend = thisMonthTxns.filter(t => t.type === "sent").reduce((s, t) => s + t.amount, 0);
  const monthlyIncome = thisMonthTxns.filter(t => t.type === "received").reduce((s, t) => s + t.amount, 0);

  const daysInMonth = new Date().getDate() || 1;
  const burnRate = Math.round(monthlySpend / daysInMonth);

  return { transactions, addTransaction, totalBalance, monthlySpend, monthlyIncome, burnRate };
}
