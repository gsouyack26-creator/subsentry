import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/dates';

interface BudgetGaugeProps {
  spent: number;
  budget: number;
  currency: string;
  index?: number;
}

export const BudgetGauge = ({ spent, budget, currency, index = 0 }: BudgetGaugeProps) => {
  const pct = budget > 0 ? Math.min(spent / budget, 1) : 0;
  const over = spent > budget;
  const pctDisplay = Math.round(pct * 100);

  const barColor = over
    ? '#ef4444'          // red — over budget
    : pct >= 0.85
    ? '#f59e0b'          // amber — near limit
    : '#10b981';         // green — healthy

  return (
    <motion.div
      custom={index}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut', delay: index * 0.06 } }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-[var(--text-secondary)] mb-1">Monthly Budget</div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {pctDisplay}%
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">
            {formatCurrency(spent, currency)} of {formatCurrency(budget, currency)}
          </div>
        </div>
        {over && (
          <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/25 rounded-full px-2 py-0.5 font-medium">
            Over
          </span>
        )}
      </div>

      {/* Bar */}
      <div className="h-2 bg-[var(--surface)] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.06 + 0.15 }}
        />
      </div>
    </motion.div>
  );
};
