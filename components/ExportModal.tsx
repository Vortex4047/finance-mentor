import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, X, Calendar } from 'lucide-react';
import { Transaction } from '../types';
import { format } from 'date-fns';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, transactions }) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'year' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filterTransactionsByDate = () => {
    if (dateRange === 'all') return transactions;

    const now = new Date();
    let filtered = transactions;

    if (dateRange === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = transactions.filter(t => new Date(t.date) >= monthAgo);
    } else if (dateRange === 'year') {
      const yearAgo = new Date(now.getFullYear(), 0, 1);
      filtered = transactions.filter(t => new Date(t.date) >= yearAgo);
    } else if (dateRange === 'custom' && startDate && endDate) {
      filtered = transactions.filter(t => {
        const date = new Date(t.date);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });
    }

    return filtered;
  };

  const exportToCSV = () => {
    const filtered = filterTransactionsByDate();
    
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = filtered.map(t => [
      format(new Date(t.date), 'yyyy-MM-dd'),
      t.type,
      t.category,
      t.description,
      t.amount.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    downloadFile(csvContent, 'transactions.csv', 'text/csv');
  };

  const exportToJSON = () => {
    const filtered = filterTransactionsByDate();
    const jsonContent = JSON.stringify(filtered, null, 2);
    downloadFile(jsonContent, 'transactions.json', 'application/json');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV();
    } else {
      exportToJSON();
    }
    onClose();
  };

  if (!isOpen) return null;

  const filteredCount = filterTransactionsByDate().length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Download size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Export Transactions</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Download your financial data
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={18} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setExportFormat('csv')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    exportFormat === 'csv'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <FileText size={24} className={exportFormat === 'csv' ? 'text-blue-600' : 'text-slate-400'} />
                  <p className={`mt-2 font-medium ${exportFormat === 'csv' ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'}`}>
                    CSV
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Excel compatible</p>
                </button>
                <button
                  onClick={() => setExportFormat('json')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    exportFormat === 'json'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <FileText size={24} className={exportFormat === 'json' ? 'text-blue-600' : 'text-slate-400'} />
                  <p className={`mt-2 font-medium ${exportFormat === 'json' ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'}`}>
                    JSON
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Developer friendly</p>
                </button>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {dateRange === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Summary */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-slate-100">{filteredCount}</strong> transactions will be exported
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={dateRange === 'custom' && (!startDate || !endDate)}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
