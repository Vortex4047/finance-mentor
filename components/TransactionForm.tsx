import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar, DollarSign, Tag, FileText, CheckCircle2 } from 'lucide-react';
import { Transaction, Category, TransactionType } from '../types';
import { cn } from '../lib/utils';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      onSubmit({
        date,
        amount: parseFloat(amount),
        type,
        category,
        description: description || 'No description',
      });
      
      // Reset form
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Plus size={24} />
                </div>
                Add Transaction
              </h2>
              <p className="text-blue-100 text-sm mt-1">Track your income or expenses</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Type Selection */}
            <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setType(TransactionType.EXPENSE)}
                className={cn(
                  "py-3 text-sm font-semibold rounded-xl transition-all duration-200",
                  type === TransactionType.EXPENSE
                    ? 'bg-white text-red-600 shadow-lg shadow-red-100'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                💸 Expense
              </button>
              <button
                type="button"
                onClick={() => setType(TransactionType.INCOME)}
                className={cn(
                  "py-3 text-sm font-semibold rounded-xl transition-all duration-200",
                  type === TransactionType.INCOME
                    ? 'bg-white text-green-600 shadow-lg shadow-green-100'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                💰 Income
              </button>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Amount</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg font-semibold"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Category</label>
              <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10" size={20} />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  {Object.values(Category).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Date</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10" size={20} />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Description</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="What was this for?"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg",
                isSubmitting
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 size={20} />
                  Save Transaction
                </span>
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
