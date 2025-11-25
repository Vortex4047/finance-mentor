import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat, Plus, Edit2, Trash2, Calendar, X } from 'lucide-react';
import { Category, TransactionType } from '../types';
import { cn } from '../lib/utils';

interface RecurringTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  nextDate: string;
  isActive: boolean;
}

interface RecurringTransactionsProps {
  onAddTransaction: (transaction: {
    type: TransactionType;
    amount: number;
    category: Category;
    description: string;
    date: string;
  }) => void;
}

export const RecurringTransactions: React.FC<RecurringTransactionsProps> = ({ onAddTransaction }) => {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>(() => {
    const saved = localStorage.getItem('recurringTransactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: 'expense' as TransactionType,
    amount: '',
    category: Category.MISC,
    description: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate: new Date().toISOString().split('T')[0]
  });

  const calculateNextDate = (startDate: string, frequency: string): string => {
    const date = new Date(startDate);
    const now = new Date();
    
    while (date < now) {
      switch (frequency) {
        case 'daily':
          date.setDate(date.getDate() + 1);
          break;
        case 'weekly':
          date.setDate(date.getDate() + 7);
          break;
        case 'monthly':
          date.setMonth(date.getMonth() + 1);
          break;
        case 'yearly':
          date.setFullYear(date.getFullYear() + 1);
          break;
      }
    }
    
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRecurring: RecurringTransaction = {
      id: editingId || Date.now().toString(),
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      frequency: formData.frequency,
      startDate: formData.startDate,
      nextDate: calculateNextDate(formData.startDate, formData.frequency),
      isActive: true
    };

    if (editingId) {
      setRecurring(prev => {
        const updated = prev.map(r => r.id === editingId ? newRecurring : r);
        localStorage.setItem('recurringTransactions', JSON.stringify(updated));
        return updated;
      });
    } else {
      setRecurring(prev => {
        const updated = [...prev, newRecurring];
        localStorage.setItem('recurringTransactions', JSON.stringify(updated));
        return updated;
      });
    }

    setShowAddModal(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      category: Category.MISC,
      description: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleEdit = (rec: RecurringTransaction) => {
    setFormData({
      type: rec.type,
      amount: rec.amount.toString(),
      category: rec.category,
      description: rec.description,
      frequency: rec.frequency,
      startDate: rec.startDate
    });
    setEditingId(rec.id);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    setRecurring(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('recurringTransactions', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleActive = (id: string) => {
    setRecurring(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r);
      localStorage.setItem('recurringTransactions', JSON.stringify(updated));
      return updated;
    });
  };

  const handleExecuteNow = (rec: RecurringTransaction) => {
    onAddTransaction({
      type: rec.type,
      amount: rec.amount,
      category: rec.category,
      description: `${rec.description} (Recurring)`,
      date: new Date().toISOString()
    });

    // Update next date
    const newNextDate = calculateNextDate(rec.nextDate, rec.frequency);
    setRecurring(prev => {
      const updated = prev.map(r => r.id === rec.id ? { ...r, nextDate: newNextDate } : r);
      localStorage.setItem('recurringTransactions', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Recurring Transactions
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Automate your regular income and expenses
          </p>
        </div>
        <motion.button
          onClick={() => setShowAddModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={18} className="mr-2" />
          Add Recurring
        </motion.button>
      </div>

      {/* Recurring List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recurring.map((rec) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "p-6 rounded-xl border transition-all",
              rec.isActive
                ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                : "bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 opacity-60"
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  rec.type === 'income' ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
                )}>
                  <Repeat size={20} className={rec.type === 'income' ? "text-green-600" : "text-red-600"} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{rec.description}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{rec.category}</p>
                </div>
              </div>
              <span className={cn(
                "text-lg font-bold",
                rec.type === 'income' ? "text-green-600" : "text-red-600"
              )}>
                {rec.type === 'income' ? '+' : '-'}${rec.amount.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <Calendar size={16} className="mr-2" />
                <span className="capitalize">{rec.frequency}</span>
                <span className="mx-2">•</span>
                <span>Next: {new Date(rec.nextDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleExecuteNow(rec)}
                disabled={!rec.isActive}
                className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Execute Now
              </button>
              <button
                onClick={() => handleToggleActive(rec.id)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  rec.isActive
                    ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                )}
              >
                {rec.isActive ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={() => handleEdit(rec)}
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(rec.id)}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {recurring.length === 0 && (
        <div className="text-center py-12">
          <Repeat size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400">No recurring transactions yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">Add one to automate your regular payments</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowAddModal(false); setEditingId(null); resetForm(); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {editingId ? 'Edit' : 'Add'} Recurring Transaction
                </h3>
                <button
                  onClick={() => { setShowAddModal(false); setEditingId(null); resetForm(); }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {Object.values(Category).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., Monthly Rent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setEditingId(null); resetForm(); }}
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    {editingId ? 'Update' : 'Add'}
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