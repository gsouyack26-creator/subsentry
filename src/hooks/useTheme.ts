import { useEffect, useState } from 'react';
import { db } from '../db/db';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'subsentry-theme';

const getStoredTheme = (): Theme => {
  return (localStorage.getItem(STORAGE_KEY) as Theme) || 'dark';
};

const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  root.classList.toggle('light', theme === 'light');
  root.classList.toggle('dark', theme === 'dark');
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    // Also persist to Dexie for backup
    db.settings.where('key').equals('theme').first().then(existing => {
      if (existing?.id) {
        db.settings.update(existing.id, { value: theme });
      } else {
        db.settings.add({ key: 'theme', value: theme });
      }
    });
  }, [theme]);

  const toggleTheme = (): void => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme };
};
