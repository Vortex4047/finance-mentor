import { GoogleGenAI, Chat } from "@google/genai";
import { Transaction, FinancialSummary } from '../types';

// Try multiple environment variable names
const API_KEY = process.env.GEMINI_API_KEY || 
                process.env.API_KEY || 
                'AIzaSyCItVFTlHRuH8NUZhFlGuj3BXhxqmkPIbo';

console.log('🔍 API Key Check:', {
  hasKey: !!API_KEY,
  keyLength: API_KEY?.length,
  keyPrefix: API_KEY?.substring(0, 10) + '...',
  isPlaceholder: API_KEY === 'PLACEHOLDER_API_KEY' || API_KEY?.includes('PLACEHOLDER')
});

// Initialize AI only if key exists and is not placeholder
let ai: GoogleGenAI | null = null;
if (API_KEY && API_KEY !== 'PLACEHOLDER_API_KEY' && !API_KEY.includes('PLACEHOLDER')) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
    console.log('✅ Gemini AI initialized successfully with key:', API_KEY.substring(0, 15) + '...');
  } catch (error) {
    console.error('❌ Failed to initialize Gemini AI:', error);
    ai = null;
  }
} else {
  console.warn('⚠️ No valid API key found. Using mock responses.');
}

const SYSTEM_PROMPT = `
You are 'Finny', an empathetic and knowledgeable financial coach for young adults.
Your role is to:
1. Provide proactive, forward-looking financial advice.
2. Explain complex financial concepts in simple, jargon-free language.
3. Analyze spending patterns and suggest improvements based on the provided user data.
4. Always be encouraging, non-judgmental, and focus on actionable steps.
5. Keep responses concise and readable (use markdown list or bolding).
`;

export const createChatSession = (summary: FinancialSummary, recentTransactions: Transaction[]): Chat | null => {
  if (!ai) {
    console.warn('⚠️ AI not initialized. Chat session cannot be created.');
    return null;
  }

  const contextMsg = `
    Current User Financial Context:
    - Net Worth: $${summary.netWorth.toFixed(2)}
    - Monthly Income: $${summary.totalIncome.toFixed(2)}
    - Monthly Expenses: $${summary.totalExpenses.toFixed(2)}
    - Recent Transactions: ${JSON.stringify(recentTransactions.slice(0, 5))}
  `;

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash-exp',
      config: {
        systemInstruction: SYSTEM_PROMPT + contextMsg,
      },
    });
    console.log('✅ Chat session created successfully');
    return chat;
  } catch (error) {
    console.error('❌ Failed to create chat session:', error);
    return null;
  }
};

export const getHealthScoreAnalysis = async (summary: FinancialSummary, transactions: Transaction[]) => {
  if (!ai) {
    // Mock response if no API Key
    const savingsRate = summary.totalIncome > 0 ? ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100 : 0;
    const score = Math.min(100, Math.max(0, Math.round(50 + savingsRate)));
    
    return {
      score: score,
      status: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Critical',
      insights: [
        `Your savings rate is ${savingsRate.toFixed(1)}%. ${savingsRate > 20 ? 'Great job!' : 'Try to save more.'}`,
        'Track your spending to identify areas for improvement.',
        'Set up automatic savings to build your emergency fund.'
      ]
    };
  }

  const prompt = `
    Analyze this financial data and return a JSON object with:
    1. 'score' (0-100 integer)
    2. 'status' (Critical, Fair, Good, Excellent)
    3. 'insights' (Array of 3 short, actionable string tips)

    Data:
    Income: $${summary.totalIncome}
    Expenses: $${summary.totalExpenses}
    Net Worth: $${summary.netWorth}
    Top Expense Categories: ${transactions.slice(0, 10).map(t => t.category).join(', ')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });
    
    const text = response.text;
    const parsed = JSON.parse(text || '{}');
    console.log('✅ Health score analysis completed:', parsed);
    return parsed;
  } catch (error) {
    console.error("❌ Error fetching health score:", error);
    // Fallback to mock response
    const savingsRate = summary.totalIncome > 0 ? ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100 : 0;
    const score = Math.min(100, Math.max(0, Math.round(50 + savingsRate)));
    
    return {
      score: score,
      status: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Critical',
      insights: [
        'Unable to connect to AI. Using basic analysis.',
        `Your savings rate is ${savingsRate.toFixed(1)}%.`,
        'Review your spending patterns regularly.'
      ]
    };
  }
};
