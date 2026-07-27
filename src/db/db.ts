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

export { db };
export type { SettingsRecord };
