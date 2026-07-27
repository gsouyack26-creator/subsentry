import Dexie, { type EntityTable } from 'dexie';
import { Subscription } from '../types';

interface SettingsRecord {
  id?: number;
  key: string;
  value: string;
}

const db = new Dexie('SubSentryDB') as Dexie & {
  subscriptions: EntityTable<Subscription, 'id'>;
  settings: EntityTable<SettingsRecord, 'id'>;
};

db.version(1).stores({
  subscriptions: '++id, name, category, nextDate, billingCycle, createdAt',
  settings: '++id, &key',
});

/** Read a settings value by key, returns undefined if not set */
export const getSetting = async (key: string): Promise<string | undefined> => {
  const row = await db.settings.where('key').equals(key).first();
  return row?.value;
};

/** Upsert a settings key/value */
export const setSetting = async (key: string, value: string): Promise<void> => {
  const existing = await db.settings.where('key').equals(key).first();
  if (existing?.id) {
    await db.settings.update(existing.id, { value });
  } else {
    await db.settings.add({ key, value });
  }
};

export { db };
export type { SettingsRecord };
