import { FinancialSummary, Transaction, Category } from '../types';

interface FinancialInsight {
  category: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
}

// Analyze spending patterns
const analyzeSpending = (transactions: Transaction[]): FinancialInsight[] => {
  const insights: FinancialInsight[] = [];
  
  const expenses = transactions.filter(t => t.type === 'expense');
  const categoryTotals: Record<string, number> = {};
  
  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });
  
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a);
  
  if (sortedCategories.length > 0) {
    const [topCategory, topAmount] = sortedCategories[0];
    const totalExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const percentage = (topAmount / totalExpenses) * 100;
    
    if (percentage > 40) {
      insights.push({
        category: 'spending',
        message: `Your ${topCategory} spending is ${percentage.toFixed(0)}% of total expenses. Consider setting a budget limit for this category.`,
        priority: 'high'
      });
    }
  }
  
  return insights;
};

// Calculate savings potential
const calculateSavingsPotential = (summary: FinancialSummary): FinancialInsight[] => {
  const insights: FinancialInsight[] = [];
  const monthlySavings = summary.totalIncome - summary.totalExpenses;
  const savingsRate = summary.savingsRate;
  
  if (savingsRate < 10) {
    insights.push({
      category: 'savings',
      message: `Your savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of your income. Try to reduce discretionary spending.`,
      priority: 'high'
    });
  } else if (savingsRate < 20) {
    insights.push({
      category: 'savings',
      message: `You're saving ${savingsRate.toFixed(1)}% of your income. Great start! Aim for 20% to build a strong financial foundation.`,
      priority: 'medium'
    });
  } else {
    insights.push({
      category: 'savings',
      message: `Excellent! You're saving ${savingsRate.toFixed(1)}% of your income. You're on track for strong financial health.`,
      priority: 'low'
    });
  }
  
  return insights;
};

// Detect unusual transactions
const detectAnomalies = (transactions: Transaction[]): FinancialInsight[] => {
  const insights: FinancialInsight[] = [];
  const expenses = transactions.filter(t => t.type === 'expense');
  
  if (expenses.length === 0) return insights;
  
  const amounts = expenses.map(t => t.amount);
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(
    amounts.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / amounts.length
  );
  
  const unusualTransactions = expenses.filter(t => t.amount > avg + 2 * stdDev);
  
  if (unusualTransactions.length > 0) {
    const largest = unusualTransactions.sort((a, b) => b.amount - a.amount)[0];
    insights.push({
      category: 'anomaly',
      message: `Detected an unusual expense: $${largest.amount.toFixed(2)} for ${largest.description}. Make sure this was intentional.`,
      priority: 'medium'
    });
  }
  
  return insights;
};

// Generate budget recommendations
const generateBudgetRecommendations = (
  transactions: Transaction[],
  summary: FinancialSummary
): string[] => {
  const recommendations: string[] = [];
  const expenses = transactions.filter(t => t.type === 'expense');
  const categoryTotals: Record<string, number> = {};
  
  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });
  
  // 50/30/20 rule recommendations
  const needs = [Category.HOUSING, Category.UTILITIES, Category.FOOD, Category.TRANSPORT, Category.HEALTH];
  const wants = [Category.ENTERTAINMENT, Category.SHOPPING, Category.MISC];
  
  const needsTotal = Object.entries(categoryTotals)
    .filter(([cat]) => needs.includes(cat as Category))
    .reduce((sum, [, amt]) => sum + amt, 0);
  
  const wantsTotal = Object.entries(categoryTotals)
    .filter(([cat]) => wants.includes(cat as Category))
    .reduce((sum, [, amt]) => sum + amt, 0);
  
  const needsPercentage = (needsTotal / summary.totalIncome) * 100;
  const wantsPercentage = (wantsTotal / summary.totalIncome) * 100;
  
  if (needsPercentage > 50) {
    recommendations.push(`Your essential expenses are ${needsPercentage.toFixed(0)}% of income. Try to keep them under 50%.`);
  }
  
  if (wantsPercentage > 30) {
    recommendations.push(`Discretionary spending is ${wantsPercentage.toFixed(0)}% of income. Consider reducing to 30% or less.`);
  }
  
  if (summary.savingsRate < 20) {
    const targetSavings = summary.totalIncome * 0.2;
    const currentSavings = summary.totalIncome - summary.totalExpenses;
    const gap = targetSavings - currentSavings;
    recommendations.push(`To reach 20% savings rate, try to save an additional $${gap.toFixed(2)} per month.`);
  }
  
  return recommendations;
};

