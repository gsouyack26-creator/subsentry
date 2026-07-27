import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, ShieldCheck, ChevronDown, AlertCircle } from 'lucide-react';
import { Subscription } from '../types';
import { CATEGORIES, getCategoryColor } from '../utils/categories';
import { nextRenewalDate, todayISO } from '../utils/dates';
import { parseStatementCSV, detectRecurring, SuggestedSub } from '../utils/statementImport';

interface ImportStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (subs: Omit<Subscription, 'id'>[]) => Promise<void>;
  currency: string;
  existingNames: string[];
}

interface RowState {
  checked: boolean;
  category: string;
}

function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/(?:^|\s|-)\S/g, c => c.toUpperCase())
    .trim();
}

function confidenceLabel(c: number): { label: string; className: string } {
  if (c >= 0.75) return { label: 'High', className: 'bg-green-500/20 text-green-400 border border-green-500/30' };
  if (c >= 0.50) return { label: 'Medium', className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' };
  return { label: 'Low', className: 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]' };
}

function cycleLabel(cycle: Subscription['billingCycle']): string {
  return { weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly' }[cycle];
}

export const ImportStatementModal = ({
  isOpen,
  onClose,
  onImport,
  currency,
  existingNames,
}: ImportStatementModalProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'pick' | 'review'>('pick');
  const [suggestions, setSuggestions] = useState<SuggestedSub[]>([]);
  const [rowStates, setRowStates] = useState<RowState[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [parseError, setParseError] = useState('');
  const [importing, setImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const existingNamesLower = existingNames.map(n => n.toLowerCase());

  const processFile = useCallback((file: File) => {
    setParseError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const transactions = parseStatementCSV(text);
        if (transactions.length === 0) {
          setParseError('No valid transactions found. Check that the file is a bank/card statement CSV with date, description, and amount columns.');
          return;
        }
        const detected = detectRecurring(transactions);
        setSuggestions(detected);
        setTotalTransactions(transactions.length);
        setRowStates(
          detected.map(s => ({
            checked: s.confidence >= 0.6,
            category: s.category,
          }))
        );
        setStep('review');
      } catch {
        setParseError('Failed to parse CSV. Make sure the file is a valid bank/card statement export.');
      }
    };
    reader.onerror = () => setParseError('Failed to read file.');
    reader.readAsText(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) processFile(file);
  };

  const toggleRow = (i: number) => {
    setRowStates(prev => prev.map((r, idx) => idx === i ? { ...r, checked: !r.checked } : r));
  };

  const setCategoryForRow = (i: number, cat: string) => {
    setRowStates(prev => prev.map((r, idx) => idx === i ? { ...r, category: cat } : r));
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const toAdd: Omit<Subscription, 'id'>[] = [];
      let skipped = 0;

      suggestions.forEach((s, i) => {
        if (!rowStates[i].checked) return;
        const name = toTitleCase(s.merchant);
        if (existingNamesLower.includes(name.toLowerCase())) {
          skipped++;
          return;
        }
        const category = rowStates[i].category;
        const color = getCategoryColor(category);
        const nextDate = nextRenewalDate(s.lastDate, s.billingCycle);
        toAdd.push({
          name,
          amount: s.amount,
          currency,
          billingCycle: s.billingCycle,
          nextDate,
          category,
          color,
          createdAt: new Date().toISOString(),
        });
      });

      await onImport(toAdd);
      onClose();
      resetState();

      if (skipped > 0) {
        // Brief toast handled by parent — we just close
      }
    } finally {
      setImporting(false);
    }
  };

  const resetState = () => {
    setStep('pick');
    setSuggestions([]);
    setRowStates([]);
    setParseError('');
    setTotalTransactions(0);
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  const checkedCount = rowStates.filter(r => r.checked).length;
  const alreadyExistCount = suggestions.filter((s, i) =>
    rowStates[i]?.checked && existingNamesLower.includes(toTitleCase(s.merchant).toLowerCase())
  ).length;
  const toAddCount = checkedCount - alreadyExistCount;

  return (
    <AnimatePresence>
      {isOpen && (
    <motion.div
      key="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)] shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Import from Bank Statement</h2>
            {step === 'review' && (
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                Found <span className="text-[var(--text-primary)] font-medium">{suggestions.length}</span> recurring
                charges from <span className="text-[var(--text-primary)] font-medium">{totalTransactions}</span> transactions
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-[var(--surface-hover)] rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">

          {/* STEP 1 — File picker */}
          {step === 'pick' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`cursor-pointer border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-[var(--border)] hover:border-blue-500/50 hover:bg-[var(--surface)]'
                }`}
              >
                <Upload size={32} className="text-[var(--text-muted)]" />
                <div className="text-center">
                  <p className="text-[var(--text-primary)] font-medium">Drop your CSV here or click to browse</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Supports Chase, Bank of America, Capital One, Citi, Wells Fargo, and most other bank/card exports
                  </p>
                </div>
                <span className="text-xs text-[var(--text-muted)]">.csv files only</span>
              </div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

              {parseError && (
                <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  {parseError}
                </div>
              )}

              {/* Privacy line */}
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] bg-[var(--surface)] rounded-lg px-3 py-2.5">
                <ShieldCheck size={13} className="text-green-400 shrink-0" />
                Your statement is parsed entirely in your browser — nothing is uploaded.
              </div>
            </div>
          )}

          {/* STEP 2 — Review suggestions */}
          {step === 'review' && (
            <div className="space-y-3">
              {suggestions.length === 0 ? (
                <p className="text-[var(--text-secondary)] text-sm text-center py-8">
                  No recurring charges detected. Your statement may have too few transactions per merchant.
                </p>
              ) : (
                suggestions.map((s, i) => {
                  const conf = confidenceLabel(s.confidence);
                  const rowCat = rowStates[i]?.category ?? s.category;
                  const catObj = CATEGORIES.find(c => c.id === rowCat) ?? CATEGORIES[CATEGORIES.length - 1];
                  const alreadyExists = existingNamesLower.includes(toTitleCase(s.merchant).toLowerCase());

                  return (
                    <div
                      key={s.normalizedKey}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                        rowStates[i]?.checked && !alreadyExists
                          ? 'bg-[var(--surface)] border-[var(--border)]'
                          : 'bg-[var(--surface)]/50 border-[var(--border)]/50 opacity-60'
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => !alreadyExists && toggleRow(i)}
                        disabled={alreadyExists}
                        className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          rowStates[i]?.checked && !alreadyExists
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-transparent border-[var(--border)]'
                        }`}
                      >
                        {rowStates[i]?.checked && !alreadyExists && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[var(--text-primary)] font-medium text-sm truncate">
                            {toTitleCase(s.merchant)}
                          </span>
                          {alreadyExists && (
                            <span className="text-xs bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] rounded-full px-2 py-0.5">
                              Already added
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[var(--text-secondary)] text-sm font-medium">
                            ${s.amount.toFixed(2)} / {cycleLabel(s.billingCycle).toLowerCase()}
                          </span>
                          <span className="text-[var(--text-muted)] text-xs">
                            seen {s.occurrences}×
                          </span>
                        </div>
                      </div>

                      {/* Category dropdown */}
                      <div className="relative shrink-0">
                        <div className="relative">
                          <select
                            value={rowCat}
                            onChange={e => setCategoryForRow(i, e.target.value)}
                            disabled={alreadyExists}
                            className="appearance-none bg-[var(--bg)] border border-[var(--border)] rounded-lg text-xs font-medium pl-5 pr-6 py-1.5 text-[var(--text-secondary)] focus:outline-none focus:border-blue-500 cursor-pointer disabled:cursor-default"
                            style={{ color: catObj.color }}
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                          </select>
                          {/* Color dot */}
                          <span
                            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none"
                            style={{ backgroundColor: catObj.color }}
                          />
                          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                        </div>
                      </div>

                      {/* Confidence pill */}
                      <span className={`text-xs rounded-full px-2 py-0.5 shrink-0 font-medium ${conf.className}`}>
                        {conf.label}
                      </span>
                    </div>
                  );
                })
              )}

              {/* Privacy line */}
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] bg-[var(--surface)] rounded-lg px-3 py-2.5 mt-2">
                <ShieldCheck size={13} className="text-green-400 shrink-0" />
                Your statement is parsed entirely in your browser — nothing is uploaded.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'review' && suggestions.length > 0 && (
          <div className="p-5 border-t border-[var(--border)] shrink-0 flex items-center gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] font-medium transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={importing || toAddCount === 0}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors text-sm"
            >
              {importing
                ? 'Adding…'
                : toAddCount === 0
                  ? 'Nothing selected'
                  : `Add ${toAddCount} subscription${toAddCount !== 1 ? 's' : ''}`
              }
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};
