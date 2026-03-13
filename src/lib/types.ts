export type TransactionType = 'debit' | 'credit' | 'payment' | 'transfer' | 'withdrawal' | 'deposit' | 'unknown';

export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  date: string; // ISO string
  type: TransactionType;
  category: string;
  bankName?: string | null;
  accountLastDigits?: string;
  isSuccess: boolean;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export type AppLanguage = 'en' | 'bn';
export type AppTheme = 'default' | 'cyan' | 'pink' | 'dark' | 'midnight' | 'emerald' | 'amethyst' | 'onyx';

export interface LinkedAccount {
  id: string;
  name: string;
  number: string;
  type: 'bank' | 'mfs';
  provider: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', color: '#FF9500' },
  { id: '2', name: 'Shopping', color: '#FF2D55' },
  { id: '3', name: 'Transportation', color: '#5856D6' },
  { id: '4', name: 'Entertainment', color: '#AF52DE' },
  { id: '5', name: 'Health & Wellness', color: '#FF3B30' },
  { id: '6', name: 'Utilities', color: '#34C759' },
  { id: '7', name: 'Rent', color: '#007AFF' },
  { id: '8', name: 'Income', color: '#32D74B' },
  { id: '9', name: 'Miscellaneous', color: '#8E8E93' },
];
