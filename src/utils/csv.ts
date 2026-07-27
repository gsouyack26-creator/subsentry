import { Subscription } from '../types';

const CSV_HEADERS = [
  'name', 'amount', 'currency', 'billingCycle', 'nextDate', 
  'category', 'color', 'notes', 'createdAt', 'lastUsedAt'
];

export const exportToCSV = (subscriptions: Subscription[]): void => {
  const rows = [
    CSV_HEADERS.join(','),
    ...subscriptions.map(sub => [
      `"${sub.name}"`,
      sub.amount,
      sub.currency,
      sub.billingCycle,
      sub.nextDate,
      sub.category,
      sub.color,
      `"${sub.notes || ''}"`,
      sub.createdAt,
      sub.lastUsedAt || '',
    ].join(','))
  ];
  
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `subsentry-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importFromCSV = (file: File): Promise<Omit<Subscription, 'id'>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) throw new Error('CSV file is empty or invalid');
        
        const headers = lines[0].split(',');
        const subs: Omit<Subscription, 'id'>[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          const sub: Omit<Subscription, 'id'> = {
            name: values[headers.indexOf('name')]?.replace(/"/g, '') || '',
            amount: parseFloat(values[headers.indexOf('amount')] || '0'),
            currency: values[headers.indexOf('currency')] || 'USD',
            billingCycle: (values[headers.indexOf('billingCycle')] as Subscription['billingCycle']) || 'monthly',
            nextDate: values[headers.indexOf('nextDate')] || new Date().toISOString().split('T')[0],
            category: values[headers.indexOf('category')] || 'other',
            color: values[headers.indexOf('color')] || '#6b7280',
            notes: values[headers.indexOf('notes')]?.replace(/"/g, '') || '',
            createdAt: values[headers.indexOf('createdAt')] || new Date().toISOString(),
            lastUsedAt: values[headers.indexOf('lastUsedAt')] || undefined,
          };
          if (sub.name) subs.push(sub);
        }
        
        resolve(subs);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes;
    } else if (line[i] === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += line[i];
    }
  }
  result.push(current);
  return result;
};
