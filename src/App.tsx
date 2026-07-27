import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SettingsPage } from './components/SettingsPage';
import { AddSubModal } from './components/AddSubModal';
import { ImportStatementModal } from './components/ImportStatementModal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { useSubscriptions } from './hooks/useSubscriptions';
import { useSettings } from './hooks/useSettings';
import { useTheme } from './hooks/useTheme';
import { Subscription } from './types';
import { SAMPLE_DATA } from './utils/categories';
import { todayISO } from './utils/dates';
import { scheduleRenewalCheck, requestNotificationPermission } from './utils/notifications';
import { getSetting, setSetting } from './db/db';

function App() {
  const [page, setPage] = useState('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [statementImportOpen, setStatementImportOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, markAsUsed, clearAll, seedSampleData, isLoading } = useSubscriptions();
  const { currency, setSetting: setSettingHook, notificationsEnabled } = useSettings();
  const { theme, toggleTheme } = useTheme();

  // Check onboarding completion on load (once data is ready)
  useEffect(() => {
    if (isLoading) return;
    (async () => {
      const completed = await getSetting('onboardingComplete');
      if (!completed && subscriptions.length === 0) {
        setShowOnboarding(true);
      }
      setOnboardingChecked(true);
    })();
  }, [isLoading]); // intentionally omit subscriptions — only check on initial load

  // Run renewal check on load if notifications are enabled
  useEffect(() => {
    if (notificationsEnabled && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      scheduleRenewalCheck(subscriptions);
    }
  }, [notificationsEnabled, subscriptions]);

  const handleOnboardingComplete = async () => {
    await setSetting('onboardingComplete', 'true');
    setShowOnboarding(false);
  };

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

  const handleStatementImport = async (subs: Omit<Subscription, 'id'>[]) => {
    for (const sub of subs) {
      await addSubscription(sub);
    }
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (enabled) {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        await setSettingHook('notifications', 'true');
        scheduleRenewalCheck(subscriptions);
      }
    } else {
      await setSettingHook('notifications', 'false');
    }
  };

  if (isLoading || !onboardingChecked) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-[var(--text-muted)] text-sm animate-pulse">Loading SubSentry...</div>
      </div>
    );
  }

  return (
    <>
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
            onCurrencyChange={(c) => setSettingHook('currency', c)}
            subscriptions={subscriptions}
            onClearAll={clearAll}
            onSeedData={handleSeedData}
            onImport={handleImport}
            notificationsEnabled={notificationsEnabled}
            onNotificationsToggle={handleNotificationsToggle}
            onOpenStatementImport={() => setStatementImportOpen(true)}
          />
        )}

        <AddSubModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setEditingSub(null); }}
          onSave={handleSave}
          editingSub={editingSub}
        />

        <ImportStatementModal
          isOpen={statementImportOpen}
          onClose={() => setStatementImportOpen(false)}
          onImport={handleStatementImport}
          currency={currency}
          existingNames={subscriptions.map(s => s.name)}
        />
      </Layout>

      {/* Onboarding wizard — rendered outside Layout so it overlays everything */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingWizard
            onComplete={handleOnboardingComplete}
            onSeedData={handleSeedData}
            onOpenImport={() => setStatementImportOpen(true)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
