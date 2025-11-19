import { Transaction, TransactionType, Category, ForecastPoint } from './types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const subDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];

// Generate 60 days of transactions
export const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const today = new Date();

  // Regular Salary
  [0, 14, 28, 42, 56].forEach(daysAgo => {
    transactions.push({
      id: generateId(),
      date: formatDate(subDays(today, daysAgo)),
      amount: 3200,
      type: TransactionType.INCOME,
      category: Category.INCOME,
      description: 'Bi-weekly Salary'
    });
  });

  // Random Expenses
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const type = TransactionType.EXPENSE;
    const categoryKey = Object.keys(Category)[Math.floor(Math.random() * (Object.keys(Category).length - 1))]; // Exclude Income mostly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const category = (Category as any)[categoryKey] === Category.INCOME ? Category.FOOD : (Category as any)[categoryKey];
    
    const baseAmount = Math.random() * 100 + 10;
    const amount = category === Category.HOUSING ? 1500 : baseAmount;
    
    if (category === Category.HOUSING && daysAgo % 30 !== 0) continue; // Rent only once a month logic approximation

    transactions.push({
      id: generateId(),
      date: formatDate(subDays(today, daysAgo)),
      amount: Number(amount.toFixed(2)),
      type,
      category,
      description: `${category} purchase`
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const generateForecastData = (transactions: Transaction[]): ForecastPoint[] => {
  const data: ForecastPoint[] = [];
  const today = new Date();
  
  // Past 30 days actuals
  let runningBalance = 15000; // Starting balance hypothesis
  const dailyNet: Record<string, number> = {};

  transactions.forEach(t => {
    if (!dailyNet[t.date]) dailyNet[t.date] = 0;
    dailyNet[t.date] += t.type === TransactionType.INCOME ? t.amount : -t.amount;
  });

  for (let i = 30; i >= 0; i--) {
    const d = subDays(today, i);
    const dateStr = formatDate(d);
    const change = dailyNet[dateStr] || 0;
    runningBalance += change;
    
    data.push({
      date: dateStr,
      actual: runningBalance,
      projected: runningBalance
    });
  }

  // Future 30 days projection (linear regression simplified)
  let projectedBalance = runningBalance;
  const avgDailySpend = 120; // Simplified assumption
  
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    
    // Simulate paydays
    if (i % 14 === 0) projectedBalance += 3200;
    
    projectedBalance -= (avgDailySpend + (Math.random() * 50 - 25));
    
    data.push({
      date: formatDate(d),
      projected: projectedBalance,
      upperBound: projectedBalance * 1.1,
      lowerBound: projectedBalance * 0.9
    });
  }

  return data;
};