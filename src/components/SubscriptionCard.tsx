import { Subscription } from '../types';
import { daysUntilRenewal, formatCountdown, formatCurrency, normalizeToMonthly, formatDate } from '../utils/dates';
import { getCategoryById } from '../utils/categories';
import { Pencil, Trash2, CheckCircle } from 'lucide-react';

interface SubscriptionCardProps {
  subscription: Subscription;
  currency: string;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: number) => void;
  onMarkUsed: (id: number) => void;
}

export const SubscriptionCard = ({ subscription, currency, onEdit, onDelete, onMarkUsed }: SubscriptionCardProps) => {
  const days = daysUntilRenewal(subscription.nextDate);
  const { label, urgency } = formatCountdown(days);
  const category = getCategoryById(subscription.category);
  const monthlyAmount = normalizeToMonthly(subscription.amount, subscription.billingCycle);
  
  const isUsedRecently = subscription.lastUsedAt && daysUntilRenewal(subscription.lastUsedAt) > -30;

  const chipClass = urgency === 'critical' 
    ? 'bg-red-500/20 text-red-400 border-red-500/30'
    : urgency === 'warning'
    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    : 'bg-white/5 text-gray-400 border-white/10';

  return (
    <div className="relative bg-[#1a1a1f] border border-[#2a2a32] rounded-xl overflow-hidden hover:-translate-y-0.5 hover:border-white/20 transition-all duration-200 group">
      {/* Color accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: subscription.color || category.color }} />
      
      <div className="p-4 pl-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Icon circle */}
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: (subscription.color || category.color) + '25', color: subscription.color || category.color }}
            >
              {subscription.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white truncate">{subscription.name}</h3>
              <span 
                className="text-xs px-2 py-0.5 rounded-full inline-block mt-0.5"
                style={{ 
                  backgroundColor: (subscription.color || category.color) + '20',
                  color: subscription.color || category.color,
                }}
              >
                {category.label}
              </span>
            </div>
          </div>
          
          {/* Actions (hidden until hover) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => subscription.id && onMarkUsed(subscription.id)}
              className="p-1.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-green-400 transition-colors"
              title="Mark as used today"
            >
              <CheckCircle size={14} />
            </button>
            <button
              onClick={() => onEdit(subscription)}
              className="p-1.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-blue-400 transition-colors"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => subscription.id && onDelete(subscription.id)}
              className="p-1.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        
        {/* Amount */}
        <div className="mb-3">
          <div className="text-xl font-bold text-white">
            {formatCurrency(subscription.amount, currency)}
            <span className="text-xs text-gray-400 font-normal ml-1">/{subscription.billingCycle}</span>
          </div>
          {subscription.billingCycle !== 'monthly' && (
            <div className="text-xs text-gray-500 mt-0.5">
              ≈ {formatCurrency(monthlyAmount, currency)}/mo
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {formatDate(subscription.nextDate)}
          </div>
          <div className="flex items-center gap-2">
            {/* Last used indicator */}
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: isUsedRecently ? '#10b981' : '#4b5563' }}
              title={isUsedRecently ? 'Used recently' : 'Not used in 30+ days'}
            />
            {/* Countdown chip */}
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${chipClass}`}>
              {label}
            </span>
          </div>
        </div>
        
        {subscription.notes && (
          <p className="text-xs text-gray-500 mt-2 truncate">{subscription.notes}</p>
        )}
      </div>
    </div>
  );
};
