import { BillingCycle } from '../types';

export const nextRenewalDate = (currentDate: string, cycle: BillingCycle): string => {
  const date = new Date(currentDate);
  const now = new Date();
  
  // If date is already in the future, return it
  if (date > now) return currentDate;
  
  // Advance date until it's in the future
  while (date <= now) {
    switch (cycle) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
  }
  
  return date.toISOString().split('T')[0];
};

export const daysUntilRenewal = (dateStr: string): number => {
  const date = new Date(dateStr);
  const now = new Date();
  // Reset time to midnight for accurate day count
  date.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const diffMs = date.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

/** Returns positive days elapsed since a past date (0 if today or future). */
export const daysSince = (dateStr: string): number => {
  const date = new Date(dateStr);
  const now = new Date();
  date.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffMs = now.getTime() - date.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
};

export const formatCountdown = (days: number): { label: string; urgency: 'critical' | 'warning' | 'normal' } => {
  if (days < 0) return { label: 'Overdue', urgency: 'critical' };
  if (days === 0) return { label: 'TODAY', urgency: 'critical' };
  if (days === 1) return { label: 'Tomorrow', urgency: 'critical' };
  if (days <= 3) return { label: `In ${days} days`, urgency: 'warning' };
  if (days <= 7) return { label: `In ${days} days`, urgency: 'warning' };
  return { label: `In ${days} days`, urgency: 'normal' };
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const normalizeToMonthly = (amount: number, cycle: BillingCycle): number => {
  switch (cycle) {
    case 'weekly': return amount * 4.33;
    case 'monthly': return amount;
    case 'quarterly': return amount / 3;
    case 'yearly': return amount / 12;
  }
};

export const normalizeToYearly = (amount: number, cycle: BillingCycle): number => {
  switch (cycle) {
    case 'weekly': return amount * 52;
    case 'monthly': return amount * 12;
    case 'quarterly': return amount * 4;
    case 'yearly': return amount;
  }
};

export const getMonthName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short' });
};

export const getLast6Months = (): Array<{ year: number; month: number; label: string }> => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    });
  }
  return months;
};

/** Returns true if the subscription has not been used for thresholdDays or more. */
export const isUnused = (lastUsedAt?: string, thresholdDays: number = 30): boolean => {
  if (!lastUsedAt) return false;
  return daysSince(lastUsedAt) >= thresholdDays;
};

export const todayISO = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const addDaysISO = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};
