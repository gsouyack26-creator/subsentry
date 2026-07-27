import { Subscription } from '../types';
import { daysUntilRenewal } from './dates';

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return await Notification.requestPermission();
};

export const scheduleRenewalCheck = (subscriptions: Subscription[]): void => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const today = new Date().toISOString().split('T')[0];

  subscriptions.forEach(sub => {
    if (!sub.id) return;
    const days = daysUntilRenewal(sub.nextDate);
    if (days >= 0 && days <= 3) {
      // Deduplicate: one notification per subscription per day
      const key = `notif-${sub.id}-${today}`;
      if (!localStorage.getItem(key)) {
        const dayLabel =
          days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`;
        try {
          new Notification(`${sub.name} renews ${dayLabel}`, {
            body: `Your ${sub.name} subscription renews ${dayLabel}.`,
            icon: '/favicon.svg',
            tag: key,
          });
          localStorage.setItem(key, '1');
        } catch {
          // Notification API may not be available in all contexts
        }
      }
    }
  });
};
