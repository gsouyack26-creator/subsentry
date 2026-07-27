# SubSentry 🛡️

> **Offline-first subscription & bill tracker** — know exactly what you're paying and when, even without internet.

![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![PWA](https://img.shields.io/badge/PWA-Ready-5a0fc8?logo=pwa)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- 📊 **Dashboard** — Monthly/yearly totals, renewal countdown, KPI cards
- 🔔 **Smart Alerts** — Banner warns you when a subscription renews in ≤3 days
- 🏷️ **Category Filters** — Streaming, Software, Finance, Health, Gaming, and more
- 📈 **Spending Chart** — 6-month bar chart by category with monthly/yearly toggle
- 📅 **Renewal Timeline** — Sorted upcoming renewals with countdown chips
- 💾 **Offline-First** — All data stored in IndexedDB via Dexie.js
- 📤 **CSV Export/Import** — Backup and restore your data anytime
- 🌐 **PWA** — Installable, works offline, native-app feel
- 🌍 **Multi-Currency** — USD, EUR, GBP, CAD, AUD, JPY

---

## 📸 Screenshots

| Dashboard (Dark) | Light Theme |
|---|---|
| ![Dashboard Dark](docs/dashboard-dark.png) | ![Light Theme](docs/dashboard-light.png) |

| Add Subscription | Settings |
|---|---|
| ![Add Subscription](docs/add-subscription.png) | ![Settings](docs/settings.png) |

| Mobile Dashboard |
|---|
| ![Mobile Dashboard](docs/mobile-dashboard.png) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | TailwindCSS 4 |
| Database | Dexie.js (IndexedDB) |
| Charts | Recharts |
| Icons | Lucide React |
| PWA | vite-plugin-pwa + Workbox |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun

### Install & Run

```bash
# Clone the repo
git clone https://github.com/yourusername/subsentry.git
cd subsentry

# Install dependencies
bun install
# or: npm install

# Start dev server
bun run dev
# or: npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
bun run build
# or: npm run build
```

Output goes to `dist/`. Includes PWA service worker and manifest.

### Preview Production Build

```bash
bun run preview
```

---

## 📂 Project Structure

```
src/
├── db/
│   └── db.ts              # Dexie database schema
├── types/
│   └── index.ts           # TypeScript interfaces
├── components/
│   ├── Layout.tsx          # App shell with sidebar
│   ├── Dashboard.tsx       # Main dashboard
│   ├── SubscriptionCard.tsx # Card component
│   ├── AddSubModal.tsx     # Add/edit modal form
│   ├── SpendingChart.tsx   # Recharts bar chart
│   ├── RenewalTimeline.tsx # Upcoming renewals
│   ├── AlertBanner.tsx     # Renewal alerts
│   ├── SettingsPage.tsx    # Settings & data management
│   └── EmptyState.tsx      # First-run empty state
├── hooks/
│   ├── useSubscriptions.ts # CRUD with Dexie live queries
│   ├── useAlerts.ts        # Alert computations
│   ├── useSpending.ts      # Spending aggregations
│   └── useSettings.ts      # Persistent settings
├── utils/
│   ├── dates.ts            # Date helpers & formatters
│   ├── csv.ts              # CSV export/import
│   └── categories.ts       # Category definitions + sample data
├── App.tsx
├── main.tsx
└── index.css
```

---

## 📄 License

MIT © 2026
