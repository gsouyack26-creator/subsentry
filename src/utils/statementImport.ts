import { BillingCycle } from '../types';
import { nextRenewalDate } from './dates';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StatementTransaction {
  date: string;      // ISO date string
  merchant: string;
  amount: number;    // always positive
}

export interface SuggestedSub {
  merchant: string;
  normalizedKey: string;
  amount: number;
  billingCycle: BillingCycle;
  category: string;
  confidence: number;  // 0–1
  occurrences: number;
  lastDate: string;   // ISO date of most recent charge
  nextDate: string;   // estimated next renewal
}

// ---------------------------------------------------------------------------
// CSV Parsing
// ---------------------------------------------------------------------------

/** Parse a CSV text line respecting quoted fields. */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote inside quoted field
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/** Auto-detect which column index matches a set of possible header keywords. */
function findColumn(headers: string[], keywords: string[]): number {
  const normalized = headers.map(h => h.toLowerCase().replace(/[^a-z]/g, ''));
  for (const kw of keywords) {
    const idx = normalized.findIndex(h => h.includes(kw.replace(/[^a-z]/g, '')));
    if (idx !== -1) return idx;
  }
  return -1;
}

/** Parse an amount string: handle negatives, parentheses, dollar signs, commas. */
function parseAmount(raw: string): number {
  if (!raw) return NaN;
  // Remove currency symbols and spaces
  let s = raw.replace(/[$£€,\s]/g, '');
  // Parentheses = negative (e.g. accounting format)
  if (s.startsWith('(') && s.endsWith(')')) {
    s = '-' + s.slice(1, -1);
  }
  return parseFloat(s);
}

