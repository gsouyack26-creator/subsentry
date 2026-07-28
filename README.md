<div align="center">

# SubSentry

**Offline-first subscription tracker — know exactly what you're paying, before it hits.**

[![Deploy to GitHub Pages](https://github.com/gsouyack26-creator/subsentry/actions/workflows/deploy.yml/badge.svg)](https://github.com/gsouyack26-creator/subsentry/actions/workflows/deploy.yml)
[![Built with React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-offline--first-5A0FC8)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-gray)](LICENSE)

[**Live App →**](https://gsouyack26-creator.github.io/subsentry/)

</div>

---

## What is SubSentry?

SubSentry is a **fully offline** subscription tracker that runs entirely in your browser. No account, no server, no data uploaded — ever. Your data lives in IndexedDB (via Dexie) and goes nowhere.

**Key capabilities:**

- 📊 Dashboard with monthly/yearly cost KPIs, 6-month spending chart, and renewal timeline
- 🔍 **Auto-detect recurring charges** from any bank or credit-card CSV export
- 🔔 Browser push notifications for upcoming renewals (3-day warning)
- 💰 Monthly budget tracker with a visual gauge
- 🗂️ Category filters (Streaming, Software, Health, Gaming, Finance, Shopping)
- 🔎 Search + sort (by renewal date, price, or name)
- 🌙 Dark + light mode
- 📱 Fully responsive — works on mobile, tablet, desktop
- 📥 CSV import/export (SubSentry backup format)
- ⚡ PWA — install it, use it fully offline

---

## Bank Statement Import

SubSentry can scan your bank or credit-card CSV and **automatically detect which charges look like subscriptions** — no manual entry needed.

1. Go to **Settings → Data → Import from bank statement**
2. Drop in your CSV export (Chase, BoA, Capital One, Citi, Wells Fargo, etc.)
3. Review detected recurring charges — edit categories, toggle rows on/off
4. Hit **Add N subscriptions** — done

The detection engine:
- Auto-detects date / merchant / amount columns from any CSV header format
- Groups by normalized merchant name (strips store numbers, noise words, dates)
- Scores confidence 0–1 based on occurrence count, amount consistency, and gap regularity
- Classifies cadence: weekly (7d), monthly (30d), quarterly (90d), yearly (365d)
- Guesses category from merchant name keywords

**Your statement never leaves your browser.**

---

## Getting Started

### Use the live app

→ [gsouyack26-creator.github.io/subsentry](https://gsouyack26-creator.github.io/subsentry/)

Or install it as a PWA: in Chrome/Edge, click the install icon in the address bar.

### Run locally

```bash
git clone https://github.com/gsouyack26-creator/subsentry.git
cd subsentry
bun install      # or npm install
bun run dev      # http://localhost:5173
```

### Build

```bash
bun run build    # outputs to dist/
bun run preview  # preview the production build
```

---

## Feature Overview

| Feature | Details |
|---|---|
| Subscription management | Add, edit, delete; notes, category, color accent |
| Billing cycles | Weekly, monthly, quarterly, yearly |
| KPI cards | Monthly total, yearly total, renewing this week, unused (30+ days) |
| Monthly budget | Set a target; gauge card shows % spent with green/amber/red status |
| Spending chart | 6-month bar chart (Recharts) |
| Renewal timeline | Upcoming renewals in the next 30 days |
| Alerts | Banner for subscriptions renewing within 3 days; unused detection |
| Push notifications | Browser notifications for renewals (opt-in, permission-gated) |
| Bank CSV import | Auto-detects recurring charges with confidence scoring |
| SubSentry CSV | Export/import your data as a backup |
| Search & sort | Real-time name search; sort by renewal, price, name |
| Category filter | Filter cards by streaming / software / health / gaming / finance / shopping |
| Dark / light mode | Persisted via localStorage |
| Offline / PWA | Service worker pre-caches all assets; installable |
| Multi-currency | USD, EUR, GBP, CAD, AUD, JPY |

---

## Tech Stack

| Layer | Library |
|---|---|
| UI framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (CSS-var theme system) |
| Local DB | Dexie 4 (IndexedDB wrapper) |
| Charts | Recharts 3 |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| PWA | vite-plugin-pwa |

---

## Project Structure

```
src/
  components/       UI components (Dashboard, SubscriptionCard, modals, …)
  hooks/            useLiveQuery wrappers (useSubscriptions, useSettings, useSpending, useAlerts)
  utils/            dates, csv, categories, statementImport, notifications
  db/               Dexie schema
  types/            Shared TypeScript types
docs/
  EMAIL_LINKING_V2.md   Design doc for the planned v2 email-linking feature
```

---

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the full plan. High-level:

- ✅ v0.1–0.5 — Core tracker, dashboard, alerts, PWA, dark mode, animations
- ✅ v1.0 — Onboarding, CSV import/export
- ✅ v1.1 — Bank statement import with recurring-charge detection, budget tracker, search/sort
- 📋 v2 — Email linking (Gmail/Outlook OAuth) — see [docs/EMAIL_LINKING_V2.md](docs/EMAIL_LINKING_V2.md)

---

## Privacy

SubSentry is **zero-backend**. Everything runs in your browser:

- All subscription data is stored in **IndexedDB** on your device
- Bank statement CSVs are **parsed in-browser** and never uploaded
- No analytics, no tracking, no accounts
- `bun run build` produces a fully static site — you can self-host it anywhere

---

## Contributing

Issues and PRs welcome. Run `bun run build` (must pass with zero TS errors) before submitting.

---

## License

MIT © SubSentry contributors
