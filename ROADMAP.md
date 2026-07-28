# SubSentry Roadmap

## v0.1 — Foundation ✅
- [x] Project scaffold (Vite + React + TS + Tailwind)
- [x] Dexie DB schema
- [x] Add/Edit/Delete subscriptions
- [x] Basic subscription list

## v0.2 — Dashboard & Visualization ✅
- [x] KPI cards (monthly/yearly totals)
- [x] Category filters
- [x] Spending bar chart (6 months)
- [x] Renewal timeline

## v0.3 — Alerts & Intelligence ✅
- [x] Renewal countdown chips
- [x] Alert banner (renews in 3 days)
- [x] Unused subscription detection (30+ days)
- [x] Browser push notifications

## v0.4 — Data & Settings ✅
- [x] CSV export
- [x] CSV import
- [x] Currency selector
- [x] Sample data seeder

## v0.5 — PWA & Polish
- [x] Full PWA support (offline, installable)
- [x] Dark/light mode toggle
- [x] Smooth animations (Framer Motion)
- [x] Mobile responsive layout

## v1.0 — Launch ✅
- [x] README with feature overview and usage guide
- [x] GitHub Pages deploy (CI/CD via GitHub Actions)
- [x] Onboarding flow (first-run wizard)

## v1.1 — Import & Detection ✅
- [x] Bank/card CSV import with recurring-charge detection
- [x] Auto-detect subscription cadence (weekly/monthly/quarterly/yearly)
- [x] Confidence scoring with category guessing
- [x] Review UI with per-row category editing and duplicate skipping
- [x] Monthly budget tracker with visual gauge (replaces unused KPI when set)
- [x] Search subscriptions by name/category/notes
- [x] Sort by renewal date, price (high/low), or name
- [x] Empty state: import from statement shortcut

## v2 — Email Linking (planned)
> See [docs/EMAIL_LINKING_V2.md](docs/EMAIL_LINKING_V2.md) for full design doc.
- [ ] OAuth backend (Cloudflare Workers) for Gmail/Outlook token exchange
- [ ] Gmail `gmail.readonly` scope + Google CASA Tier 2 security assessment
- [ ] Microsoft Graph `Mail.Read` for Outlook
- [ ] Receipt parsing engine (heuristics + optional LLM fallback)
- [ ] Forward-to-parse alternative (no OAuth required)
- [ ] Encrypted refresh token storage (AES-256-GCM)
