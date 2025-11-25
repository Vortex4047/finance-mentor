import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateMockTransactions, generateForecastData } from './mockData';
import { Transaction, ForecastPoint, HealthScore, Category, TransactionType } from './types';
import { Dashboard } from './components/Dashboard';
import { Chatbot } from './components/Chatbot';
import { TransactionForm } from './components/TransactionForm';
import { BudgetManager } from './components/BudgetManager';
import { SavingsGoals } from './components/SavingsGoals';
import { TransactionList } from './components/TransactionList';
import { NotificationToast } from './components/NotificationToast';
import { TransactionFilters } from './components/TransactionFilters';
import { SpendingInsights } from './components/SpendingInsights';
import { ExportModal } from './components/ExportModal';
import { SidebarStats } from './components/SidebarStats';
import { NotificationCenter } from './components/NotificationCenter';
import { FinancialInsights } from './components/FinancialInsights';
import { getQuickInsights } from './services/localAIService';
import { useTheme } from './contexts/ThemeContext';
import { 
  LayoutDashboard, MessageSquare, FileBarChart, User, Menu, Printer, 
  Upload, Plus, TrendingUp, Bell, Settings, LogOut, Search, Download,
  Sparkles, X, Target, List, Moon, Sun, PieChart
} from 'lucide-react';
import { cn } from './lib/utils';

