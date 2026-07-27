import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { CATEGORIES } from '../utils/categories';

interface SpendingChartProps {
  data: Array<Record<string, string | number>>;
  currency: string;
}

const CustomTooltip = ({ active, payload, label, currency }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  currency: string;
}) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((sum, p) => sum + (p.value || 0), 0);

  return (
    <div className="bg-[#1a1a1f] border border-[#2a2a32] rounded-lg p-3 shadow-xl text-sm">
      <p className="text-gray-400 font-medium mb-2">{label}</p>
      {payload
        .filter(p => p.value > 0)
        .sort((a, b) => b.value - a.value)
        .map(p => (
          <div key={p.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-gray-300">{p.name}</span>
            </div>
            <span className="text-white font-medium">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(p.value)}
            </span>
          </div>
        ))}
      {payload.length > 1 && (
        <div className="border-t border-white/10 mt-2 pt-2 flex justify-between">
          <span className="text-gray-400">Total</span>
          <span className="text-white font-bold">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(total)}
          </span>
        </div>
      )}
    </div>
  );
};

export const SpendingChart = ({ data, currency }: SpendingChartProps) => {
  const [view, setView] = useState<'monthly' | 'yearly'>('monthly');
  
  const chartData = view === 'yearly' 
    ? data.map(d => {
        const row: Record<string, string | number> = { month: d.month };
        CATEGORIES.forEach(cat => {
          row[cat.id] = Math.round(((d[cat.id] as number) || 0) * 12 * 100) / 100;
        });
        row.total = Math.round(((d.total as number) || 0) * 12 * 100) / 100;
        return row;
      })
    : data;

  const activeCategories = CATEGORIES.filter(cat => 
    data.some(d => (d[cat.id] as number) > 0)
  );

  if (data.length === 0 || activeCategories.length === 0) {
    return (
      <div className="bg-[#1a1a1f] border border-[#2a2a32] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Spending by Category</h2>
        <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
          No spending data yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1f] border border-[#2a2a32] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Spending by Category</h2>
        <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
          {(['monthly', 'yearly'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                view === v ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a32" vertical={false} />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: '#ffffff08' }} />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
            formatter={(value) => <span style={{ color: '#9ca3af' }}>{CATEGORIES.find(c => c.id === value)?.label || value}</span>}
          />
          {activeCategories.map(cat => (
            <Bar key={cat.id} dataKey={cat.id} stackId="a" fill={cat.color} radius={cat.id === activeCategories[activeCategories.length - 1].id ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
