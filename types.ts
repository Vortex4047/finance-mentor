export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum Category {
  HOUSING = 'Housing',
  FOOD = 'Food & Dining',
  TRANSPORT = 'Transportation',
  UTILITIES = 'Utilities',
  ENTERTAINMENT = 'Entertainment',
  SHOPPING = 'Shopping',
  HEALTH = 'Health',
  INCOME = 'Income',
  INVESTMENT = 'Investment',
  MISC = 'Miscellaneous',
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: Category;
  description: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netWorth: number;
  savingsRate: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface HealthScore {
  score: number;
  status: 'Critical' | 'Fair' | 'Good' | 'Excellent';
  insights: string[];
}

export interface ForecastPoint {
  date: string;
  actual?: number;
  projected: number;
  upperBound?: number;
  lowerBound?: number;
}