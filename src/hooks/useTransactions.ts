import { useState, useEffect } from "react";
import type { Transaction } from "@/lib/data";
import { generateDemoTransactions } from "@/lib/data";

const STORAGE_KEY = "cf-transactions";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* fallback */ }
    }
    const demo = generateDemoTransactions();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
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
    return d.getMonth() === 2 && d.getFullYear() === 2026; // March 2026
  });

  const monthlySpend = thisMonthTxns.filter(t => t.type === "sent").reduce((s, t) => s + t.amount, 0);
  const monthlyIncome = thisMonthTxns.filter(t => t.type === "received").reduce((s, t) => s + t.amount, 0);

  const daysInMonth = new Date().getDate() || 1;
  const burnRate = Math.round(monthlySpend / daysInMonth);

  return { transactions, addTransaction, totalBalance, monthlySpend, monthlyIncome, burnRate };
}