// Intent classification with more patterns
const classifyIntent = (message: string): string => {
  const lower = message.toLowerCase();
  
  // Spending patterns
  if (lower.match(/spend|expense|cost|paid|bought|purchase/)) return 'spending';
  
  // Savings patterns
  if (lower.match(/save|saving|emergency fund|nest egg/)) return 'savings';
  
  // Budget patterns
  if (lower.match(/budget|limit|allocat|plan/)) return 'budget';
  
  // Health patterns
  if (lower.match(/health|score|status|doing|perform/)) return 'health';
  
  // Goals patterns
  if (lower.match(/goal|target|aim|objective/)) return 'goals';
  
  // Advice patterns
  if (lower.match(/tip|advice|recommend|suggest|help|how to|what should/)) return 'advice';
  
  // Analysis patterns
  if (lower.match(/analyz|review|look at|check|examine|breakdown/)) return 'analysis';
  
  // Comparison patterns
  if (lower.match(/compar|versus|vs|better|worse/)) return 'comparison';
  
  // Greeting patterns
  if (lower.match(/^(hi|hello|hey|good morning|good afternoon|good evening|sup|yo)/)) return 'greeting';
  
  // Thanks patterns
  if (lower.match(/thank|thanks|appreciate|grateful/)) return 'thanks';
  
  return 'general';
};

