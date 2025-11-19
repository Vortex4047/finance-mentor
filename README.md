# Finance Mentor AI 💰

A modern, AI-powered personal finance dashboard with intelligent insights, forecasting, and budget tracking.

## ✨ Features

### Core Features
- **Real-time Dashboard** - Track net worth, income, expenses, and financial health score
- **AI Financial Coach** - Chat with "Finny", your personal AI financial mentor powered by Gemini
- **30-Day Cash Flow Forecast** - Predictive analytics with confidence intervals
- **Smart Categorization** - Automatic expense categorization with visual breakdowns
- **Budget Tracking** - Monitor spending against monthly budgets by category
- **Savings Goals** - Track progress toward financial goals with visual indicators

### New Features Added
- **Add Transactions** - Manually add income/expenses with a beautiful modal form
- **CSV Import** - Import bank statements and transaction history from CSV files
- **Export to PDF** - Print professional financial reports
- **Real-time Notifications** - Get instant feedback on actions
- **AI Insights Panel** - Personalized financial recommendations on the dashboard
- **Quick Action Buttons** - Fast access to common AI queries
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Ready** - Modern gradient UI with smooth animations

## 🚀 Run Locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## 📊 CSV Import Format

To import transactions, your CSV should have these columns:
- `Date` - Transaction date (YYYY-MM-DD or MM/DD/YYYY)
- `Amount` - Transaction amount (positive number)
- `Description` - Transaction description
- `Category` (optional) - Food & Dining, Housing, Transportation, etc.
- `Type` (optional) - income/expense or credit/debit

Example:
```csv
Date,Description,Amount,Category,Type
2024-01-15,Grocery Store,85.50,Food & Dining,expense
2024-01-16,Salary Deposit,3200.00,Income,income
```

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Google Gemini AI** - AI-powered insights
- **Lucide React** - Icons

## 📱 Usage

1. **View Dashboard** - See your financial overview with key metrics
2. **Add Transactions** - Click "Add" button or use sidebar button
3. **Import Data** - Click "Import" to upload CSV files
4. **Chat with AI** - Click "AI Chat" to get personalized advice
5. **Export Reports** - Click "Export" to generate PDF reports
6. **Track Budgets** - Monitor spending against category budgets
7. **Set Goals** - Track progress toward savings goals

## 🎯 AI Capabilities

Finny, your AI financial mentor, can help you:
- Analyze spending patterns and trends
- Provide personalized saving tips
- Explain financial concepts in simple terms
- Suggest budget optimizations
- Answer questions about your finances
- Give proactive financial advice

## 🔒 Privacy

All data is stored locally in your browser. The AI only receives anonymized financial summaries for analysis.
