import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export const useSettings = () => {
  const settings = useLiveQuery(async () => {
    const rows = await db.settings.toArray();
    const map: Record<string, string> = {};
    rows.forEach(row => { map[row.key] = row.value; });
    return map;
  }, []);

  const getSetting = (key: string, defaultValue: string = ''): string => {
    return settings?.[key] ?? defaultValue;
  };

  const setSetting = async (key: string, value: string): Promise<void> => {
    const existing = await db.settings.where('key').equals(key).first();
    if (existing?.id) {
      await db.settings.update(existing.id, { value });
    } else {
      await db.settings.add({ key, value });
    }
  };

  const monthlyBudgetRaw = settings?.['monthlyBudget'] ?? '';
  const monthlyBudget = monthlyBudgetRaw ? parseFloat(monthlyBudgetRaw) : null;

  return {
    settings: settings || {},
    getSetting,
    setSetting,
    currency: settings?.['currency'] ?? 'USD',
    notificationsEnabled: settings?.['notifications'] === 'true',
    monthlyBudget,
  };
};
