import { useState, useRef } from 'react';
import { Subscription } from '../types';
import { exportToCSV, importFromCSV } from '../utils/csv';
import { SAMPLE_DATA } from '../utils/categories';
import { Download, Upload, Trash2, Sparkles, Save, AlertCircle } from 'lucide-react';

const CURRENCIES = [
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'CAD', label: 'Canadian Dollar (CA$)' },
  { code: 'AUD', label: 'Australian Dollar (A$)' },
  { code: 'JPY', label: 'Japanese Yen (¥)' },
];

interface SettingsPageProps {
  currency: string;
  onCurrencyChange: (currency: string) => void;
  subscriptions: Subscription[];
  onClearAll: () => Promise<void>;
  onSeedData: () => Promise<void>;
  onImport: (subs: Omit<Subscription, 'id'>[]) => Promise<void>;
}

export const SettingsPage = ({
  currency,
  onCurrencyChange,
  subscriptions,
  onClearAll,
  onSeedData,
  onImport,
}: SettingsPageProps) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleExport = () => {
    if (subscriptions.length === 0) {
      showMessage('error', 'No subscriptions to export');
      return;
    }
    exportToCSV(subscriptions);
    showMessage('success', `Exported ${subscriptions.length} subscriptions`);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const subs = await importFromCSV(file);
      await onImport(subs);
      showMessage('success', `Imported ${subs.length} subscriptions`);
    } catch {
      showMessage('error', 'Failed to import CSV. Check format and try again.');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClearAll = async () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    await onClearAll();
    setConfirmClear(false);
    showMessage('success', 'All subscriptions cleared');
  };

  const handleSeedData = async () => {
    await onSeedData();
    showMessage('success', '6 sample subscriptions added');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-gray-400 text-sm">Manage your preferences and data</p>
      </div>

      {/* Status message */}
      {message && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
          message.type === 'success' 
            ? 'bg-green-500/15 border border-green-500/30 text-green-400' 
            : 'bg-red-500/15 border border-red-500/30 text-red-400'
        }`}>
          <AlertCircle size={14} />
          {message.text}
        </div>
      )}

      {/* Currency */}
      <div className="bg-[#1a1a1f] border border-[#2a2a32] rounded-xl p-5">
        <h2 className="text-base font-semibold text-white mb-1">Currency</h2>
        <p className="text-sm text-gray-400 mb-4">Default currency for displaying costs</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              onClick={() => onCurrencyChange(c.code)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                currency === c.code
                  ? 'bg-blue-600/20 border border-blue-500/40 text-blue-400'
                  : 'bg-white/5 border border-transparent text-gray-400 hover:bg-white/10'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-[#1a1a1f] border border-[#2a2a32] rounded-xl p-5">
        <h2 className="text-base font-semibold text-white mb-1">Data</h2>
        <p className="text-sm text-gray-400 mb-4">Export, import, or reset your subscription data</p>
        <div className="space-y-3">
          {/* Export */}
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 font-medium transition-colors text-left"
          >
            <Download size={16} className="text-blue-400 shrink-0" />
            <div>
              <div>Export to CSV</div>
              <div className="text-xs text-gray-500 font-normal">{subscriptions.length} subscriptions</div>
            </div>
          </button>

          {/* Import */}
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 font-medium transition-colors text-left"
          >
            <Upload size={16} className="text-green-400 shrink-0" />
            <div>
              <div>Import from CSV</div>
              <div className="text-xs text-gray-500 font-normal">Merge from backup file</div>
            </div>
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImportFile} />

          {/* Seed */}
          <button
            onClick={handleSeedData}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 font-medium transition-colors text-left"
          >
            <Sparkles size={16} className="text-purple-400 shrink-0" />
            <div>
              <div>Load Sample Data</div>
              <div className="text-xs text-gray-500 font-normal">Adds 6 example subscriptions</div>
            </div>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#1a1a1f] border border-red-500/20 rounded-xl p-5">
        <h2 className="text-base font-semibold text-red-400 mb-1">Danger Zone</h2>
        <p className="text-sm text-gray-400 mb-4">Irreversible actions</p>
        <button
          onClick={handleClearAll}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
            confirmClear
              ? 'bg-red-600 hover:bg-red-500 text-white border border-red-500'
              : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
          }`}
        >
          <Trash2 size={16} />
          {confirmClear ? 'Click again to confirm — this cannot be undone' : 'Clear All Subscriptions'}
        </button>
        {confirmClear && (
          <button
            onClick={() => setConfirmClear(false)}
            className="ml-3 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* App Info */}
      <div className="text-xs text-gray-600 space-y-1">
        <p>SubSentry v0.1.0 — Offline-first subscription tracker</p>
        <p>All data is stored locally in your browser. No data is sent to any server.</p>
        <p>Built with React + Dexie.js + TailwindCSS</p>
      </div>
    </div>
  );
};
