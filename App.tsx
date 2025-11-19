import React, { useEffect, useState, useRef } from 'react';
import { generateMockTransactions, generateForecastData } from './mockData';
import { Transaction, ForecastPoint, HealthScore, Category, TransactionType } from './types';
import { Dashboard } from './components/Dashboard';
import { Chatbot } from './components/Chatbot';
import { getHealthScoreAnalysis } from './services/geminiService';
import { LayoutDashboard, MessageSquare, FileBarChart, User, Menu, Printer, Upload, Plus, TrendingUp, Bell } from 'lucide-react';

const App = () => {
  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialization
  useEffect(() => {
    const mockTx = generateMockTransactions();
    setTransactions(mockTx);
    setForecast(generateForecastData(mockTx));
    
    // Simulate async analysis
    const summary = {
        totalIncome: mockTx.filter(t => t.type === 'income').reduce((a,b) => a + b.amount, 0),
        totalExpenses: mockTx.filter(t => t.type === 'expense').reduce((a,b) => a + b.amount, 0),
        netWorth: 15000,
        savingsRate: 0.2
    };
    
    getHealthScoreAnalysis(summary, mockTx).then(setHealthScore);
  }, []);

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

      // Start from index 1 to skip headers
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

        // Parse Amount
        const amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, ''));
        if (isNaN(amount)) continue;

        // Parse Date
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) continue;

        // Determine Type & Category
        let type = TransactionType.EXPENSE;
        let category = Category.MISC;
        const lowerCat = catStr.toLowerCase();
        const lowerDesc = desc.toLowerCase();
        
        // Category Logic
        const matchedCatKey = Object.keys(Category).find(k => Category[k as keyof typeof Category].toLowerCase() === lowerCat);
        if (matchedCatKey) {
             category = Category[matchedCatKey as keyof typeof Category];
        } else {
             // Heuristic guess
             if (lowerDesc.includes('grocery') || lowerDesc.includes('food') || lowerDesc.includes('mart')) category = Category.FOOD;
             else if (lowerDesc.includes('rent') || lowerDesc.includes('mortgage')) category = Category.HOUSING;
             else if (lowerDesc.includes('salary') || lowerDesc.includes('payroll') || lowerDesc.includes('deposit')) { category = Category.INCOME; }
             else if (lowerDesc.includes('uber') || lowerDesc.includes('lyft') || lowerDesc.includes('gas') || lowerDesc.includes('fuel')) category = Category.TRANSPORT;
             else if (lowerDesc.includes('electric') || lowerDesc.includes('water') || lowerDesc.includes('internet')) category = Category.UTILITIES;
             else if (lowerDesc.includes('netflix') || lowerDesc.includes('movie') || lowerDesc.includes('cinema')) category = Category.ENTERTAINMENT;
             else if (lowerDesc.includes('pharmacy') || lowerDesc.includes('doctor')) category = Category.HEALTH;
             else if (lowerDesc.includes('amazon') || lowerDesc.includes('store')) category = Category.SHOPPING;
        }

        // Type Logic
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
        const updated = [...newTransactions, ...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(updated);
        
        // Update Forecast
        setForecast(generateForecastData(updated));

        // Recalculate Health Score
        const summary = {
            totalIncome: updated.filter(t => t.type === 'income').reduce((a,b) => a + b.amount, 0),
            totalExpenses: updated.filter(t => t.type === 'expense').reduce((a,b) => a + b.amount, 0),
            netWorth: 15000 + updated.filter(t => t.type === 'income').reduce((a,b) => a + b.amount, 0) - updated.filter(t => t.type === 'expense').reduce((a,b) => a + b.amount, 0),
            savingsRate: 0 
        };
        
        // Optimistic Score Update before AI analysis
        setHealthScore(prev => prev ? { ...prev, status: 'Fair', insights: ['Analyzing new data...'] } : null);
        getHealthScoreAnalysis(summary, updated).then(setHealthScore);

        alert(`Successfully imported ${newTransactions.length} transactions.`);
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
    // Reset input
    event.target.value = '';
  };

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    const updated = [transaction, ...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(updated);
    setForecast(generateForecastData(updated));
    
    // Recalculate health score
    const summary = {
      totalIncome: updated.filter(t => t.type === 'income').reduce((a,b) => a + b.amount, 0),
      totalExpenses: updated.filter(t => t.type === 'expense').reduce((a,b) => a + b.amount, 0),
      netWorth: 15000 + updated.filter(t => t.type === 'income').reduce((a,b) => a + b.amount, 0) - updated.filter(t => t.type === 'expense').reduce((a,b) => a + b.amount, 0),
      savingsRate: 0 
    };
    
    getHealthScoreAnalysis(summary, updated).then(setHealthScore);
    setShowAddTransaction(false);
    
    // Add notification
    setNotifications(prev => [...prev, `Added ${newTx.type}: $${newTx.amount.toFixed(2)}`]);
    setTimeout(() => setNotifications(prev => prev.slice(1)), 3000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".csv" 
        className="hidden" 
      />

      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        no-print
      `}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
            <LayoutDashboard className="text-white" size={20} />
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">Finance Mentor</span>
        </div>
        
        <nav className="p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} className="mr-3" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${activeTab === 'reports' ? 'bg-blue-50 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FileBarChart size={20} className="mr-3" />
            Reports
          </button>
          <button 
            onClick={() => setIsChatOpen(true)}
            className="w-full flex items-center px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <MessageSquare size={20} className="mr-3" />
            Ask Finny
          </button>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button 
              onClick={() => setShowAddTransaction(true)}
              className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-primary text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={20} className="mr-2" />
              Add Transaction
            </button>
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <div className="flex items-center p-3 rounded-xl bg-gray-50">
             <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
               <User size={20} />
             </div>
             <div className="ml-3">
               <p className="text-sm font-medium text-gray-900">Demo User</p>
               <p className="text-xs text-gray-500">Premium Plan</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Mobile Header */}
        <div className="h-16 bg-white border-b border-gray-200 lg:hidden flex items-center px-4 justify-between no-print">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600">
            <Menu size={24} />
          </button>
          <span className="font-bold text-lg">Finance Mentor</span>
          <div className="w-8"></div>
        </div>

        {/* Viewport */}
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {activeTab === 'dashboard' ? 'Financial Overview' : 'Financial Report'}
              </h1>
              <p className="text-gray-500 mt-1">Welcome back! Here's your financial health summary.</p>
            </div>
            <div className="flex space-x-3 no-print">
               <button 
                 onClick={() => setShowAddTransaction(true)}
                 className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm"
               >
                 <Plus size={18} className="mr-2" />
                 Add
               </button>
               <button 
                 onClick={handleImportClick}
                 className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm"
               >
                 <Upload size={18} className="mr-2" />
                 Import
               </button>
               <button 
                 onClick={handlePrintReport}
                 className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm"
               >
                 <Printer size={18} className="mr-2" />
                 Export
               </button>
               <button 
                 onClick={() => setIsChatOpen(!isChatOpen)}
                 className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition shadow-sm shadow-blue-200"
               >
                 <MessageSquare size={18} className="mr-2" />
                 AI Chat
               </button>
            </div>
          </div>

          {/* Print Header (Hidden by default) */}
          <div className="hidden print-only mb-8">
             <h1 className="text-4xl font-bold mb-2">Finance Mentor AI Report</h1>
             <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
             <hr className="my-4" />
          </div>

          <Dashboard 
            transactions={transactions}
            forecastData={forecast}
            healthScore={healthScore}
          />

          {/* Report Footer */}
          <div className="hidden print-only mt-8 text-center text-gray-500 text-sm">
             <p>Confidential Financial Report • Generated by Finance Mentor AI</p>
          </div>
        </div>
      </main>

      {/* Chat Overlay */}
      <Chatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        summary={{
            totalIncome: transactions.filter(t => t.type === 'income').reduce((a,b) => a + b.amount, 0),
            totalExpenses: transactions.filter(t => t.type === 'expense').reduce((a,b) => a + b.amount, 0),
            netWorth: 15420,
            savingsRate: 0.2
        }}
        recentTransactions={transactions.slice(0, 10)}
      />

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 fade-in duration-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Add Transaction</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const type = formData.get('type') as TransactionType;
              const category = formData.get('category') as Category;
              
              handleAddTransaction({
                date: formData.get('date') as string,
                amount: parseFloat(formData.get('amount') as string),
                type: type,
                category: type === TransactionType.INCOME ? Category.INCOME : category,
                description: formData.get('description') as string
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select name="type" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option value={TransactionType.EXPENSE}>Expense</option>
                  <option value={TransactionType.INCOME}>Income</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select name="category" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  {Object.values(Category).filter(c => c !== Category.INCOME).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                <input 
                  type="number" 
                  name="amount" 
                  step="0.01" 
                  min="0" 
                  required 
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input 
                  type="text" 
                  name="description" 
                  required 
                  placeholder="e.g., Grocery shopping"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input 
                  type="date" 
                  name="date" 
                  required 
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddTransaction(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 no-print">
        {notifications.map((notif, idx) => (
          <div key={idx} className="bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-right fade-in duration-300 flex items-center space-x-2">
            <Bell size={18} />
            <span className="font-medium">{notif}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default App;