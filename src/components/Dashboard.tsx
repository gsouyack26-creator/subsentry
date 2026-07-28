import { useState, useMemo } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { Subscription } from '../types';
import { useSpending } from '../hooks/useSpending';
import { useAlerts } from '../hooks/useAlerts';
import { SubscriptionCard } from './SubscriptionCard';
import { AlertBanner } from './AlertBanner';
import { SpendingChart } from './SpendingChart';
import { RenewalTimeline } from './RenewalTimeline';
import { EmptyState } from './EmptyState';
import { BudgetGauge } from './BudgetGauge';
import { CATEGORIES } from '../utils/categories';
import { formatCurrency, isUnused } from '../utils/dates';
import { Plus, DollarSign, Calendar, ZapOff, Search, X, ArrowUpDown } from 'lucide-react';

interface DashboardProps {
  subscriptions: Subscription[];
  currency: string;
  monthlyBudget?: number | null;
  onAdd: () => void;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: number) => void;
  onMarkUsed: (id: number) => void;
  onSeedData: () => void;
  onOpenStatementImport?: () => void;
}

type SortKey = 'renewal' | 'price-desc' | 'price-asc' | 'name';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'renewal', label: 'Next renewal' },
  { value: 'price-desc', label: 'Price: high → low' },
  { value: 'price-asc', label: 'Price: low → high' },
  { value: 'name', label: 'Name: A → Z' },
];

const kpiVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: 'easeOut' as const, delay: i * 0.06 },
  }),
};

const KPICard = ({ label, value, sub, icon: Icon, color, index }: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  index: number;
}) => (
  <motion.div
    custom={index}
    variants={kpiVariants}
    initial="hidden"
    animate="visible"
    className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
    <div className="text-2xl font-bold text-[var(--text-primary)] mb-0.5">{value}</div>
    <div className="text-xs text-[var(--text-secondary)]">{label}</div>
    {sub && <div className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</div>}
  </motion.div>
);

export const Dashboard = ({
  subscriptions,
  currency,
  monthlyBudget,
  onAdd,
  onEdit,
  onDelete,
  onMarkUsed,
  onSeedData,
  onOpenStatementImport,
}: DashboardProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('renewal');

  const { totalMonthly, totalYearly, renewingThisWeek, chartData } = useSpending(subscriptions);
  const { renewalAlerts } = useAlerts(subscriptions);
  const unusedCount = subscriptions.filter(s => isUnused(s.lastUsedAt, 30)).length;

  const filtered = useMemo(() => {
    let list = activeCategory === 'all'
      ? subscriptions
      : subscriptions.filter(s => s.category === activeCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.notes || '').toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      switch (sortKey) {
        case 'renewal':
          return new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime();
        case 'price-desc':
          return b.amount - a.amount;
        case 'price-asc':
          return a.amount - b.amount;
        case 'name':
          return a.name.localeCompare(b.name);
      }
    });
  }, [subscriptions, activeCategory, searchQuery, sortKey]);

  if (subscriptions.length === 0) {
    return (
      <EmptyState
        onAddFirst={onAdd}
        onSeedData={onSeedData}
        onImportStatement={onOpenStatementImport}
      />
    );
  }

  const kpiCount = monthlyBudget ? 4 : 4; // always 4 cards

  return (
    <MotionConfig reducedMotion="user">
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
            index={0}
          />
          <KPICard
            label="Yearly Cost"
            value={formatCurrency(totalYearly, currency)}
            sub="Projected"
            icon={DollarSign}
            color="#10b981"
            index={1}
          />
          <KPICard
            label="Renewing This Week"
            value={renewingThisWeek.toString()}
            sub={renewingThisWeek === 1 ? 'subscription' : 'subscriptions'}
            icon={Calendar}
            color="#f59e0b"
            index={2}
          />
          {monthlyBudget ? (
            <BudgetGauge
              spent={totalMonthly}
              budget={monthlyBudget}
              currency={currency}
              index={3}
            />
          ) : (
            <KPICard
              label="Unused (30+ days)"
              value={unusedCount.toString()}
              sub={unusedCount === 0 ? 'All active' : 'Consider cancelling'}
              icon={ZapOff}
              color={unusedCount > 0 ? '#ef4444' : '#6b7280'}
              index={3}
            />
          )}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-4">
          <SpendingChart data={chartData} currency={currency} />
          <RenewalTimeline subscriptions={subscriptions} currency={currency} />
        </div>

        {/* Controls Row: category filters + search + sort */}
        <div className="space-y-3">
          {/* Category filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
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
                    activeCategory === cat.id
                      ? 'text-white'
                      : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                  }`}
                  style={activeCategory === cat.id ? { backgroundColor: cat.color } : {}}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Search + Sort row */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search subscriptions…"
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-8 pr-8 py-2 text-sm text-[var(--text-primary)] placeholder-[color:var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <ArrowUpDown size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <select
                value={sortKey}
                onChange={e => setSortKey(e.target.value as SortKey)}
                className="appearance-none bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-7 pr-7 py-2 text-sm text-[var(--text-secondary)] focus:outline-none focus:border-blue-500 cursor-pointer transition-colors"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Subscriptions Grid */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-[var(--text-muted)] text-sm"
          >
            {searchQuery
              ? `No results for "${searchQuery}"`
              : 'No subscriptions in this category'}
          </motion.div>
        ) : (
          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((sub, i) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  currency={currency}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onMarkUsed={onMarkUsed}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </motion.div>
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
    </MotionConfig>
  );
};
