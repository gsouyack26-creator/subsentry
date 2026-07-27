import { Alert } from '../types';
import { Bell, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertBannerProps {
  alerts: Alert[];
}

export const AlertBanner = ({ alerts }: AlertBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  const criticalAlerts = alerts.filter(a => (a.daysUntil ?? 999) <= 1);
  const urgency = criticalAlerts.length > 0 ? 'critical' : 'warning';

  return (
    <AnimatePresence>
      {!dismissed && alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`relative flex items-center gap-3 px-4 py-3 rounded-lg mb-4 text-sm font-medium overflow-hidden ${
            urgency === 'critical' 
              ? 'bg-red-500/15 border border-red-500/30 text-red-400' 
              : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
          }`}
        >
          <Bell size={16} className="shrink-0" />
          <div className="flex-1">
            {alerts.length === 1 ? (
              <span>{alerts[0].message}</span>
            ) : (
              <span>
                {alerts.length} subscriptions renewing soon — {alerts.map(a => a.message.split(' ')[0]).join(', ')}
              </span>
            )}
          </div>
          <button 
            onClick={() => setDismissed(true)}
            className="ml-auto shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss alert"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
