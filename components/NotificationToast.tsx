import React from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, TrendingUp } from 'lucide-react';

interface NotificationToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ 
  message, 
  type = 'info',
  onClose 
}) => {
  const config = {
    success: {
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-900 dark:text-green-100'
    },
    error: {
      icon: AlertCircle,
      gradient: 'from-red-500 to-rose-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-900 dark:text-red-100'
    },
    info: {
      icon: Info,
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-900 dark:text-blue-100'
    },
    warning: {
      icon: TrendingUp,
      gradient: 'from-yellow-500 to-orange-600',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-900 dark:text-yellow-100'
    }
  };

  const { icon: Icon, gradient, bg, border, text } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8, rotateZ: 10 }}
      animate={{ opacity: 1, x: 0, scale: 1, rotateZ: 0 }}
      exit={{ opacity: 0, x: 100, scale: 0.8, rotateZ: -10 }}
      transition={{ 
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
      className={`${bg} ${border} border-2 rounded-2xl shadow-2xl flex items-center gap-4 p-4 min-w-[320px] max-w-md backdrop-blur-xl`}
    >
      {/* Animated Icon */}
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 0.5,
          repeat: 2
        }}
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
      >
        <Icon className="text-white" size={24} />
      </motion.div>

      {/* Message */}
      <p className={`${text} font-medium flex-1 text-sm leading-relaxed`}>
        {message}
      </p>

      {/* Close Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex-shrink-0"
      >
        <X size={18} />
      </motion.button>

      {/* Progress Bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 3, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${gradient} rounded-b-2xl origin-left`}
      />
    </motion.div>
  );
};
