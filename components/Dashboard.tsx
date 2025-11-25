import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Transaction, TransactionType, FinancialSummary, ForecastPoint, HealthScore } from '../types';
import { ForecastChart, SpendingPieChart } from './Charts';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown, Activity, Target, Zap, Award } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';

interface DashboardProps {
  transactions: Transaction[];
  forecastData: ForecastPoint[];
  healthScore: HealthScore | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, forecastData, healthScore }) => {
  const summary: FinancialSummary = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netWorth: 15420 + income - expenses,
      savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0
    };
  }, [transactions]);

  const StatCard = ({ title, value, trend, icon: Icon, color, bgColor }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-xl", bgColor, "group-hover:scale-110 transition-transform")}>
          <Icon className={color} size={24} />
        </div>
        {trend !== undefined && (
          <span className={cn(
            "flex items-center text-sm font-semibold px-2 py-1 rounded-lg",
            trend >= 0 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
          )}>
            {trend >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <h3 className="text-slate-500 text-sm font-medium mb-2">{title}</h3>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </motion.div>
  );

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-blue-500 to-indigo-600';
    if (score >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getHealthScoreIcon = (score: number) => {
    if (score >= 80) return Award;
    if (score >= 60) return Target;
    if (score >= 40) return Zap;
    return Activity;
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Net Worth"
          value={formatCurrency(summary.netWorth)}
          trend={2.5}
          icon={Wallet}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(summary.totalIncome)}
          trend={0.8}
          icon={TrendingUp}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(summary.totalExpenses)}
          trend={-1.2}
          icon={TrendingDown}
          color="text-rose-600"
          bgColor="bg-rose-50"
        />

        {/* Health Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={cn(
            "rounded-2xl p-6 text-white relative overflow-hidden shadow-xl",
            `bg-gradient-to-br ${healthScore ? getHealthScoreColor(healthScore.score) : 'from-slate-700 to-slate-800'}`
          )}
        >
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white/90 text-sm font-medium">Health Score</h3>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm">
                {healthScore?.status || 'Loading...'}
              </span>
            </div>
            <div className="flex items-baseline space-x-2 mb-3">
              <span className="text-5xl font-bold">{healthScore?.score ?? '--'}</span>
              <span className="text-white/70 text-lg">/100</span>
            </div>
            <p className="text-sm text-white/80 line-clamp-2">
              {healthScore?.insights[0] || 'Analyzing your financial patterns...'}
            </p>
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
          {healthScore && React.createElement(getHealthScoreIcon(healthScore.score), {
            className: "absolute right-4 bottom-4 text-white/20",
            size: 64
          })}
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <ForecastChart data={forecastData} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <SpendingPieChart transactions={transactions} />
        </motion.div>
      </div>

      {/* Budget & Goals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Target className="text-blue-600" size={24} />
            Monthly Budget
          </h3>
          <div className="space-y-5">
            {[
              { category: 'Food & Dining', spent: 450, budget: 600, color: 'bg-orange-500' },
              { category: 'Transportation', spent: 180, budget: 200, color: 'bg-blue-500' },
              { category: 'Entertainment', spent: 120, budget: 150, color: 'bg-purple-500' },
              { category: 'Shopping', spent: 280, budget: 300, color: 'bg-pink-500' }
            ].map((item) => {
              const percentage = (item.spent / item.budget) * 100;
              const isOverBudget = percentage > 90;
              return (
                <div key={item.category}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">{item.category}</span>
                    <span className={cn(
                      "font-medium",
                      isOverBudget ? "text-red-600" : "text-slate-600"
                    )}>
                      ${item.spent} / ${item.budget}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 1, delay: 0.8 }}
                      className={cn(
                        "h-full rounded-full transition-all",
                        isOverBudget ? "bg-red-500" : item.color
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Financial Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
        >
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Award size={24} />
              Savings Goals
            </h3>
            <div className="space-y-5">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold">Emergency Fund</span>
                  <span className="text-sm font-bold">75%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 1, delay: 0.9 }}
                    className="h-full bg-white rounded-full shadow-lg"
                  />
                </div>
                <p className="text-sm text-emerald-100">$7,500 of $10,000</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold">Vacation Fund</span>
                  <span className="text-sm font-bold">40%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '40%' }}
                    transition={{ duration: 1, delay: 1 }}
                    className="h-full bg-white rounded-full shadow-lg"
                  />
                </div>
                <p className="text-sm text-emerald-100">$1,200 of $3,000</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold">Investment Portfolio</span>
                  <span className="text-sm font-bold">25%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '25%' }}
                    transition={{ duration: 1, delay: 1.1 }}
                    className="h-full bg-white rounded-full shadow-lg"
                  />
                </div>
                <p className="text-sm text-emerald-100">$2,500 of $10,000</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">Recent Transactions</h3>
          <button className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors">
            View All →
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {transactions.slice(0, 6).map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.9 + idx * 0.05 }}
              className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                  t.type === TransactionType.INCOME 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                )}>
                  {t.type === TransactionType.INCOME ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{t.description}</p>
                  <p className="text-sm text-slate-500">{t.category} • {t.date}</p>
                </div>
              </div>
              <span className={cn(
                "font-bold text-lg",
                t.type === TransactionType.INCOME ? 'text-green-600' : 'text-slate-900'
              )}>
                {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount)}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Insights Card */}
      {healthScore && healthScore.insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Zap size={28} />
              </div>
              <h3 className="text-2xl font-bold">AI Financial Insights</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {healthScore.insights.map((insight, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 1.1 + idx * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-2xl">💡</span>
                    <p className="text-sm text-white/90 leading-relaxed">{insight}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </motion.div>
      )}
    </div>
  );
};