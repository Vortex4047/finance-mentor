import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Edit2, Trash2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Category, Transaction } from '../types';

interface Budget {
  id: string;
  category: Category;
  limit: number;
  period: 'monthly' | 'weekly';
}

interface BudgetManagerProps {
  transactions: Transaction[];
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({ transactions }) => {
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('budgets');
    return saved ? JSON.parse(saved) : [];
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ category: Category.FOOD, limit: 0, period: 'monthly' as const });

  const saveBudgets = (newBudgets: Budget[]) => {
    setBudgets(newBudgets);
    localStorage.setItem('budgets', JSON.stringify(newBudgets));
  };

  const calculateSpent = (budget: Budget) => {
    const now = new Date();
    const startDate = budget.period === 'monthly' 
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return transactions
      .filter(t => t.type === 'expense' && t.category === budget.category && new Date(t.date) >= startDate)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      saveBudgets(budgets.map(b => b.id === editingId ? { ...formData, id: editingId } : b));
    } else {
      saveBudgets([...budgets, { ...formData, id: Math.random().toString(36).substr(2, 9) }]);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({ category: Category.FOOD, limit: 0, period: 'monthly' });
  };

  const handleEdit = (budget: Budget) => {
    setFormData({ category: budget.category, limit: budget.limit, period: budget.period });
    setEditingId(budget.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    saveBudgets(budgets.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Budget Manager</h2>
          <p className="text-slate-500 text-sm">Set spending limits by category</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
        >
          <Plus size={18} className="mr-2" />
          Add Budget
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map(budget => {
          const spent = calculateSpent(budget);
          const percentage = (spent / budget.limit) * 100;
          const isOverBudget = spent > budget.limit;

          return (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{budget.category}</h3>
                  <p className="text-xs text-slate-500 capitalize">{budget.period}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(budget)} className="text-slate-400 hover:text-blue-600">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(budget.id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Spent</span>
                  <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-slate-900'}`}>
                    ${spent.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Budget</span>
                  <span className="font-semibold text-slate-900">${budget.limit.toFixed(2)}</span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    className={`h-full rounded-full ${
                      isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-slate-600'}`}>
                    {percentage.toFixed(0)}% used
                  </span>
                  {isOverBudget ? (
                    <span className="flex items-center text-red-600">
                      <AlertCircle size={14} className="mr-1" />
                      Over budget
                    </span>
                  ) : (
                    <span className="text-green-600">${(budget.limit - spent).toFixed(2)} left</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {budgets.length === 0 && !showForm && (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <Target size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 mb-4">No budgets set yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first budget
          </button>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowForm(false); setEditingId(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Budget' : 'Add Budget'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.values(Category).filter(c => c !== Category.INCOME).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Budget Limit</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.limit || ''}
                    onChange={e => setFormData({ ...formData, limit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Period</label>
                  <select
                    value={formData.period}
                    onChange={e => setFormData({ ...formData, period: e.target.value as 'monthly' | 'weekly' })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingId(null); }}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg"
                  >
                    {editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
