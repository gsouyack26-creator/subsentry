import { Category } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'streaming', label: 'Streaming', color: '#8b5cf6' },
  { id: 'software', label: 'Software', color: '#3b82f6' },
  { id: 'finance', label: 'Finance', color: '#10b981' },
  { id: 'health', label: 'Health', color: '#f59e0b' },
  { id: 'gaming', label: 'Gaming', color: '#ec4899' },
  { id: 'shopping', label: 'Shopping', color: '#06b6d4' },
  { id: 'other', label: 'Other', color: '#6b7280' },
];

export const getCategoryById = (id: string): Category => {
  return CATEGORIES.find(c => c.id.toLowerCase() === id.toLowerCase()) 
    || CATEGORIES.find(c => c.id === 'other')!;
};

export const getCategoryColor = (category: string): string => {
  return getCategoryById(category).color;
};

export const SAMPLE_DATA = [
  {
    name: 'Netflix',
    amount: 15.99,
    currency: 'USD',
    billingCycle: 'monthly' as const,
    category: 'streaming',
    color: '#8b5cf6',
    notes: 'Family plan',
  },
  {
    name: 'Spotify',
    amount: 9.99,
    currency: 'USD',
    billingCycle: 'monthly' as const,
    category: 'streaming',
    color: '#8b5cf6',
    notes: 'Premium individual',
  },
  {
    name: 'Adobe Creative Cloud',
    amount: 54.99,
    currency: 'USD',
    billingCycle: 'monthly' as const,
    category: 'software',
    color: '#3b82f6',
    notes: 'All Apps plan',
  },
  {
    name: 'Gym Membership',
    amount: 39.99,
    currency: 'USD',
    billingCycle: 'monthly' as const,
    category: 'health',
    color: '#f59e0b',
    notes: 'Local fitness center',
  },
  {
    name: 'Amazon Prime',
    amount: 14.99,
    currency: 'USD',
    billingCycle: 'monthly' as const,
    category: 'shopping',
    color: '#06b6d4',
    notes: 'Includes Prime Video',
  },
  {
    name: 'Xbox Game Pass',
    amount: 14.99,
    currency: 'USD',
    billingCycle: 'monthly' as const,
    category: 'gaming',
    color: '#ec4899',
    notes: 'Ultimate subscription',
  },
];
