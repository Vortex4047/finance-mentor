import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, ArrowUpDown, Calendar, DollarSign } from 'lucide-react';
import { Transaction, Category, TransactionType } from '../types';
import { format } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | Category>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });

    filtered.sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'date') {
        return multiplier * (new Date(a.date).getTime() - new Date(b.date).getTime());
      }
      return multiplier * (a.amount - b.amount);
    });

    return filtered;
  }, [transactions, searchTerm, filterType, filterCategory, sortBy, sortOrder]);

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Amount', 'Type', 'Category'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.description,
      t.amount.toFixed(2),
      t.type,
      t.category
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Transactions</h2>
          <p className="text-slate-500 text-sm">{filteredTransactions.length} transactions</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center px-4 py-2 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium"
        >
          <Download size={18} className="mr-2" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value={TransactionType.INCOME}>Income</option>
            <option value={TransactionType.EXPENSE}>Expense</option>
          </select>

          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as any)}
            className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {Object.values(Category).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => toggleSort('date')}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-xl border transition-all ${
                sortBy === 'date' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <Calendar size={16} className="mr-1" />
              Date
              {sortBy === 'date' && <ArrowUpDown size={14} className="ml-1" />}
            </button>
            <button
              onClick={() => toggleSort('amount')}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-xl border transition-all ${
                sortBy === 'amount' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <DollarSign size={16} className="mr-1" />
              Amount
              {sortBy === 'amount' && <ArrowUpDown size={14} className="ml-1" />}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No transactions found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTransactions.map((transaction, idx) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <span className="text-2xl">
                          {transaction.type === 'income' ? '💰' : '💸'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{transaction.description}</p>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span>{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
                          <span>•</span>
                          <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs">
                            {transaction.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
