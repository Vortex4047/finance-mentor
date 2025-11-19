import { FinancialSummary, Transaction } from '../types';

// Mock chatbot responses for when API key is not available
export const getMockResponse = (userMessage: string, summary: FinancialSummary, transactions: Transaction[]): string => {
  const lowerMsg = userMessage.toLowerCase();
  
  const savingsRate = summary.totalIncome > 0 
    ? ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100 
    : 0;
  
  // Analyze spending patterns
  if (lowerMsg.includes('analyz') || lowerMsg.includes('spending') || lowerMsg.includes('pattern')) {
    const topCategories = getTopExpenseCategories(transactions);
    return `Based on your recent transactions, here's what I see:\n\n**Top Spending Categories:**\n${topCategories.map((c, i) => `${i + 1}. ${c.category}: $${c.amount.toFixed(2)}`).join('\n')}\n\n**Insights:**\n• Your savings rate is ${savingsRate.toFixed(1)}%\n• ${savingsRate > 20 ? 'Great job saving!' : 'Try to increase your savings rate to at least 20%'}\n• Consider reviewing your ${topCategories[0]?.category || 'top'} expenses for potential savings`;
  }
  
  // Saving tips
  if (lowerMsg.includes('tip') || lowerMsg.includes('save') || lowerMsg.includes('saving')) {
    return `Here are some personalized saving tips:\n\n**1. Automate Your Savings**\nSet up automatic transfers to your savings account right after payday.\n\n**2. Track Every Dollar**\nUse this dashboard regularly to monitor where your money goes.\n\n**3. 50/30/20 Rule**\nAim for 50% needs, 30% wants, 20% savings. You're currently saving ${savingsRate.toFixed(1)}%.\n\n**4. Cut One Subscription**\nReview your recurring expenses and cancel what you don't use.`;
  }
  
  // Budget recommendations
  if (lowerMsg.includes('budget') || lowerMsg.includes('recommend')) {
    const monthlyIncome = summary.totalIncome;
    return `Based on your income of $${monthlyIncome.toFixed(2)}, here's a recommended budget:\n\n**Essential (50%):** $${(monthlyIncome * 0.5).toFixed(2)}\n• Housing, utilities, groceries, transportation\n\n**Lifestyle (30%):** $${(monthlyIncome * 0.3).toFixed(2)}\n• Entertainment, dining out, hobbies\n\n**Savings (20%):** $${(monthlyIncome * 0.2).toFixed(2)}\n• Emergency fund, investments, goals\n\nYou're currently spending $${summary.totalExpenses.toFixed(2)}/month.`;
  }
  
  // Reduce expenses
  if (lowerMsg.includes('reduce') || lowerMsg.includes('cut') || lowerMsg.includes('expense')) {
    return `Here are practical ways to reduce expenses:\n\n**Quick Wins:**\n• Cook at home 3 more times per week (save ~$150/month)\n• Use public transport or carpool (save ~$100/month)\n• Cancel unused subscriptions (save ~$50/month)\n\n**Long-term Strategies:**\n• Negotiate bills (internet, phone, insurance)\n• Buy generic brands for groceries\n• Use cashback apps and credit cards\n• Plan purchases during sales`;
  }
  
  // Forecast or future
  if (lowerMsg.includes('forecast') || lowerMsg.includes('future') || lowerMsg.includes('predict')) {
    const monthlyNet = summary.totalIncome - summary.totalExpenses;
    const sixMonthProjection = summary.netWorth + (monthlyNet * 6);
    return `Based on your current spending patterns:\n\n**Monthly Net:** ${monthlyNet >= 0 ? '+' : ''}$${monthlyNet.toFixed(2)}\n**6-Month Projection:** $${sixMonthProjection.toFixed(2)}\n**12-Month Projection:** $${(summary.netWorth + monthlyNet * 12).toFixed(2)}\n\n${monthlyNet > 0 ? '✅ You\'re on track! Keep it up.' : '⚠️ You\'re spending more than earning. Time to adjust your budget.'}`;
  }
  
  // Emergency fund
  if (lowerMsg.includes('emergency') || lowerMsg.includes('fund')) {
    const targetFund = summary.totalExpenses * 6;
    const currentFund = summary.netWorth * 0.3; // Assume 30% is liquid
    return `**Emergency Fund Guide:**\n\nTarget: $${targetFund.toFixed(2)} (6 months of expenses)\nEstimated Current: $${currentFund.toFixed(2)}\n\n**Action Steps:**\n1. Open a high-yield savings account\n2. Save $${((targetFund - currentFund) / 12).toFixed(2)}/month for 1 year\n3. Keep it separate from daily spending\n4. Only use for true emergencies`;
  }
  
  // Debt
  if (lowerMsg.includes('debt') || lowerMsg.includes('loan') || lowerMsg.includes('credit card')) {
    return `**Debt Management Strategy:**\n\n**Avalanche Method (Save Most Money):**\n• Pay minimums on all debts\n• Put extra money toward highest interest rate\n\n**Snowball Method (Quick Wins):**\n• Pay minimums on all debts\n• Put extra money toward smallest balance\n\n**General Tips:**\n• Avoid new debt while paying off existing\n• Consider balance transfer for high-interest cards\n• Negotiate lower interest rates with creditors`;
  }
  
  // Investment
  if (lowerMsg.includes('invest') || lowerMsg.includes('stock') || lowerMsg.includes('retirement')) {
    return `**Investment Basics:**\n\n**Before Investing:**\n✓ Have 3-6 months emergency fund\n✓ Pay off high-interest debt (>7%)\n✓ Max out employer 401(k) match\n\n**Getting Started:**\n1. Open a Roth IRA or 401(k)\n2. Start with low-cost index funds\n3. Invest consistently (dollar-cost averaging)\n4. Think long-term (10+ years)\n\n**Rule of Thumb:** Save 15% of income for retirement.`;
  }
  
  // Greetings
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return `Hello! 👋 I'm Finny, your AI financial mentor.\n\nI can help you with:\n• Analyzing your spending patterns\n• Creating a budget\n• Saving tips and strategies\n• Debt management advice\n• Investment basics\n• Financial goal planning\n\nWhat would you like to know about your finances?`;
  }
  
  // Default response
  return `I'm here to help with your finances! Here's what I can assist with:\n\n**Financial Analysis:**\n• "Analyze my spending patterns"\n• "Show me my forecast"\n\n**Budgeting:**\n• "Give me budget recommendations"\n• "How can I reduce expenses?"\n\n**Saving & Investing:**\n• "Give me saving tips"\n• "Tell me about emergency funds"\n• "How should I invest?"\n\nWhat would you like to explore?`;
};

const getTopExpenseCategories = (transactions: Transaction[]) => {
  const categoryTotals = new Map<string, number>();
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const current = categoryTotals.get(t.category) || 0;
      categoryTotals.set(t.category, current + t.amount);
    });
  
  return Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
};
