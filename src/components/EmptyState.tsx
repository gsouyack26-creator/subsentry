import { CreditCard, Plus, Sparkles, FileSearch } from 'lucide-react';

interface EmptyStateProps {
  onAddFirst: () => void;
  onSeedData: () => void;
  onImportStatement?: () => void;
}

export const EmptyState = ({ onAddFirst, onSeedData, onImportStatement }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
        <CreditCard size={32} className="text-blue-500" />
      </div>
      <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No subscriptions yet</h2>
      <p className="text-[var(--text-secondary)] max-w-sm mb-8 leading-relaxed">
        Add subscriptions manually, import from a bank statement to auto-detect recurring charges, or load sample data to explore.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap justify-center">
        <button
          onClick={onAddFirst}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={16} />
          Add manually
        </button>
        {onImportStatement && (
          <button
            onClick={onImportStatement}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] rounded-lg font-medium transition-colors border border-[var(--border)]"
          >
            <FileSearch size={16} />
            Import from statement
          </button>
        )}
        <button
          onClick={onSeedData}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] rounded-lg font-medium transition-colors border border-[var(--border)]"
        >
          <Sparkles size={16} />
          Load sample data
        </button>
      </div>
    </div>
  );
};
