import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Subscription } from '../types';
import { nextRenewalDate, todayISO } from '../utils/dates';
import { getCategoryColor } from '../utils/categories';

export const useSubscriptions = () => {
  const subscriptions = useLiveQuery(
    () => db.subscriptions.orderBy('nextDate').toArray(),
    []
  );

  const addSubscription = async (sub: Omit<Subscription, 'id' | 'createdAt'>): Promise<number> => {
    const id = await db.subscriptions.add({
      ...sub,
      color: sub.color || getCategoryColor(sub.category),
      nextDate: nextRenewalDate(sub.nextDate, sub.billingCycle),
      createdAt: new Date().toISOString(),
    });
    return id as number;
  };

  const updateSubscription = async (id: number, updates: Partial<Subscription>): Promise<void> => {
    if (updates.nextDate && updates.billingCycle) {
      updates.nextDate = nextRenewalDate(updates.nextDate, updates.billingCycle);
    }
    if (updates.category && !updates.color) {
      updates.color = getCategoryColor(updates.category);
    }
    await db.subscriptions.update(id, updates);
  };

  const deleteSubscription = async (id: number): Promise<void> => {
    await db.subscriptions.delete(id);
  };

  const markAsUsed = async (id: number): Promise<void> => {
    await db.subscriptions.update(id, { lastUsedAt: todayISO() });
  };

  const clearAll = async (): Promise<void> => {
    await db.subscriptions.clear();
  };

  const seedSampleData = async (samples: Omit<Subscription, 'id' | 'createdAt' | 'nextDate'>[]): Promise<void> => {
    const now = new Date();
    for (let i = 0; i < samples.length; i++) {
      const daysOffset = Math.floor(Math.random() * 28) + 1;
      const nextDate = new Date(now);
      nextDate.setDate(nextDate.getDate() + daysOffset);
      await db.subscriptions.add({
        ...samples[i],
        nextDate: nextDate.toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      });
    }
  };

  return {
    subscriptions: subscriptions || [],
    addSubscription,
    updateSubscription,
    deleteSubscription,
    markAsUsed,
    clearAll,
    seedSampleData,
    isLoading: subscriptions === undefined,
  };
};
