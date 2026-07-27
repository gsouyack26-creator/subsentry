import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SettingsPage } from './components/SettingsPage';
import { AddSubModal } from './components/AddSubModal';
import { useSubscriptions } from './hooks/useSubscriptions';
import { useSettings } from './hooks/useSettings';
import { Subscription } from './types';
import { SAMPLE_DATA } from './utils/categories';
import { todayISO } from './utils/dates';

function App() {
  const [page, setPage] = useState('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, markAsUsed, clearAll, seedSampleData, isLoading } = useSubscriptions();
  const { currency, setSetting } = useSettings();

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">Loading SubSentry...</div>
      </div>
    );
  }

  return (
    <Layout currentPage={page} onNavigate={setPage}>
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
