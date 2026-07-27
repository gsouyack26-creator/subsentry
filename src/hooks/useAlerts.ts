import { useMemo } from 'react';
import { Subscription, Alert } from '../types';
import { daysUntilRenewal, isUnused } from '../utils/dates';

export const useAlerts = (subscriptions: Subscription[]) => {
  const alerts = useMemo((): Alert[] => {
    const result: Alert[] = [];
    
    subscriptions.forEach(sub => {
      if (!sub.id) return;
      
      const days = daysUntilRenewal(sub.nextDate);
      
      // Renewal soon alert (within 3 days)
      if (days >= 0 && days <= 3) {
        result.push({
          id: sub.id,
          subscriptionId: sub.id,
          type: 'renewal-soon',
          message: days === 0 
            ? `${sub.name} renews TODAY` 
            : days === 1 
              ? `${sub.name} renews tomorrow`
              : `${sub.name} renews in ${days} days`,
          daysUntil: days,
        });
      }
      
      // Unused subscription alert (30+ days since last used)
      if (isUnused(sub.lastUsedAt, 30)) {
        result.push({
          id: sub.id * 10000,
          subscriptionId: sub.id,
          type: 'unused',
          message: `${sub.name} hasn't been used in 30+ days`,
        });
      }
    });
    
    return result.sort((a, b) => (a.daysUntil ?? 999) - (b.daysUntil ?? 999));
  }, [subscriptions]);

  const renewalAlerts = alerts.filter(a => a.type === 'renewal-soon');
  const unusedAlerts = alerts.filter(a => a.type === 'unused');
  
  return { alerts, renewalAlerts, unusedAlerts };
};