// Generate conversational responses
const getConversationalResponse = (intent: string): string => {
  const greetings = [
    "Hey there! 👋 Ready to talk about your finances?",
    "Hello! 😊 How can I help you manage your money today?",
    "Hi! Great to see you! What financial questions do you have?",
    "Hey! 💰 Let's make your money work smarter together!"
  ];
  
  const thanks = [
    "You're very welcome! 😊 Happy to help anytime!",
    "My pleasure! That's what I'm here for! 💪",
    "Glad I could help! Feel free to ask anything else! ✨",
    "Anytime! Your financial success is my mission! 🎯"
  ];
  
  if (intent === 'greeting') {
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  if (intent === 'thanks') {
    return thanks[Math.floor(Math.random() * thanks.length)];
  }
  
  return '';
};

// Generate response based on intent
export const generateLocalResponse = (
  userMessage: string,
  summary: FinancialSummary,
  transactions: Transaction[]
): string => {
  const intent = classifyIntent(userMessage);
  
  // Handle conversational intents
  const conversational = getConversationalResponse(intent);
  if (conversational) return conversational;
  
  switch (intent) {
    case 'spending': {
      const insights = analyzeSpending(transactions);
      const expenses = transactions.filter(t => t.type === 'expense');
      const categoryTotals: Record<string, number> = {};
      
      expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });
      
      const topCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);
      
      const intros = [
        "Let me break down your spending for you! 📊",
        "Here's what I found about your expenses! 💸",
        "Alright, let's dive into where your money's going! 🔍",
        "I've analyzed your spending patterns - here's the scoop! 📈"
      ];
      
      let response = `${intros[Math.floor(Math.random() * intros.length)]}\n\n`;
      response += `You've spent **$${summary.totalExpenses.toFixed(2)}** this month. `;
      
      if (summary.totalExpenses > summary.totalIncome * 0.8) {
        response += `That's quite a bit - let's see where it's going! 🤔\n\n`;
      } else {
        response += `Not bad! Let's see the breakdown. 👍\n\n`;
      }
      
      response += `**Your Top 3 Spending Categories:**\n\n`;
      
      const emojis = ['🥇', '🥈', '🥉'];
      topCategories.forEach(([cat, amt], idx) => {
        const percentage = (amt / summary.totalExpenses) * 100;
        response += `${emojis[idx]} **${cat}**: $${amt.toFixed(2)} (${percentage.toFixed(1)}%)\n`;
      });
      
      if (insights.length > 0) {
        response += `\n💡 **My Take:** ${insights[0].message}`;
      }
      
      response += `\n\n*Want to dig deeper? Just ask me about any specific category!* 😊`;
      
      return response;
    }
    
    case 'savings': {
      const insights = calculateSavingsPotential(summary);
      const monthlySavings = summary.totalIncome - summary.totalExpenses;
      const savingsRate = summary.savingsRate * 100;
      
      let response = '';
      
      if (savingsRate >= 20) {
        response = `Wow! 🌟 You're crushing it with a **${savingsRate.toFixed(1)}%** savings rate!\n\n`;
        response += `That's **$${monthlySavings.toFixed(2)}** going into your savings each month. You're way ahead of the game! 💪\n\n`;
        response += `Most financial experts recommend 20%, and you're already there (or beyond!). Here's what you could do:\n\n`;
        response += `• 🎯 Set up automatic investments\n`;
        response += `• 🏠 Start a down payment fund\n`;
        response += `• 🚀 Max out your retirement accounts\n`;
        response += `• 💎 Build wealth through index funds\n\n`;
        response += `Keep up this amazing momentum! 🎉`;
      } else if (savingsRate >= 10) {
        response = `Nice work! 👍 You're saving **${savingsRate.toFixed(1)}%** of your income.\n\n`;
        response += `That's **$${monthlySavings.toFixed(2)}** per month - not bad at all! But we can do even better. 💪\n\n`;
        const targetSavings = summary.totalIncome * 0.2;
        const gap = targetSavings - monthlySavings;
        response += `To hit the sweet spot of 20%, you'd need to save an extra **$${gap.toFixed(2)}** monthly.\n\n`;
        response += `**Quick wins to get there:**\n`;
        response += `• ☕ Cut one subscription you barely use\n`;
        response += `• 🍔 Cook at home 2 more times per week\n`;
        response += `• 💡 Negotiate your bills (internet, insurance)\n`;
        response += `• 🎁 Sell stuff you don't need\n\n`;
        response += `Small changes = big results! You've got this! 🚀`;
      } else {
        response = `Hey, let's talk savings! 💰\n\n`;
        response += `Right now you're saving **${savingsRate.toFixed(1)}%** (about **$${monthlySavings.toFixed(2)}**/month).\n\n`;
        response += `I know it's tough, but let's work on getting that number up! The goal is 20% - here's why it matters:\n\n`;
        response += `• 🛡️ Emergency fund for peace of mind\n`;
        response += `• 🏖️ Freedom to take opportunities\n`;
        response += `• 🎯 Retire comfortably someday\n`;
        response += `• 💪 Financial independence\n\n`;
        const targetSavings = summary.totalIncome * 0.2;
        const gap = targetSavings - monthlySavings;
        response += `To get to 20%, we need to find **$${gap.toFixed(2)}** more per month.\n\n`;
        response += `**Let's start small:**\n`;
        response += `1. Track every expense for a week\n`;
        response += `2. Find your biggest "money leak"\n`;
        response += `3. Cut it by 50% (not 100% - be realistic!)\n`;
        response += `4. Automate that savings\n\n`;
        response += `You can do this! I believe in you! 💪✨`;
      }
      
      return response;
    }
    
    case 'budget': {
      const recommendations = generateBudgetRecommendations(transactions, summary);
      
      let response = `🎯 **Budget Recommendations**\n\n`;
      response += `Based on the 50/30/20 rule:\n`;
      response += `• 50% for needs (housing, food, utilities)\n`;
      response += `• 30% for wants (entertainment, shopping)\n`;
      response += `• 20% for savings and debt\n\n`;
      
      if (recommendations.length > 0) {
        response += `**Your Budget Analysis:**\n`;
        recommendations.forEach((rec, idx) => {
          response += `${idx + 1}. ${rec}\n`;
        });
      } else {
        response += `✅ Your budget looks well-balanced! Keep up the good work.`;
      }
      
      return response;
    }
    
    case 'health': {
      const spendingInsights = analyzeSpending(transactions);
      const savingsInsights = calculateSavingsPotential(summary);
      const anomalies = detectAnomalies(transactions);
      
      let score = 100;
      const issues: string[] = [];
      
      if (summary.savingsRate < 10) {
        score -= 30;
        issues.push('Low savings rate');
      } else if (summary.savingsRate < 20) {
        score -= 15;
        issues.push('Below recommended savings rate');
      }
      
      if (spendingInsights.some(i => i.priority === 'high')) {
        score -= 20;
        issues.push('High concentration in one category');
      }
      
      if (anomalies.length > 0) {
        score -= 10;
        issues.push('Unusual transactions detected');
      }
      
      let response = `🏥 **Financial Health Check**\n\n`;
      response += `Health Score: **${score}/100**\n\n`;
      
      if (score >= 80) {
        response += `✅ **Excellent!** Your finances are in great shape.\n\n`;
      } else if (score >= 60) {
        response += `👍 **Good!** You're doing well, with room for improvement.\n\n`;
      } else if (score >= 40) {
        response += `⚠️ **Fair.** Some areas need attention.\n\n`;
      } else {
        response += `🚨 **Needs Improvement.** Let's work on your finances.\n\n`;
      }
      
      if (issues.length > 0) {
        response += `**Areas to Address:**\n`;
        issues.forEach((issue, idx) => {
          response += `${idx + 1}. ${issue}\n`;
        });
      }
      
      return response;
    }
    
    case 'analysis': {
      const allInsights = [
        ...analyzeSpending(transactions),
        ...calculateSavingsPotential(summary),
        ...detectAnomalies(transactions)
      ];
      
      let response = `📈 **Complete Financial Analysis**\n\n`;
      response += `**Overview:**\n`;
      response += `• Income: $${summary.totalIncome.toFixed(2)}\n`;
      response += `• Expenses: $${summary.totalExpenses.toFixed(2)}\n`;
      response += `• Net: $${(summary.totalIncome - summary.totalExpenses).toFixed(2)}\n`;
      response += `• Savings Rate: ${summary.savingsRate.toFixed(1)}%\n\n`;
      
      if (allInsights.length > 0) {
        response += `**Key Insights:**\n`;
        allInsights.slice(0, 3).forEach((insight, idx) => {
          response += `${idx + 1}. ${insight.message}\n`;
        });
      }
      
      return response;
    }
    
    case 'advice':
    case 'goals':
    default: {
      const tips = [
        "Set up automatic transfers to savings on payday",
        "Track every expense for 30 days to identify spending patterns",
        "Use the 24-hour rule for non-essential purchases over $50",
        "Build an emergency fund covering 3-6 months of expenses",
        "Review and cancel unused subscriptions",
        "Meal prep to reduce food expenses",
        "Use cashback credit cards for regular purchases (pay in full)",
        "Negotiate bills like insurance and internet annually",
        "Invest in index funds for long-term growth",
        "Set specific, measurable financial goals"
      ];
      
      const randomTips = tips.sort(() => Math.random() - 0.5).slice(0, 3);
      
      let response = `💡 **Financial Tips & Advice**\n\n`;
      response += `Here are some personalized recommendations:\n\n`;
      
      randomTips.forEach((tip, idx) => {
        response += `${idx + 1}. ${tip}\n`;
      });
      
      response += `\n✨ **Remember:** Small consistent changes lead to big results over time!`;
      
      return response;
    }
  }
};

// Quick analysis for dashboard
export const getQuickInsights = (
  summary: FinancialSummary,
  transactions: Transaction[]
): string[] => {
  const insights: string[] = [];
  
  const spendingInsights = analyzeSpending(transactions);
  const savingsInsights = calculateSavingsPotential(summary);
  const anomalies = detectAnomalies(transactions);
  
  if (spendingInsights.length > 0) {
    insights.push(spendingInsights[0].message);
  }
  
  if (savingsInsights.length > 0) {
    insights.push(savingsInsights[0].message);
  }
  
  if (anomalies.length > 0) {
    insights.push(anomalies[0].message);
  }
  
  if (insights.length === 0) {
    insights.push("Your finances look balanced. Keep up the good work!");
    insights.push("Consider setting up automatic savings transfers.");
    insights.push("Review your budget monthly to stay on track.");
  }
  
  return insights;
};
