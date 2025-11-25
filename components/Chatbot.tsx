import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage, FinancialSummary, Transaction } from '../types';
import { generateLocalResponse } from '../services/localAIService';
import { Send, Bot, User, Loader2, X, Sparkles, TrendingUp, DollarSign, AlertCircle, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

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
      content: "👋 **Hi! I'm Finny**, your local AI financial mentor.\n\nI can help you with:\n\n💰 **Spending Analysis** - Understand where your money goes\n📊 **Savings Insights** - Improve your savings rate\n💡 **Budget Tips** - Get personalized recommendations\n🎯 **Health Check** - Assess your financial wellness\n\n✨ **Powered by local ML** - Your data never leaves your device!\n\nWhat would you like to explore today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Simulate thinking time for better UX
    setTimeout(() => {
      try {
        const responseText = generateLocalResponse(userInput, summary, recentTransactions);

        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: responseText,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      } catch (error: any) {
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: `❌ **Error**\n\nI encountered an issue processing your request. Please try rephrasing your question.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    }, 500 + Math.random() * 1000); // Random delay for natural feel
  };

  const quickPrompts = [
    { icon: TrendingUp, text: "Analyze my spending", color: "text-blue-600" },
    { icon: DollarSign, text: "How can I save more?", color: "text-green-600" },
    { icon: Sparkles, text: "Budget recommendations", color: "text-purple-600" },
    { icon: AlertCircle, text: "Financial health check", color: "text-orange-600" },
  ];

  if (!isOpen) return null;

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
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 flex justify-between items-center text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 relative overflow-hidden">
            {/* Animated Background */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            />
            
            <div className="flex items-center space-x-4 relative z-10">
              <motion.div 
                className="relative"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm shadow-lg">
                  <Zap size={28} className="drop-shadow-lg" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-green-400"
                />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  Finny AI
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-normal backdrop-blur-sm">LOCAL</span>
                </h3>
                <p className="text-sm text-blue-100 flex items-center gap-1">
                  <Sparkles size={14} />
                  <span>Powered by Local ML</span>
                </p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all relative z-10"
            >
              <X size={24} />
            </motion.button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex gap-3",
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'model' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot size={20} className="text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-5 py-3 shadow-sm",
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                  )}
                >
                  {msg.role === 'model' ? (
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: msg.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
                          .replace(/\n/g, '<br/>')
                          .replace(/💰|📊|💡|🎯|👋|⚠️|❌/g, '<span class="text-lg">$&</span>')
                      }}
                    />
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}
                  <p className={cn(
                    "text-xs mt-2 opacity-60",
                    msg.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                  )}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <User size={20} className="text-white" />
                  </div>
                )}
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Bot size={20} className="text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Loader2 size={18} className="animate-spin text-blue-600" />
                    <span className="text-sm text-slate-600">Finny is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt.text)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all whitespace-nowrap shadow-sm"
                >
                  <prompt.icon size={16} className={prompt.color} />
                  {prompt.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-6 bg-white border-t border-slate-200">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask me anything about your finances..."
                  className="w-full px-5 py-3 pr-32 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none text-sm text-slate-900 dark:text-slate-900 min-h-[48px]"
                  rows={2}
                  disabled={isLoading}
                  style={{ color: '#0f172a' }}
                />
                <div className="absolute right-3 bottom-3 text-xs text-slate-400 pointer-events-none">
                  Press Enter ↵
                </div>
              </div>
              <motion.button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                whileHover={{ scale: input.trim() && !isLoading ? 1.05 : 1 }}
                whileTap={{ scale: input.trim() && !isLoading ? 0.95 : 1 }}
                className={cn(
                  "p-3 rounded-2xl transition-all shadow-lg relative overflow-hidden",
                  input.trim() && !isLoading
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-xl"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                {input.trim() && !isLoading && (
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-white rounded-2xl"
                  />
                )}
                <Send size={20} className="relative z-10" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};