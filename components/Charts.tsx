import React from 'react';
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
    <div className="h-[300px] w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">30-Day Cash Flow Forecast</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{fontSize: 12}} tickLine={false} axisLine={false} />
          <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            formatter={(value: number) => [`$${value.toFixed(0)}`, 'Balance']}
          />
          <Area 
            type="monotone" 
            dataKey="upperBound" 
            stackId="2" 
            stroke="none" 
            fill="#eff6ff" 
          />
           <Area 
            type="monotone" 
            dataKey="lowerBound" 
            stackId="2" 
            stroke="none" 
            fill="none" 
          />
          <Area 
            type="monotone" 
            dataKey="projected" 
            stroke="#2563eb" 
            strokeDasharray="5 5" 
            fillOpacity={1} 
            fill="url(#colorProjected)" 
            name="Projected"
          />
          <Area 
            type="monotone" 
            dataKey="actual" 
            stroke="#059669" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#colorActual)" 
            name="Actual"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface SpendingPieProps {
  transactions: Transaction[];
}

const COLORS = ['#2563eb', '#059669', '#7c3aed', '#db2777', '#ea580c', '#ca8a04', '#64748b'];

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
    <div className="h-[300px] w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Spending by Category</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};