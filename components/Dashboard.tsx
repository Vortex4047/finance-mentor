import React, { useMemo } from 'react';
import { Transaction, TransactionType, FinancialSummary, ForecastPoint, HealthScore } from '../types';
import { ForecastChart, SpendingPieChart } from './Charts';
import { ArrowUpRight, ArrowDownRight, Wallet, Activity, FileText, TrendingUp } from 'lucide-react';

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
      netWorth: 15420 + income - expenses, // Mock starting base
      savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0
    };
  }, [transactions]);

  const StatCard = ({ title, value, trend, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`${color.replace('bg-', 'text-')}`} size={24} />
        </div>
        {trend && (
          <span className={`flex items-center text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend > 0 ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Net Worth" 
          value={`$${summary.netWorth.toLocaleString()}`} 
          trend={2.5} 
          icon={Wallet} 
          color="bg-blue-600" 
        />
        <StatCard 
          title="Monthly Income" 
          value={`$${summary.totalIncome.toLocaleString()}`} 
          trend={0.8} 
          icon={TrendingUp} 
          color="bg-emerald-600" 
        />
        <StatCard 
          title="Monthly Spend" 
          value={`$${summary.totalExpenses.toLocaleString()}`} 
          trend={-1.2} 
          icon={Activity} 
          color="bg-rose-500" 
        />
        
        {/* Health Score Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-slate-300 text-sm font-medium">Health Score</h3>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                healthScore?.status === 'Excellent' ? 'bg-green-500' : 'bg-yellow-500'
              } text-slate-900`}>
                {healthScore?.status || 'Loading...'}
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
               <span className="text-4xl font-bold">{healthScore?.score ?? '--'}</span>
               <span className="text-slate-400">/100</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 truncate">
              {healthScore?.insights[0] || 'Analyzing financial patterns...'}
            </p>
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 transform translate-x-10 -translate-y-10 pointer-events-none"></div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ForecastChart data={forecastData} />
        </div>
        <div className="lg:col-span-1">
          <SpendingPieChart transactions={transactions} />
        </div>
      </div>

      {/* Budget & Goals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Tracker */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Budget</h3>
          <div className="space-y-4">
            {[
              { category: 'Food & Dining', spent: 450, budget: 600, color: 'bg-orange-500' },
              { category: 'Transportation', spent: 180, budget: 200, color: 'bg-blue-500' },
              { category: 'Entertainment', spent: 120, budget: 150, color: 'bg-purple-500' },
              { category: 'Shopping', spent: 280, budget: 300, color: 'bg-pink-500' }
            ].map((item) => {
              const percentage = (item.spent / item.budget) * 100;
              return (
                <div key={item.category}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">{item.category}</span>
                    <span className="text-gray-500">${item.spent} / ${item.budget}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full ${item.color} transition-all duration-500`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Goals */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-sm p-6 text-white">
          <h3 className="text-lg font-bold mb-4">Savings Goals</h3>
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Emergency Fund</span>
                <span className="text-sm">75%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div className="h-full bg-white rounded-full" style={{ width: '75%' }} />
              </div>
              <p className="text-xs text-emerald-100">$7,500 of $10,000</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Vacation Fund</span>
                <span className="text-sm">40%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div className="h-full bg-white rounded-full" style={{ width: '40%' }} />
              </div>
              <p className="text-xs text-emerald-100">$1,200 of $3,000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
          <button className="text-sm text-primary font-medium hover:underline">View All</button>
        </div>
        <div className="divide-y divide-gray-100">
          {transactions.slice(0, 5).map((t) => (
            <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  t.type === TransactionType.INCOME ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                }`}>
                  {t.type === TransactionType.INCOME ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t.description}</p>
                  <p className="text-xs text-gray-500">{t.category} • {t.date}</p>
                </div>
              </div>
              <span className={`font-semibold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-gray-900'}`}>
                {t.type === TransactionType.INCOME ? '+' : '-'}${t.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights Card */}
      {healthScore && healthScore.insights.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-lg font-bold">AI Financial Insights</h3>
          </div>
          <div className="space-y-2">
            {healthScore.insights.map((insight, idx) => (
              <div key={idx} className="flex items-start space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <span className="text-white/80 text-sm">•</span>
                <p className="text-sm text-white/90">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};