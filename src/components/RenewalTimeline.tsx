import { Subscription } from '../types';
import { daysUntilRenewal, formatCountdown, formatCurrency, formatDate } from '../utils/dates';
import { getCategoryById } from '../utils/categories';
import { Calendar } from 'lucide-react';

interface RenewalTimelineProps {
  subscriptions: Subscription[];
  currency: string;
}

export const RenewalTimeline = ({ subscriptions, currency }: RenewalTimelineProps) => {
  const sorted = [...subscriptions]
    .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())
    .slice(0, 8);

  if (sorted.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-blue-500" />
          Upcoming Renewals
        </h2>
        <p className="text-[var(--text-muted)] text-sm text-center py-8">No upcoming renewals</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <Calendar size={18} className="text-blue-500" />
        Upcoming Renewals
      </h2>
      <div className="space-y-2">
        {sorted.map(sub => {
          const days = daysUntilRenewal(sub.nextDate);
          const { label, urgency } = formatCountdown(days);
          const category = getCategoryById(sub.category);
          
          const chipClass = urgency === 'critical'
            ? 'bg-red-500/20 text-red-400'
            : urgency === 'warning'
            ? 'bg-amber-500/20 text-amber-400'
            : 'bg-[var(--surface)] text-[var(--text-muted)]';

          return (
            <div key={sub.id} className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] last:border-0">
              <div 
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: sub.color || category.color }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-[var(--text-primary)] truncate block">{sub.name}</span>
                <span className="text-xs text-[var(--text-muted)]">{formatDate(sub.nextDate)}</span>
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)] shrink-0">
                {formatCurrency(sub.amount, currency)}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${chipClass}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
