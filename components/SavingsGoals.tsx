import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Edit2, Trash2, TrendingUp } from 'lucide-react';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
}

export const SavingsGoals: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('savingsGoals');
    return saved ? JSON.parse(saved) : [];
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', targetAmount: 0, currentAmount: 0, deadline: '', color: '#3b82f6' });

  const saveGoals = (newGoals: SavingsGoal[]) => {
    setGoals(newGoals);
    localStorage.setItem('savingsGoals', JSON.stringify(newGoals));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      saveGoals(goals.map(g => g.id === editingId ? { ...formData, id: editingId } : g));
    } else {
      saveGoals([...goals, { ...formData, id: Math.random().toString(36).substr(2, 9) }]);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', targetAmount: 0, currentAmount: 0, deadline: '', color: '#3b82f6' });
  };

  const handleEdit = (goal: SavingsGoal) => {
    setFormData({ name: goal.name, targetAmount: goal.targetAmount, currentAmount: goal.currentAmount, deadline: goal.deadline, color: goal.color });
    setEditingId(goal.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    saveGoals(goals.filter(g => g.id !== id));
  };

  const handleAddFunds = (id: string, amount: number) => {
    saveGoals(goals.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Savings Goals</h2>
          <p className="text-slate-500 text-sm">Track your financial targets</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
        >
          <Plus size={18} className="mr-2" />
          Add Goal
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map(goal => {
          const percentage = (goal.currentAmount / goal.targetAmount) * 100;
          const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${goal.color}20` }}>
                    <Target size={24} style={{ color: goal.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{goal.name}</h3>
                    <p className="text-xs text-slate-500">{daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(goal)} className="text-slate-400 hover:text-blue-600">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(goal.id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-semibold text-slate-900">
                    ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                  </span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: goal.color }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: goal.color }}>
                    {percentage.toFixed(0)}% complete
                  </span>
                  <button
                    onClick={() => {
                      const amount = prompt('Add amount:');
                      if (amount) handleAddFunds(goal.id, parseFloat(amount));
                    }}
                    className="text-xs px-3 py-1 rounded-lg hover:shadow-md transition-all text-white"
                    style={{ backgroundColor: goal.color }}
                  >
                    Add Funds
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {goals.length === 0 && !showForm && (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <TrendingUp size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 mb-4">No savings goals yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Create your first goal
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
              <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Goal' : 'Add Savings Goal'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Goal Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Emergency Fund"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Target Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.targetAmount || ''}
                    onChange={e => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.currentAmount || ''}
                    onChange={e => setFormData({ ...formData, currentAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-12 border border-slate-200 rounded-xl cursor-pointer"
                  />
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
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg"
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
