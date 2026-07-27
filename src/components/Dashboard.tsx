import { useState } from 'react';
import { Subscription } from '../types';
import { useSpending } from '../hooks/useSpending';
import { useAlerts } from '../hooks/useAlerts';
import { SubscriptionCard } from './SubscriptionCard';
import { AlertBanner } from './AlertBanner';
import { SpendingChart } from './SpendingChart';
import { RenewalTimeline } from './RenewalTimeline';
import { EmptyState } from './EmptyState';
import { CATEGORIES } from '../utils/categories';
import { formatCurrency, isUnused } from '../utils/dates';
import { Plus, DollarSign, Calendar, AlertTriangle, ZapOff } from 'lucide-react';

interface DashboardProps {
  subscriptions: Subscription[];
  currency: string;
  onAdd: () => void;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: number) => void;
  onMarkUsed: (id: number) => void;
  onSeedData: () => void;
}

const KPICard = ({ label, value, sub, icon: Icon, color }: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) => (
  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center`} style={{ backgroundColor: color + '20' }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
    <div className="text-2xl font-bold text-[var(--text-primary)] mb-0.5">{value}</div>
    <div className="text-xs text-[var(--text-secondary)]">{label}</div>
    {sub && <div className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</div>}
  </div>
);

export const Dashboard = ({ subscriptions, currency, onAdd, onEdit, onDelete, onMarkUsed, onSeedData }: DashboardProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { totalMonthly, totalYearly, renewingThisWeek, chartData } = useSpending(subscriptions);
  const { renewalAlerts } = useAlerts(subscriptions);
  const unusedCount = subscriptions.filter(s => isUnused(s.lastUsedAt, 30)).length;

  const filtered = activeCategory === 'all' 
    ? subscriptions 
    : subscriptions.filter(s => s.category === activeCategory);

  const sorted = [...filtered].sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime());

  if (subscriptions.length === 0) {
    return <EmptyState onAddFirst={onAdd} onSeedData={onSeedData} />;
  }

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {renewalAlerts.length > 0 && <AlertBanner alerts={renewalAlerts} />}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Monthly Cost"
          value={formatCurrency(totalMonthly, currency)}
          icon={DollarSign}
          color="#3b82f6"
        />
        <KPICard
          label="Yearly Cost"
          value={formatCurrency(totalYearly, currency)}
          sub="Projected"
          icon={DollarSign}
          color="#10b981"
        />
        <KPICard
          label="Renewing This Week"
          value={renewingThisWeek.toString()}
          sub={renewingThisWeek === 1 ? 'subscription' : 'subscriptions'}
          icon={Calendar}
          color="#f59e0b"
        />
        <KPICard
          label="Unused (30+ days)"
          value={unusedCount.toString()}
          sub={unusedCount === 0 ? 'All active' : 'Consider cancelling'}
          icon={unusedCount > 0 ? ZapOff : AlertTriangle}
          color={unusedCount > 0 ? '#ef4444' : '#6b7280'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <SpendingChart data={chartData} currency={currency} />
        <RenewalTimeline subscriptions={subscriptions} currency={currency} />
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          All ({subscriptions.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = subscriptions.filter(s => s.category === cat.id).length;
          if (count === 0) return null;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id ? 'text-white' : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
              }`}
              style={activeCategory === cat.id ? { backgroundColor: cat.color, color: 'white' } : {}}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Subscriptions Grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">
          No subscriptions in this category
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map(sub => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              currency={currency}
              onEdit={onEdit}
              onDelete={onDelete}
              onMarkUsed={onMarkUsed}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={onAdd}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 transition-all hover:scale-110 z-40"
        aria-label="Add subscription"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};
