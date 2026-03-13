"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, Category, DEFAULT_CATEGORIES, AppLanguage, AppTheme, LinkedAccount } from '@/lib/types';

const STORAGE_KEY_TRANSACTIONS = 'cashflow_transactions';
const STORAGE_KEY_CATEGORIES = 'cashflow_categories';
const STORAGE_KEY_SETTINGS = 'cashflow_settings';
const STORAGE_KEY_ACCOUNTS = 'cashflow_accounts';

interface CashFlowContextType {
  transactions: Transaction[];
  categories: Category[];
  accounts: LinkedAccount[];
  language: AppLanguage;
  theme: AppTheme;
  isLoading: boolean;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  saveTransactions: (newTransactions: Transaction[]) => void;
  saveCategories: (newCategories: Category[]) => void;
  saveSettings: (lang: AppLanguage, thm: AppTheme) => void;
  saveAccounts: (newAccounts: LinkedAccount[]) => void;
}

export const CashFlowContext = createContext<CashFlowContextType | undefined>(undefined);

export function CashFlowProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [theme, setTheme] = useState<AppTheme>('default');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedTransactions = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    const storedCategories = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    const storedAccounts = localStorage.getItem(STORAGE_KEY_ACCOUNTS);

    if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
    if (storedCategories) setCategories(JSON.parse(storedCategories));
    else setCategories(DEFAULT_CATEGORIES);
    if (storedAccounts) setAccounts(JSON.parse(storedAccounts));

    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      setLanguage(settings.language || 'en');
      setTheme(settings.theme || 'default');
    }
    
    setIsLoading(false);
  }, []);

  const saveTransactions = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(newTransactions));
  };

  const addTransaction = (transaction: Transaction) => {
    const updated = [transaction, ...transactions];
    saveTransactions(updated);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map(t => t.id === id ? { ...t, ...updates } : t);
    saveTransactions(updated);
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    saveTransactions(updated);
  };

  const saveCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(newCategories));
  };

  const addCategory = (category: Category) => {
    const updated = [...categories, category];
    saveCategories(updated);
  };

  const deleteCategory = (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    saveCategories(updated);
  };

  const saveSettings = (lang: AppLanguage, thm: AppTheme) => {
    setLanguage(lang);
    setTheme(thm);
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify({ language: lang, theme: thm }));
  };

  const saveAccounts = (newAccounts: LinkedAccount[]) => {
    setAccounts(newAccounts);
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(newAccounts));
  };

  return (
    <CashFlowContext.Provider value={{
      transactions,
      categories,
      accounts,
      language,
      theme,
      isLoading,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      deleteCategory,
      saveTransactions,
      saveCategories,
      saveSettings,
      saveAccounts
    }}>
      {children}
    </CashFlowContext.Provider>
  );
}
