import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  gradient: string;
  delay?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  gradient,
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl -z-10"
        style={{ background: gradient }}
      />
      
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden dark:bg-slate-800/50 dark:border-slate-700">
        {/* Animated Background Gradient */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
          style={{ background: gradient }}
        />
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 shimmer-bg opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative z-10">
          {/* Icon with Floating Animation */}
          <motion.div
            animate={{ 
              y: [0, -5, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg",
              "group-hover:shadow-2xl transition-shadow duration-300"
            )}
            style={{ background: gradient }}
          >
            <Icon className="text-white" size={26} />
          </motion.div>

          {/* Title */}
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">
            {title}
          </h3>

          {/* Value with Counter Animation */}
          <motion.p 
            className="text-3xl font-bold text-slate-900 dark:text-white mb-2"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.5 }}
          >
            {value}
          </motion.p>

          {/* Change Indicator */}
          {change !== undefined && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
              className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold",
                change >= 0 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}
            >
              <span className="mr-1">{change >= 0 ? '↗' : '↘'}</span>
              {Math.abs(change).toFixed(1)}%
            </motion.div>
          )}
        </div>

        {/* Corner Decoration */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-opacity"
          style={{ background: gradient }}
        />
      </div>
    </motion.div>
  );
};
