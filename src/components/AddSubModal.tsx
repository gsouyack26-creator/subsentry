import { useState, useEffect } from 'react';
import { Subscription } from '../types';
import { CATEGORIES } from '../utils/categories';
import { X } from 'lucide-react';
import { todayISO } from '../utils/dates';

interface AddSubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sub: Omit<Subscription, 'id' | 'createdAt'>) => Promise<void>;
  editingSub?: Subscription | null;
}

const BILLING_CYCLES = ['weekly', 'monthly', 'quarterly', 'yearly'] as const;
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

const defaultForm = {
  name: '',
  amount: '',
  currency: 'USD',
  billingCycle: 'monthly' as Subscription['billingCycle'],
  nextDate: todayISO(),
  category: 'other',
  color: '#6b7280',
  notes: '',
};

export const AddSubModal = ({ isOpen, onClose, onSave, editingSub }: AddSubModalProps) => {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingSub) {
      setForm({
        name: editingSub.name,
        amount: editingSub.amount.toString(),
        currency: editingSub.currency,
        billingCycle: editingSub.billingCycle,
        nextDate: editingSub.nextDate,
        category: editingSub.category,
        color: editingSub.color,
        notes: editingSub.notes || '',
      });
    } else {
      setForm(defaultForm);
    }
    setError('');
  }, [editingSub, isOpen]);

  const handleCategoryChange = (catId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    setForm(f => ({ ...f, category: catId, color: cat?.color || '#6b7280' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.amount || isNaN(parseFloat(form.amount))) { setError('Valid amount is required'); return; }
    
    setSaving(true);
    setError('');
    try {
      await onSave({
        name: form.name.trim(),
        amount: parseFloat(form.amount),
        currency: form.currency,
        billingCycle: form.billingCycle,
        nextDate: form.nextDate,
        category: form.category,
        color: form.color,
        notes: form.notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError('Failed to save subscription');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1a1a1f] border border-[#2a2a32] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a32]">
          <h2 className="text-lg font-semibold text-white">
            {editingSub ? 'Edit Subscription' : 'Add Subscription'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Service Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Netflix, Spotify..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Amount + Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Amount *</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Currency</label>
              <select
                value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                className="w-full bg-[#0f0f11] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Billing Cycle */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Billing Cycle</label>
            <div className="grid grid-cols-4 gap-2">
              {BILLING_CYCLES.map(cycle => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, billingCycle: cycle }))}
                  className={`py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    form.billingCycle === cycle
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {cycle}
                </button>
              ))}
            </div>
          </div>

          {/* Next Renewal Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Next Renewal Date *</label>
            <input
              type="date"
              value={form.nextDate}
              onChange={e => setForm(f => ({ ...f, nextDate: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    form.category === cat.id ? 'border' : 'bg-white/5 hover:bg-white/10 text-gray-400'
                  }`}
                  style={form.category === cat.id ? {
                    backgroundColor: cat.color + '20',
                    borderColor: cat.color + '60',
                    color: cat.color,
                  } : {}}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Notes (optional)</label>
            <input
              type="text"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Any notes about this subscription..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium transition-colors"
            >
              {saving ? 'Saving...' : editingSub ? 'Update' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
