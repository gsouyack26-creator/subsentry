# SubSentry v2 — Email Linking Design Document

> **Status:** Planned (not yet built)
> **Author:** SubSentry team
> **Last updated:** 2026-07-26

---

## Overview

Email linking would let SubSentry scan a user's inbox for subscription confirmation emails and billing receipts, then automatically surface recurring charges without requiring a manual bank-CSV export. This document explains the architecture, trade-offs, and compliance hurdles involved.

---

## Why It Needs a Backend

SubSentry is currently fully offline (IndexedDB / Dexie, zero network calls). Email access is impossible without a backend because:

1. **OAuth client secrets must stay server-side.** Gmail's OAuth2 flow issues a `client_secret` that cannot safely live in a browser bundle (it would be trivially extracted). A backend performs the token exchange and stores the resulting refresh token.
2. **Token refresh.** Refresh tokens need to be exchanged for short-lived access tokens; this must happen server-side on a schedule.
3. **Inbox polling.** The backend polls the mail API periodically (or webhook-triggers), parses receipts, and syncs structured results back to the client. The client never directly holds mail credentials.

---

## Provider Specifics

### Google Gmail (`gmail.readonly`)

| Property | Detail |
|---|---|
| OAuth scope | `https://www.googleapis.com/auth/gmail.readonly` |
| Scope classification | **RESTRICTED** (Google's highest tier) |
| Production requirement | Passes Google's [CASA Tier 2 security assessment](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification) |
| CASA cost | $15,000–$75,000 USD depending on lab + remediation rounds |
| CASA timeline | 3–6 months |
| Unverified cap | **100 users** (test accounts only; shows "unverified app" warning) |
| Verified requirement | Privacy Policy + Terms of Service URLs, domain verification, CASA report |

The `gmail.readonly` scope gives access to full email content, which triggers Google's strictest review. The 100-user unverified cap means a public launch is blocked until CASA passes.

### Microsoft Outlook / Graph Mail (`Mail.Read`)

| Property | Detail |
|---|---|
| OAuth scope | `Mail.Read` (delegated) |
| Classification | **Sensitive** (requires admin consent for org accounts, user consent for personal) |
| Production requirement | Azure App Registration; Microsoft 365 personal accounts are generally self-serviceable with user consent |
| Restrictions | Easier than Gmail for personal accounts; corporate/tenant accounts often require admin approval |
| Cost | No formal CASA equivalent; standard Azure AD review |

---

## Forward-to-Parse Alternative (Recommended for v2.0)

To avoid restricted scopes entirely, SubSentry can provide a **dedicated forwarding email address** (e.g. `receipts+<user-id>@subsentry.app`). The user manually forwards billing emails to this address. The backend:

1. Receives inbound email via a service like [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/) → R2 → Worker, or [Postmark inbound](https://postmarkapp.com/inbound-email).
2. Parses the email body for known merchant patterns, amounts, and billing dates.
3. Pushes structured results to the client via a lightweight sync endpoint.

**Advantages of forward-to-parse:**
- No OAuth / CASA required.
- Works with any email provider (Gmail, Outlook, iCloud, ProtonMail).
- Privacy surface is limited to emails the user explicitly forwards.

**Disadvantages:**
- Requires user action per email (not automatic).
- Users must trust SubSentry with email content.

---

## Proposed Architecture (OAuth Path)

```
User Browser (React)
    │
    │  1. Initiate OAuth (redirect)
    ▼
Backend — Cloudflare Workers (or VPS/Fly.io)
    │
    │  2. Receive OAuth code
    │  3. Exchange for tokens (client_secret stays here)
    │  4. Store encrypted refresh token (AES-256-GCM, key in KV secrets)
    │
    │  5. Poll Gmail/Outlook API (cron: every 6h)
    │  6. Parse receipts → structured {merchant, amount, date}
    │
    │  7. Sync endpoint: GET /api/receipts?since=<timestamp>
    ▼
Client (React) pulls structured receipts
    │
    │  8. detectRecurring() on receipt data
    │  9. Show ImportStatementModal review UI (reuse existing)
    ▼
Dexie (IndexedDB) — subscriptions saved locally
```

### Receipt Parsing

Heuristics-first approach (no LLM required):
- HTML email → extract price patterns: `\$\d+\.\d{2}`, `charged.*?\$\d+`, etc.
- Known merchant templates (Netflix, Spotify, Adobe, etc.) — prebuilt parsers.
- Fallback: OpenAI / Anthropic API call for unrecognized formats (optional, opt-in).

### Data Storage on Backend

| Data | Storage | Notes |
|---|---|---|
| OAuth refresh token | Cloudflare KV (encrypted) | AES-256-GCM, key per-user |
| Raw email bodies | **Not stored** | Parse then discard immediately |
| Structured receipts | R2 / D1 (short-lived) | Purged after client sync confirms receipt |

---

## Privacy & Compliance Requirements

Before any public launch of email linking:

1. **Privacy Policy** (required by Google and Apple): must explicitly state what email data is accessed, how long it is retained (answer: not retained beyond parsing), and who it is shared with (answer: nobody).
2. **Terms of Service**: required by Google CASA review.
3. **GDPR / CCPA**: users must be able to revoke email access and request deletion of any stored data.
4. **Scope minimization**: request only `gmail.readonly`; do not request `gmail.modify` or broader scopes.
5. **Token storage**: refresh tokens must be encrypted at rest and in transit (TLS 1.2+).
6. **No selling data**: prohibited by Google's restricted scope policy and applicable privacy laws.

---

## Phased Rollout

### Phase 1 — Personal test mode (no CASA needed)
- Deploy backend (Cloudflare Workers + KV).
- Enable OAuth for up to 100 test accounts (Google unverified-app cap).
- Build forward-to-parse path in parallel (no cap).
- Validate receipt parsing accuracy, UX flow.

### Phase 2 — Verified launch (Gmail full)
- Engage CASA-approved lab (e.g. NCC Group, Leviathan Security).
- Complete security assessment ($15k–$75k, 3–6 months).
- Submit to Google for verification.
- Launch to general audience with Gmail support.

### Phase 3 — Outlook / iCloud / other
- Add Microsoft Graph Mail.Read (lower barrier for personal accounts).
- Explore Apple iCloud Mail / IMAP with app-specific passwords.
- Consider ProtonMail Bridge API (local only — no backend token needed).

---

## Open Questions

- **Monetization:** Backend infra costs money. Email linking likely requires a paid tier or usage-based credits to be sustainable.
- **LLM parsing cost:** If using an LLM for unrecognized receipts, API costs must be passed to users or absorbed.
- **Forward-to-parse UX:** How discoverable is a forwarding address vs. native OAuth? Testing needed.
- **Mobile:** React Native / PWA notification on new receipts detected?

---

## References

- [Google OAuth scopes & CASA](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification)
- [Microsoft Graph Mail.Read permissions](https://learn.microsoft.com/en-us/graph/permissions-reference#mail-permissions)
- [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/)
- [GDPR Art. 5 — Data minimization](https://gdpr-info.eu/art-5-gdpr/)