/** Try to parse a date string in various formats, returning ISO (YYYY-MM-DD) or ''. */
function parseDate(raw: string): string {
  if (!raw) return '';
  const s = raw.trim();

  // Already ISO-like: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);

  // MM/DD/YYYY or MM-DD-YYYY
  const mdy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (mdy) {
    const [, m, d, y] = mdy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // MM/DD/YY
  const mdyShort = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/);
  if (mdyShort) {
    const [, m, d, y] = mdyShort;
    const fullYear = parseInt(y) > 50 ? `19${y}` : `20${y}`;
    return `${fullYear}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // YYYY/MM/DD
  const ymd = s.match(/^(\d{4})[\/\-](\d{2})[\/\-](\d{2})/);
  if (ymd) {
    const [, y, m, d] = ymd;
    return `${y}-${m}-${d}`;
  }

  // Fallback: try native Date parsing
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];

  return '';
}

/**
 * Parse a bank/credit-card statement CSV.
 * Auto-detects date, description/merchant, and amount columns by header keywords.
 * Returns normalized transactions with positive amounts.
 */
export function parseStatementCSV(text: string): StatementTransaction[] {
  // Normalize line endings
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const nonEmpty = lines.filter(l => l.trim());

  if (nonEmpty.length < 2) return [];

  const rawHeaders = parseCSVLine(nonEmpty[0]);

  // Auto-detect columns
  const dateIdx = findColumn(rawHeaders, ['transactiondate', 'posteddate', 'date', 'posted', 'trans']);
  const descIdx = findColumn(rawHeaders, ['description', 'merchant', 'payee', 'name', 'memo', 'narrative', 'details', 'particulars']);
  const amountIdx = findColumn(rawHeaders, ['amount', 'debit', 'charge', 'withdrawal', 'price', 'total']);
  // Separate credit column (some banks split debit/credit)
  const creditIdx = findColumn(rawHeaders, ['credit', 'deposit', 'payment']);

  if (dateIdx === -1 || descIdx === -1) return [];

  const transactions: StatementTransaction[] = [];

  for (let i = 1; i < nonEmpty.length; i++) {
    const line = nonEmpty[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    const dateStr = parseDate(cols[dateIdx] || '');
    if (!dateStr) continue;

    const merchant = (cols[descIdx] || '').replace(/^"|"$/g, '').trim();
    if (!merchant) continue;

    let amount = NaN;
    if (amountIdx !== -1) {
      const raw = cols[amountIdx] || '';
      amount = parseAmount(raw);
    }

    // Some formats put credits in a separate column; ignore credits (they're refunds/payments)
    if (isNaN(amount) || amount === 0) continue;

    // For debit-only columns that might have negative amounts (money leaving)
    // We always store as positive
    amount = Math.abs(amount);

    // If there's a separate credit column and this row has a credit value, it's a refund — skip
    if (creditIdx !== -1 && creditIdx !== amountIdx) {
      const creditRaw = cols[creditIdx] || '';
      const creditAmt = parseAmount(creditRaw);
      if (!isNaN(creditAmt) && creditAmt > 0) continue;
    }

    transactions.push({ date: dateStr, merchant, amount });
  }

  return transactions;
}

// ---------------------------------------------------------------------------
// Merchant normalization
// ---------------------------------------------------------------------------

/** Normalize a merchant string into a stable grouping key. */
function normalizeMerchant(raw: string): string {
  let s = raw.toUpperCase();

  // Remove common noise suffixes / prefixes
  s = s.replace(/\b(RECURRING|AUTOPAY|AUTO\s*PAY|PAYMENT|SUBSCRIPTION|SUB|ANNUAL|MONTHLY|WEEKLY|INTERNET|ONLINE|PURCHASE|TRANSACTION|CHARGE|FEE)\b/g, '');

  // Remove trailing store numbers, dates, or long digit runs
  s = s.replace(/\s+#?\d{3,}\b/g, '');     // store numbers
  s = s.replace(/\b\d{4,}\b/g, '');          // 4+ digit runs
  s = s.replace(/\d{2}\/\d{2}(\/\d{2,4})?/, ''); // embedded dates

  // Remove asterisks and special chars (but keep letters/spaces)
  s = s.replace(/[*|]/g, ' ');
  s = s.replace(/[^A-Z0-9\s\-&]/g, '');

  // Collapse whitespace
  s = s.replace(/\s+/g, ' ').trim();

  // Strip trailing digits that look like location codes
  s = s.replace(/\s+\d+$/, '');

  return s;
}

// ---------------------------------------------------------------------------
// Category detection
// ---------------------------------------------------------------------------

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  streaming: [
    'netflix', 'hulu', 'disney', 'spotify', 'apple tv', 'appletv', 'hbo', 'max',
    'youtube', 'peacock', 'paramount', 'showtime', 'discovery', 'crunchyroll',
    'dazn', 'tidal', 'amazon music', 'pandora', 'soundcloud', 'twitch',
  ],
  software: [
    'adobe', 'microsoft', 'google', 'notion', 'figma', 'github', 'dropbox',
    'zoom', 'slack', 'atlassian', 'jira', 'confluence', 'canva', 'squarespace',
    'wix', 'shopify', 'mailchimp', 'hubspot', 'salesforce', 'quickbooks',
    'intuit', 'cloudflare', 'aws', 'azure', 'digitalocean', 'heroku', 'vercel',
    'cursor', 'openai', 'anthropic', 'jasper', 'grammarly', 'lastpass', '1password',
  ],
  health: [
    'gym', 'fitness', 'peloton', 'noom', 'calm', 'headspace', 'whoop',
    'fitbit', 'weight watchers', 'weightwatchers', 'myfitnesspal', 'cvs',
    'walgreens', 'hinge health', 'teladoc', 'betterhelp', 'talkspace',
  ],
  gaming: [
    'playstation', 'xbox', 'nintendo', 'steam', 'ea play', 'ea games',
    'ubisoft', 'blizzard', 'battlenet', 'battle.net', 'twitch prime',
    'humble bundle', 'game pass',
  ],
  finance: [
    'experian', 'equifax', 'transunion', 'credit karma', 'mint', 'ynab',
    'personal capital', 'robinhood', 'acorns', 'sofi', 'chime', 'paypal',
    'venmo', 'cashapp', 'crypto', 'coinbase',
  ],
  shopping: [
    'amazon prime', 'amazon', 'costco', 'walmart', 'target', 'prime',
    'instacart', 'doordash', 'grubhub', 'uber eats', 'ubereats', 'postmates',
    'shipt', 'boxed',
  ],
};

function guessCategory(merchant: string): string {
  const m = merchant.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => m.includes(kw))) return category;
  }
  return 'other';
}

// ---------------------------------------------------------------------------
// Statistical helpers
// ---------------------------------------------------------------------------

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((sum, v) => sum + (v - m) ** 2, 0) / values.length);
}

function classifyCadence(medianGapDays: number): BillingCycle | null {
  if (medianGapDays >= 6 && medianGapDays <= 8) return 'weekly';
  if (medianGapDays >= 26 && medianGapDays <= 35) return 'monthly';
  if (medianGapDays >= 85 && medianGapDays <= 95) return 'quarterly';
  if (medianGapDays >= 350 && medianGapDays <= 380) return 'yearly';
  return null;
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/(?:^|\s|-)\S/g, c => c.toUpperCase())
    .trim();
}

// ---------------------------------------------------------------------------
// Recurring detection
// ---------------------------------------------------------------------------

/**
 * Analyse a list of transactions and identify recurring subscription candidates.
 * Returns SuggestedSub[] sorted by confidence descending.
 */
export function detectRecurring(transactions: StatementTransaction[]): SuggestedSub[] {
  if (transactions.length === 0) return [];

  // Group by normalized merchant key
  const groups = new Map<string, StatementTransaction[]>();
  for (const tx of transactions) {
    const key = normalizeMerchant(tx.merchant);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(tx);
  }

  const suggestions: SuggestedSub[] = [];

  for (const [key, txs] of groups.entries()) {
    if (txs.length < 2) continue;

    // Sort by date ascending
    const sorted = [...txs].sort((a, b) => a.date.localeCompare(b.date));

    // Compute gaps in days between consecutive charges
    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const ms = new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime();
      gaps.push(ms / (1000 * 60 * 60 * 24));
    }

    const medGap = median(gaps);
    const gapStd = stddev(gaps);
    const amounts = txs.map(t => t.amount);
    const medAmount = median(amounts);
    const amtStd = stddev(amounts);

    // Cadence classification
    const cadence = classifyCadence(medGap);

    // --- Confidence calculation ---
    // 1. Occurrence score: more charges = more confident (caps at ~0.3 contribution)
    const occScore = Math.min(sorted.length / 10, 1) * 0.25;

    // 2. Amount consistency: low relative std dev = high confidence
    const amtRelStd = medAmount > 0 ? amtStd / medAmount : 1;
    const amtScore = Math.max(0, 1 - amtRelStd * 4) * 0.30;

    // 3. Gap regularity: low relative std dev = high confidence
    const gapRelStd = medGap > 0 ? gapStd / medGap : 1;
    const gapScore = Math.max(0, 1 - gapRelStd * 2) * 0.25;

    // 4. Known cadence bonus
    const cadenceScore = cadence !== null ? 0.20 : 0;

    const confidence = Math.min(1, occScore + amtScore + gapScore + cadenceScore);

    // Default to monthly if cadence is ambiguous but gap is plausible
    const billingCycle: BillingCycle = cadence || 'monthly';

    const lastDate = sorted[sorted.length - 1].date;
    const nextDate = nextRenewalDate(lastDate, billingCycle);
    const category = guessCategory(key);

    // Use the display name from the first transaction (titlecased original)
    const displayName = titleCase(txs.sort((a, b) => b.date.localeCompare(a.date))[0].merchant);

    suggestions.push({
      merchant: displayName,
      normalizedKey: key,
      amount: Math.round(medAmount * 100) / 100,
      billingCycle,
      category,
      confidence,
      occurrences: sorted.length,
      lastDate,
      nextDate,
    });
  }

  // Sort by confidence descending
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}
