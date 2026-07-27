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
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 shadow-xl text-sm">
      <p className="text-[var(--text-secondary)] font-medium mb-2">{label}</p>
      {payload
        .filter(p => p.value > 0)
        .sort((a, b) => b.value - a.value)
        .map(p => (
          <div key={p.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-[var(--text-secondary)]">{p.name}</span>
            </div>
            <span className="text-[var(--text-primary)] font-medium">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(p.value)}
            </span>
          </div>
        ))}
      {payload.length > 1 && (
        <div className="border-t border-[var(--border)] mt-2 pt-2 flex justify-between">
          <span className="text-[var(--text-secondary)]">Total</span>
          <span className="text-[var(--text-primary)] font-bold">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(total)}
          </span>
        </div>
      )}
    </div>
  );
};

export const SpendingChart = ({ data, currency }: SpendingChartProps) => {
  const [view, setView] = useState<'monthly' | 'yearly'>('monthly');

  // Read theme from DOM for Recharts inline style props
  const isLight = document.documentElement.classList.contains('light');
  const gridStroke = isLight ? '#e5e5ea' : '#2a2a32';
  const tickColor = isLight ? '#6b7280' : '#6b7280';
  
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
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Spending by Category</h2>
        <div className="h-48 flex items-center justify-center text-[var(--text-muted)] text-sm">
          No spending data yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Spending by Category</h2>
        <div className="flex gap-1 bg-[var(--surface)] p-1 rounded-lg">
          {(['monthly', 'yearly'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                view === v ? 'bg-blue-600 text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis 
            dataKey="month" 
            tick={{ fill: tickColor, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: tickColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: isLight ? 'rgba(0,0,0,0.04)' : '#ffffff08' }} />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
            formatter={(value) => <span style={{ color: tickColor }}>{CATEGORIES.find(c => c.id === value)?.label || value}</span>}
          />
          {activeCategories.map(cat => (
            <Bar key={cat.id} dataKey={cat.id} stackId="a" fill={cat.color} radius={cat.id === activeCategories[activeCategories.length - 1].id ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
