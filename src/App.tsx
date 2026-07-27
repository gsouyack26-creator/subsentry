import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SettingsPage } from './components/SettingsPage';
import { AddSubModal } from './components/AddSubModal';
import { useSubscriptions } from './hooks/useSubscriptions';
import { useSettings } from './hooks/useSettings';
import { useTheme } from './hooks/useTheme';
import { Subscription } from './types';
import { SAMPLE_DATA } from './utils/categories';
import { todayISO } from './utils/dates';
import { scheduleRenewalCheck, requestNotificationPermission } from './utils/notifications';

function App() {
  const [page, setPage] = useState('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, markAsUsed, clearAll, seedSampleData, isLoading } = useSubscriptions();
  const { currency, setSetting, notificationsEnabled } = useSettings();
  const { theme, toggleTheme } = useTheme();

  // Run renewal check on load if notifications are enabled
  useEffect(() => {
    if (notificationsEnabled && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      scheduleRenewalCheck(subscriptions);
    }
  }, [notificationsEnabled, subscriptions]);

  const handleAdd = () => {
    setEditingSub(null);
    setModalOpen(true);
  };

  const handleEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this subscription?')) {
      await deleteSubscription(id);
    }
  };

  const handleSave = async (sub: Omit<Subscription, 'id' | 'createdAt'>) => {
    if (editingSub?.id) {
      await updateSubscription(editingSub.id, sub);
    } else {
      await addSubscription(sub);
    }
  };

  const handleSeedData = async () => {
    await seedSampleData(SAMPLE_DATA);
  };

  const handleImport = async (subs: Omit<Subscription, 'id'>[]) => {
    for (const sub of subs) {
      await addSubscription({
        ...sub,
        nextDate: sub.nextDate || todayISO(),
      });
    }
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (enabled) {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        await setSetting('notifications', 'true');
        scheduleRenewalCheck(subscriptions);
      }
    } else {
      await setSetting('notifications', 'false');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-[var(--text-muted)] text-sm animate-pulse">Loading SubSentry...</div>
      </div>
    );
  }

  return (
    <Layout currentPage={page} onNavigate={setPage} theme={theme} onToggleTheme={toggleTheme}>
      {page === 'dashboard' && (
        <Dashboard
          subscriptions={subscriptions}
          currency={currency}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMarkUsed={markAsUsed}
          onSeedData={handleSeedData}
        />
      )}
      {page === 'settings' && (
        <SettingsPage
          currency={currency}
          onCurrencyChange={(c) => setSetting('currency', c)}
          subscriptions={subscriptions}
          onClearAll={clearAll}
          onSeedData={handleSeedData}
          onImport={handleImport}
          notificationsEnabled={notificationsEnabled}
          onNotificationsToggle={handleNotificationsToggle}
        />
      )}

      <AddSubModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingSub(null); }}
        onSave={handleSave}
        editingSub={editingSub}
      />
    </Layout>
  );
}

export default App;
