import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
import { Transaction, FinancialSummary } from '../types';

// 1. Use import.meta.env for Vite
// 2. Check for VITE_ prefix specifically
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 
                import.meta.env.VITE_API_KEY ||
                ''; // Remove the dummy key to fail fast if missing

let genAI: GoogleGenerativeAI | null = null;

// Initialize AI only if key is valid
if (API_KEY && !API_KEY.includes('PLACEHOLDER')) {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
    console.log('✅ Gemini AI initialized');
  } catch (e) {
    console.error('❌ Gemini AI Init failed', e);
  }
} else {
  console.warn('⚠️ No valid API key found in environment variables.');
}

const SYSTEM_PROMPT = `
You are 'Finny', an empathetic and knowledgeable financial coach.
Your role is to:
1. Provide proactive, forward-looking financial advice.
2. Explain complex financial concepts in simple, jargon-free language.
3. Analyze spending patterns and suggest improvements based on user data.
4. Keep responses concise and readable.
`;

export const createChatSession = (summary: FinancialSummary, recentTransactions: Transaction[]): ChatSession | null => {
  if (!genAI) return null;

  const contextMsg = `
    Current User Context:
    - Net Worth: $${summary.netWorth.toFixed(2)}
    - Monthly Income: $${summary.totalIncome.toFixed(2)}
    - Expenses: $${summary.totalExpenses.toFixed(2)}
    - Recent Txns: ${JSON.stringify(recentTransactions.slice(0, 5))}
  `;

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT
    });

    return model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `Context: ${contextMsg}` }],
        },
        {
          role: "model",
          parts: [{ text: "I have analyzed your financial context and am ready to help." }],
        },
      ],
    });
  } catch (error) {
    console.error('❌ Failed to create chat session:', error);
    return null;
  }
};

export const getHealthScoreAnalysis = async (summary: FinancialSummary, transactions: Transaction[]) => {
  if (!genAI) return null;

  const prompt = `
    Analyze this data and return a valid JSON object with fields: score (0-100), status (Critical/Fair/Good/Excellent), and insights (array of 3 strings).
    Data: Income $${summary.totalIncome}, Expenses $${summary.totalExpenses}, Net Worth $${summary.netWorth}.
  `;

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("❌ Error fetching health score:", error);
    return null;
  }
};