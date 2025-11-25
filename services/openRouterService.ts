import { Transaction, FinancialSummary, HealthScore } from '../types';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'google/gemini-flash-1.5-8b';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173'; // Optional, for OpenRouter rankings
const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Finance Mentor'; // Optional

const SYSTEM_PROMPT = `
You are 'Finny', an empathetic, knowledgeable, and practical financial mentor.
Your goal is to help users improve their financial health through actionable advice.

Guidelines:
1. **Tone**: Friendly, encouraging, but professional. Avoid being judgmental.
2. **Format**: Use bullet points for lists. Use bold text for emphasis. Keep paragraphs short.
3. **Content**: 
   - Analyze the user's specific data (income, expenses, net worth).
   - Provide specific, actionable steps (e.g., "Try to reduce dining out by 10%").
   - Explain financial concepts simply (e.g., "The 50/30/20 rule...").
   - If data is missing, ask clarifying questions.
4. **Safety**: Do not provide specific investment advice (e.g., "Buy stock X"). Instead, explain general principles (e.g., "Diversification reduces risk").

Context:
The user has provided their recent transactions and a financial summary. Use this to personalize your responses.
`;

export const checkApiKey = (): boolean => {
  const isValid = !!(API_KEY && !API_KEY.includes('PLACEHOLDER') && API_KEY.startsWith('sk-or-'));
  if (!isValid) {
    console.warn('⚠️ OpenRouter API Key Check Failed:', {
      exists: !!API_KEY,
      isPlaceholder: API_KEY?.includes('PLACEHOLDER'),
      startsWithPrefix: API_KEY?.startsWith('sk-or-'),
      length: API_KEY?.length
    });
  }
  return isValid;
};

export const getApiKeyStatus = (): { valid: boolean; message: string } => {
  if (!API_KEY) return { valid: false, message: "API Key is missing from .env.local" };
  if (API_KEY.includes('PLACEHOLDER')) return { valid: false, message: "API Key is still the placeholder" };
  if (!API_KEY.startsWith('sk-or-')) return { valid: false, message: "Invalid OpenRouter Key format (must start with sk-or-)" };
  return { valid: true, message: "Online" };
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const sendMessage = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  newMessage: string,
  summary: FinancialSummary,
  recentTransactions: Transaction[]
): Promise<string> => {
  if (!checkApiKey()) {
    throw new Error("Invalid API Key");
  }

  const contextMsg = `
    Current User Context:
    - Net Worth: $${summary.netWorth.toFixed(2)}
    - Monthly Income: $${summary.totalIncome.toFixed(2)}
    - Expenses: $${summary.totalExpenses.toFixed(2)}
    - Savings Rate: ${(summary.savingsRate * 100).toFixed(1)}%
    - Recent Transactions (Last 5): ${JSON.stringify(recentTransactions.slice(0, 5))}
  `;

  // Convert Gemini-style history to OpenAI/OpenRouter format
  const messages: Message[] = [
    { role: 'system', content: `${SYSTEM_PROMPT}\n\nSystem Context: ${contextMsg}` },
    ...history.map(msg => ({
      role: (msg.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: msg.parts[0].text
    })),
    { role: 'user', content: newMessage }
  ];

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API Error:", JSON.stringify(errorData, null, 2));
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("❌ Failed to send message:", error);
    throw error;
  }
};

export const getHealthScoreAnalysis = async (summary: FinancialSummary, transactions: Transaction[]): Promise<HealthScore> => {
  if (!checkApiKey()) {
    return {
      score: 50,
      status: "Fair",
      insights: ["API Key missing", "Using default analysis", "Configure OpenRouter Key"]
    };
  }

  const prompt = `
    Analyze this financial data and return a JSON object.
    
    Data:
    - Income: $${summary.totalIncome}
    - Expenses: $${summary.totalExpenses}
    - Net Worth: $${summary.netWorth}
    - Savings Rate: ${summary.savingsRate}

    Required JSON Structure:
    {
      "score": number (0-100),
      "status": string ("Critical", "Fair", "Good", "Excellent"),
      "insights": string[] (array of 3 short, actionable insights)
    }
    
    IMPORTANT: Return ONLY the raw JSON string. Do not use markdown code blocks.
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: "You are a financial analyst JSON generator." },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    let text = data.choices[0]?.message?.content || "{}";

    // Cleanup markdown if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("❌ Error fetching health score:", error);
    return {
      score: 50,
      status: "Fair",
      insights: ["AI Analysis unavailable", "Using local estimates", "Check API configuration"]
    };
  }
};