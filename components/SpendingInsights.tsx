import React from 'react';
import { motion } from 'framer-motion';
import { Transaction } from '../types';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface SpendingInsightsProps {
  transactions: Transaction[];
}

export const SpendingInsights: React.FC<SpendingInsightsProps> = ({ transactions }) => {
  const expenses = transactions.filter(t => t.type === 'expense');
  const income = transactions.filter(t => t.type === 'income');
  
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Monthly comparison
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const thisMonthExpenses = expenses.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).reduce((sum, t) => sum + t.amount, 0);

  const lastMonthExpenses = expenses.filter(t => {
    const date = new Date(t.date);
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  }).reduce((sum, t) => sum + t.amount, 0);

  const monthlyChange = lastMonthExpenses > 0 
    ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
    : 0;

  // Average transaction
  const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
  const avgIncome = income.length > 0 ? totalIncome / income.length : 0;

  // Largest transactions
  const largestExpense = expenses.length > 0 
    ? expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0])
    : null;

  const largestIncome = income.length > 0
    ? income.reduce((max, t) => t.amount > max.amount ? t : max, income[0])
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Spending Insights
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Analyze your financial patterns and trends
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Total Income</span>
            <DollarSign className="text-green-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">{income.length} transactions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Total Expenses</span>
            <DollarSign className="text-red-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">{expenses.length} transactions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "p-6 rounded-xl border shadow-sm",
            netBalance >= 0 
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Net Balance</span>
            {netBalance >= 0 ? (
              <TrendingUp className="text-green-600" size={20} />
            ) : (
              <TrendingDown className="text-red-600" size={20} />
            )}
          </div>
          <p className={cn(
            "text-2xl font-bold",
            netBalance >= 0 ? "text-green-600" : "text-red-600"
          )}>
            ${Math.abs(netBalance).toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {netBalance >= 0 ? 'Surplus' : 'Deficit'}
          </p>
        </motion.div>
      </div>

      {/* Monthly Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            Monthly Comparison
          </h3>
          <div className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            monthlyChange > 0 
              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
              : monthlyChange < 0
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
          )}>
            {monthlyChange > 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">This Month</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              ${thisMonthExpenses.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Last Month</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              ${lastMonthExpenses.toFixed(2)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Top Spending Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <PieChart size={20} className="text-purple-600" />
          Top Spending Categories
        </h3>
        <div className="space-y-3">
          {topCategories.map(([category, amount], index) => {
            const percentage = (amount / totalExpenses) * 100;
            return (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {index + 1}. {category}
                  </span>
                  <span className="text-slate-900 dark:text-slate-100 font-semibold">
                    ${amount.toFixed(2)} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={cn(
                      "h-full rounded-full",
                      index === 0 ? "bg-purple-500" :
                      index === 1 ? "bg-blue-500" :
                      index === 2 ? "bg-indigo-500" :
                      index === 3 ? "bg-violet-500" : "bg-slate-500"
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Averages & Extremes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Average Transactions
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Avg. Expense</span>
              <span className="font-semibold text-red-600">${avgExpense.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Avg. Income</span>
              <span className="font-semibold text-green-600">${avgIncome.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Largest Transactions
          </h3>
          <div className="space-y-3">
            {largestExpense && (
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Largest Expense</span>
                  <span className="font-semibold text-red-600">${largestExpense.amount.toFixed(2)}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{largestExpense.description}</p>
              </div>
            )}
            {largestIncome && (
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Largest Income</span>
                  <span className="font-semibold text-green-600">${largestIncome.amount.toFixed(2)}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{largestIncome.description}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
