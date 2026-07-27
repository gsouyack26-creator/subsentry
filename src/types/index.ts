export interface Subscription {
  id?: number;
  name: string;
  amount: number;
  currency: string;
  billingCycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextDate: string; // ISO date
  category: string;
  color: string; // hex for card accent
  notes?: string;
  createdAt: string;
  lastUsedAt?: string; // for unused detection
}

export interface Category {
  id: string;
  label: string;
  color: string;
}

export interface Alert {
  id: number;
  subscriptionId: number;
  type: 'renewal-soon' | 'unused';
  message: string;
  daysUntil?: number;
}

export interface Settings {
  currency: string;
  notificationsEnabled: boolean;
  theme: 'dark' | 'light';
}

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
