import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Database, Upload, Plus, CheckCircle2 } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
  onSeedData: () => Promise<void>;
  onOpenImport: () => void;
}

const STEP_COUNT = 3;

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  }),
};

export const OnboardingWizard = ({ onComplete, onSeedData, onOpenImport }: OnboardingWizardProps) => {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [skippedToImport, setSkippedToImport] = useState(false);

  const goTo = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const handleSeedData = async () => {
    await onSeedData();
    onComplete();
  };

  const handleImport = () => {
    setSkippedToImport(true);
    onComplete();
    onOpenImport();
  };

  const handleManual = () => {
    goTo(2);
  };

  const handleDone = () => {
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-5 pb-2">
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === step ? 20 : 6, opacity: i === step ? 1 : 0.35 }}
              transition={{ duration: 0.2 }}
              className="h-1.5 rounded-full bg-blue-500"
            />
          ))}
        </div>

        {/* Step content */}
        <div className="relative overflow-hidden" style={{ minHeight: 340 }}>
          <AnimatePresence custom={dir} mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 p-7 flex flex-col"
              >
                {/* Logo + title */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/30">
                    <Shield size={28} className="text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                    Welcome to SubSentry
                  </h1>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Your offline-first subscription tracker
                  </p>
                </div>

                {/* Benefit bullets */}
                <div className="space-y-3 mb-8">
                  {[
                    'Track every subscription in one place',
                    'Never get surprised by a renewal',
                    'See exactly what you spend monthly & yearly',
                  ].map((text, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.08, duration: 0.2 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
                      <span className="text-sm text-[var(--text-secondary)]">{text}</span>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={() => goTo(1)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
                >
                  Get Started
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 p-7 flex flex-col"
              >
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1 text-center">
                  How do you want to start?
                </h2>
                <p className="text-xs text-[var(--text-secondary)] text-center mb-5">
                  You can always add more later
                </p>

                <div className="space-y-3 mb-5">
                  {/* Load sample data */}
                  <button
                    onClick={handleSeedData}
                    className="w-full flex items-center gap-4 p-4 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-blue-500/40 rounded-xl transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0 group-hover:bg-blue-500/25 transition-colors">
                      <Database size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--text-primary)] text-sm">
                        Load sample data
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                        Explore with 6 example subscriptions
                      </div>
                    </div>
                  </button>

                  {/* Import from bank statement */}
                  <button
                    onClick={handleImport}
                    className="w-full flex items-center gap-4 p-4 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-emerald-500/40 rounded-xl transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/25 transition-colors">
                      <Upload size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--text-primary)] text-sm">
                        Import from bank statement
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                        Auto-detect subscriptions from your CSV
                      </div>
                    </div>
                  </button>
                </div>

                {/* Manual link */}
                <div className="text-center">
                  <button
                    onClick={handleManual}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors underline underline-offset-2"
                  >
                    I'll add them manually
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && !skippedToImport && (
              <motion.div
                key="step2"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 p-7 flex flex-col"
              >
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center justify-center mb-4 mt-2">
                    <CheckCircle2 size={28} className="text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                    You're all set!
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                    Use the{' '}
                    <span className="inline-flex items-center gap-1 bg-blue-600 text-white rounded-md px-1.5 py-0.5 text-xs font-semibold">
                      <Plus size={10} /> Add
                    </span>{' '}
                    button to track a subscription, and visit{' '}
                    <span className="font-semibold text-[var(--text-primary)]">Settings</span>{' '}
                    to configure currency and notifications.
                  </p>

                  <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-left mb-6">
                    <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide mb-2">
                      Quick tips
                    </p>
                    {[
                      'Tap the + button (bottom-right) to add a sub',
                      'Filter cards by category with the pill buttons',
                      'Mark a subscription "used" to track activity',
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1 last:mb-0">
                        <span className="text-blue-500 text-xs mt-0.5">•</span>
                        <span className="text-xs text-[var(--text-secondary)]">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleDone}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
