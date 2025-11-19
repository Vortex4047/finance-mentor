import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, FinancialSummary, Transaction } from '../types';
import { createChatSession } from '../services/geminiService';
import { getMockResponse } from '../services/mockChatbot';
import { Send, Bot, User, Loader2, X } from 'lucide-react';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  summary: FinancialSummary;
  recentTransactions: Transaction[];
}

export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, summary, recentTransactions }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Hi! I'm Finny, your personal finance mentor. 👋\n\nI can help you with:\n• Analyzing your spending patterns\n• Budget recommendations\n• Saving tips and strategies\n• Financial goal planning\n\nWhat would you like to know about your finances?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      chatSessionRef.current = createChatSession(summary, recentTransactions);
    }
  }, [isOpen, summary, recentTransactions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    // Use mock chatbot if no API session
    if (!chatSessionRef.current) {
      console.log('💬 Using mock chatbot (no API key)');
      setTimeout(() => {
        const mockResponse = getMockResponse(userInput, summary, recentTransactions);
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: mockResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
        setIsLoading(false);
      }, 800); // Simulate thinking time
      return;
    }

    // Try to use real AI
    try {
      console.log('📤 Sending message to AI:', userInput);
      const result = await chatSessionRef.current.sendMessage(userInput);
      const responseText = result.response.text();
      console.log('📥 Received response from AI:', responseText.substring(0, 100) + '...');

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      console.error("❌ Chat error, falling back to mock:", error);
      
      // Fallback to mock chatbot on error
      const mockResponse = getMockResponse(userInput, summary, recentTransactions);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: mockResponse + '\n\n_💡 Note: Using offline mode. For AI-powered responses, add a Gemini API key to .env.local_',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 flex flex-col h-[600px] transition-all animate-in slide-in-from-bottom-10 fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-700 p-4 flex justify-between items-center text-white">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold">Finny AI</h3>
            <p className="text-xs text-blue-100">Financial Mentor</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
              }`}
            >
              {msg.role === 'model' ? (
                 <div dangerouslySetInnerHTML={{
                    __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>') 
                 }} />
              ) : msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-200 flex items-center space-x-2">
              <Loader2 size={16} className="animate-spin text-primary" />
              <span className="text-xs text-gray-500">Finny is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-primary/20 transition">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your budget..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-500"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`p-2 rounded-full ${input.trim() ? 'text-primary hover:bg-blue-50' : 'text-gray-400'} transition`}
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-2 flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            "Analyze my spending patterns",
            "Give me saving tips",
            "How can I reduce expenses?",
            "Budget recommendations"
          ].map(suggestion => (
            <button 
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="text-xs px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-gray-600 whitespace-nowrap hover:bg-gray-100"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};