const App = () => {
  const { isDark, toggleTheme } = useTheme();
  
  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track screen size for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialization
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    let initialTransactions: Transaction[] = [];

    if (savedTransactions) {
      try {
        initialTransactions = JSON.parse(savedTransactions);
      } catch (e) {
        console.error("Failed to parse transactions from local storage", e);
        initialTransactions = generateMockTransactions();
      }
    } else {
      initialTransactions = generateMockTransactions();
    }

    setTransactions(initialTransactions);
    setForecast(generateForecastData(initialTransactions));

    const summary = {
      totalIncome: initialTransactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0),
      totalExpenses: initialTransactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0),
      netWorth: 15000 + initialTransactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0) - initialTransactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0),
      savingsRate: 0.2
    };
    
    if (summary.totalIncome > 0) {
        summary.savingsRate = (summary.totalIncome - summary.totalExpenses) / summary.totalIncome;
    }

    // Calculate health score locally
    const insights = getQuickInsights(summary, initialTransactions);
    let score = 100;
    
    if (summary.savingsRate < 0.1) score -= 30;
    else if (summary.savingsRate < 0.2) score -= 15;
    
    const expenses = initialTransactions.filter(t => t.type === 'expense');
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    const maxCategorySpend = Math.max(...Object.values(categoryTotals));
    const totalExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    if (totalExpenses > 0 && (maxCategorySpend / totalExpenses) > 0.4) {
      score -= 20;
    }
    
    const status = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work';
    
    setHealthScore({
      score: Math.max(0, score),
      status,
      insights
    });
  }, []);

  // Persistence
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  const handlePrintReport = () => {
    window.print();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const processCSV = (csvText: string) => {
    try {
      const lines = csvText.split('\n');
      if (lines.length < 2) throw new Error("File is empty or missing headers");

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));

      const colMap = {
        date: headers.findIndex(h => h.includes('date')),
        amount: headers.findIndex(h => h.includes('amount')),
        description: headers.findIndex(h => h.includes('desc') || h.includes('narr')),
        type: headers.findIndex(h => h.includes('type') || h.includes('cr/dr')),
        category: headers.findIndex(h => h.includes('cat'))
      };

      if (colMap.date === -1 || colMap.amount === -1) {
        alert("CSV must contain at least 'Date' and 'Amount' columns.");
        return;
      }

      const newTransactions: Transaction[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));

        if (values.length < Math.min(colMap.date, colMap.amount) + 1) continue;

        const dateStr = values[colMap.date];
        const amountStr = values[colMap.amount];
        const desc = colMap.description > -1 ? values[colMap.description] : 'Imported Transaction';
        const typeStr = colMap.type > -1 ? values[colMap.type].toLowerCase() : '';
        const catStr = colMap.category > -1 ? values[colMap.category] : '';

        const amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, ''));
        if (isNaN(amount)) continue;

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) continue;

        let type = TransactionType.EXPENSE;
        let category = Category.MISC;
        const lowerCat = catStr.toLowerCase();
        const lowerDesc = desc.toLowerCase();

        const matchedCatKey = Object.keys(Category).find(k => Category[k as keyof typeof Category].toLowerCase() === lowerCat);
        if (matchedCatKey) {
          category = Category[matchedCatKey as keyof typeof Category];
        } else {
          if (lowerDesc.includes('grocery') || lowerDesc.includes('food') || lowerDesc.includes('mart')) category = Category.FOOD;
          else if (lowerDesc.includes('rent') || lowerDesc.includes('mortgage')) category = Category.HOUSING;
          else if (lowerDesc.includes('salary') || lowerDesc.includes('payroll') || lowerDesc.includes('deposit')) { category = Category.INCOME; }
          else if (lowerDesc.includes('uber') || lowerDesc.includes('lyft') || lowerDesc.includes('gas') || lowerDesc.includes('fuel')) category = Category.TRANSPORT;
          else if (lowerDesc.includes('electric') || lowerDesc.includes('water') || lowerDesc.includes('internet')) category = Category.UTILITIES;
          else if (lowerDesc.includes('netflix') || lowerDesc.includes('movie') || lowerDesc.includes('cinema')) category = Category.ENTERTAINMENT;
          else if (lowerDesc.includes('pharmacy') || lowerDesc.includes('doctor')) category = Category.HEALTH;
          else if (lowerDesc.includes('amazon') || lowerDesc.includes('store')) category = Category.SHOPPING;
        }

        if (category === Category.INCOME) {
          type = TransactionType.INCOME;
        } else if (typeStr === 'income' || typeStr === 'credit' || typeStr === 'cr') {
          type = TransactionType.INCOME;
          category = Category.INCOME;
        }

        newTransactions.push({
          id: Math.random().toString(36).substr(2, 9),
          date: date.toISOString().split('T')[0],
          amount: Math.abs(amount),
          type: type,
          category: category,
          description: desc
        });
      }

      if (newTransactions.length > 0) {
        const updated = [...newTransactions, ...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(updated);
        setForecast(generateForecastData(updated));

        const summary = {
          totalIncome: updated.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0),
          totalExpenses: updated.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0),
          netWorth: 15000 + updated.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0) - updated.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0),
          savingsRate: summary.totalIncome > 0 ? (summary.totalIncome - summary.totalExpenses) / summary.totalIncome : 0
        };

        // Recalculate health score
        const insights = getQuickInsights(summary, updated);
        let score = 100;
        
        if (summary.savingsRate < 0.1) score -= 30;
        else if (summary.savingsRate < 0.2) score -= 15;
        
        const status = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work';
        
        setHealthScore({
          score: Math.max(0, score),
          status,
          insights
        });

        addNotification(`✅ Imported ${newTransactions.length} transactions`);
      } else {
        alert("No valid transactions found in CSV.");
      }

    } catch (error) {
      console.error(error);
      alert("Error parsing CSV file. Please ensure it has headers like: Date, Description, Amount, Category");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      processCSV(text);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: Math.random().toString(36).substr(2, 9)
    };

    const updated = [transaction, ...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(updated);
    setForecast(generateForecastData(updated));

    const summary = {
      totalIncome: updated.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0),
      totalExpenses: updated.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0),
      netWorth: 15000 + updated.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0) - updated.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0),
      savingsRate: 0
    };
    
    if (summary.totalIncome > 0) {
      summary.savingsRate = (summary.totalIncome - summary.totalExpenses) / summary.totalIncome;
    }

    // Recalculate health score
    const insights = getQuickInsights(summary, updated);
    let score = 100;
    
    if (summary.savingsRate < 0.1) score -= 30;
    else if (summary.savingsRate < 0.2) score -= 15;
    
    const status = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work';
    
    setHealthScore({
      score: Math.max(0, score),
      status,
      insights
    });
    setShowAddTransaction(false);

    addNotification(`${newTx.type === 'income' ? '💰' : '💸'} Added ${newTx.type}: $${newTx.amount.toFixed(2)}`);
  };

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => setNotifications(prev => prev.slice(1)), 3000);
  };

  return (
    <div className="flex min-h-screen bg-mesh-gradient font-sans text-slate-900 dark:text-slate-100 dark:bg-slate-900 transition-colors duration-500">

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />

      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isDesktop || isSidebarOpen ? 0 : '-100%' }}
        className={cn(
          "fixed top-0 left-0 z-30 h-screen w-72 glass-morphism shadow-2xl transform transition-transform duration-500 ease-out lg:translate-x-0",
          "no-print dark:bg-slate-900/50"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-700">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg glow-animate"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="text-white" size={22} />
            </motion.div>
            <div>
              <span className="text-xl font-bold gradient-text gradient-animate">
                Finance Mentor
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI-Powered</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <motion.button
              onClick={() => setActiveTab('dashboard')}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center px-4 py-3.5 rounded-xl transition-all font-medium duration-300",
                activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <LayoutDashboard size={20} className="mr-3" />
              Dashboard
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('insights')}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center px-4 py-3.5 rounded-xl transition-all font-medium duration-300",
                activeTab === 'insights' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <PieChart size={20} className="mr-3" />
              Insights
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('transactions')}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center px-4 py-3.5 rounded-xl transition-all font-medium duration-300",
                activeTab === 'transactions' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <List size={20} className="mr-3" />
              Transactions
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('budgets')}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center px-4 py-3.5 rounded-xl transition-all font-medium duration-300",
                activeTab === 'budgets' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <Target size={20} className="mr-3" />
              Budgets
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('goals')}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center px-4 py-3.5 rounded-xl transition-all font-medium duration-300",
                activeTab === 'goals' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <TrendingUp size={20} className="mr-3" />
              Savings Goals
            </motion.button>
            <motion.button
              onClick={() => setIsChatOpen(true)}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium duration-300"
            >
              <MessageSquare size={20} className="mr-3" />
              AI Assistant
              <span className="ml-auto bg-green-500 w-2 h-2 rounded-full pulse-ring" />
            </motion.button>

            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
              <motion.button
                onClick={() => setShowAddTransaction(true)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center px-4 py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-xl hover:shadow-green-200 dark:hover:shadow-green-900/50 transition-all font-semibold shadow-md hover-lift"
              >
                <Plus size={20} className="mr-2" />
                Add Transaction
              </motion.button>
            </div>

            <div className="pt-4 space-y-1">
              <button 
                onClick={toggleTheme}
                className="w-full flex items-center px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-all text-sm"
              >
                {isDark ? <Sun size={18} className="mr-3" /> : <Moon size={18} className="mr-3" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button className="w-full flex items-center px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-all text-sm">
                <Settings size={18} className="mr-3" />
                Settings
              </button>
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center p-3 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 hover:shadow-md transition-all cursor-pointer">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                <User size={20} />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-slate-900">Demo User</p>
                <p className="text-xs text-slate-500">Premium Plan</p>
              </div>
              <LogOut size={16} className="text-slate-400" />
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-w-0">
        {/* Mobile Header */}
        <div className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 lg:hidden flex items-center px-4 justify-between no-print sticky top-0 z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu size={24} />
          </button>
          <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Finance Mentor
          </span>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4"
          >
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                {activeTab === 'dashboard' && 'Financial Overview'}
                {activeTab === 'insights' && 'Spending Insights'}
                {activeTab === 'transactions' && 'Transaction History'}
                {activeTab === 'budgets' && 'Budget Management'}
                {activeTab === 'goals' && 'Savings Goals'}
              </h1>
              <p className="text-slate-500">
                {activeTab === 'dashboard' && "Welcome back! Here's your financial health summary."}
                {activeTab === 'insights' && 'Analyze your spending patterns and trends'}
                {activeTab === 'transactions' && 'View and manage all your transactions'}
                {activeTab === 'budgets' && 'Track your spending against budgets'}
                {activeTab === 'goals' && 'Monitor progress towards your financial goals'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 no-print">
              <motion.button
                onClick={() => setShowExportModal(true)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-xl hover:shadow-purple-200 dark:hover:shadow-purple-900/50 transition-all font-semibold shadow-md"
              >
                <Download size={18} className="mr-2" />
                Export
              </motion.button>
              <motion.button
                onClick={() => setShowAddTransaction(true)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-xl hover:shadow-green-200 dark:hover:shadow-green-900/50 transition-all font-semibold shadow-md"
              >
                <Plus size={18} className="mr-2" />
                Add
              </motion.button>
              <motion.button
                onClick={handleImportClick}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all font-medium shadow-sm"
              >
                <Upload size={18} className="mr-2" />
                Import
              </motion.button>
              <motion.button
                onClick={handlePrintReport}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all font-medium shadow-sm"
              >
                <Download size={18} className="mr-2" />
                Export
              </motion.button>
              <motion.button
                onClick={() => setIsChatOpen(!isChatOpen)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl hover:shadow-blue-200 dark:hover:shadow-blue-900/50 transition-all font-semibold shadow-md relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <MessageSquare size={18} className="mr-2 relative z-10" />
                <span className="relative z-10">AI Chat</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Content Based on Active Tab */}
          {activeTab === 'dashboard' && (
            <Dashboard
              transactions={transactions}
              forecastData={forecast}
              healthScore={healthScore}
            />
          )}
          {activeTab === 'insights' && (
            <SpendingInsights transactions={transactions} />
          )}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <TransactionFilters
                transactions={transactions}
                onFilteredTransactions={setFilteredTransactions}
              />
              <TransactionList transactions={filteredTransactions.length > 0 ? filteredTransactions : transactions} />
            </div>
          )}
          {activeTab === 'budgets' && (
            <BudgetManager transactions={transactions} />
          )}
          {activeTab === 'goals' && (
            <SavingsGoals />
          )}
        </div>
      </main>

      {/* Chat */}
      <Chatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        summary={{
          totalIncome: transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0),
          totalExpenses: transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0),
          netWorth: 15420,
          savingsRate: 0.2
        }}
        recentTransactions={transactions.slice(0, 10)}
      />

      {/* Add Transaction Modal */}
      <TransactionForm
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        onSubmit={handleAddTransaction}
      />

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-3 no-print">
        <AnimatePresence mode="popLayout">
          {notifications.map((notif, idx) => (
            <NotificationToast
              key={idx}
              message={notif}
              type="success"
              onClose={() => setNotifications(prev => prev.filter((_, i) => i !== idx))}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        transactions={transactions}
      />

    </div>
  );
};

export default App;
