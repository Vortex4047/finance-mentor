import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { ForecastPoint, Transaction, TransactionType } from '../types';

interface ForecastChartProps {
  data: ForecastPoint[];
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ data }) => {
  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[400px] w-full glass-card rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Cash Flow Forecast</h3>
          <p className="text-sm text-slate-500 mt-1">30-day projection based on your spending patterns</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-600">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-600">Projected</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxis} 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} 
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              backgroundColor: 'white',
              padding: '12px'
            }}
            formatter={(value: number) => [`$${value.toFixed(0)}`, 'Balance']}
            labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="projected" 
            stroke="#3b82f6" 
            strokeWidth={3}
            strokeDasharray="5 5" 
            fillOpacity={1} 
            fill="url(#colorProjected)" 
            name="Projected"
          />
          <Area 
            type="monotone" 
            dataKey="actual" 
            stroke="#22c55e" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorActual)" 
            name="Actual"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

interface SpendingPieProps {
  transactions: Transaction[];
}

const COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#f97316', '#eab308', '#64748b'];

export const SpendingPieChart: React.FC<SpendingPieProps> = ({ transactions }) => {
  const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
  const dataMap = new Map<string, number>();

  expenses.forEach(t => {
    const current = dataMap.get(t.category) || 0;
    dataMap.set(t.category, current + t.amount);
  });

  const data = Array.from(dataMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[400px] w-full glass-card rounded-2xl p-6"
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-900">Spending Breakdown</h3>
        <p className="text-sm text-slate-500 mt-1">Distribution by category</p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `$${value.toFixed(2)}`}
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              backgroundColor: 'white',
              padding: '12px'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};