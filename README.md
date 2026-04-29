# Ledger — SEC EDGAR Financial Extractor (Vybe)

## High-level Strategy and Goal

Ledger is an internal tool that pulls every 10-K, 10-Q, 8-K and DEF 14A filing for
a US-listed company between a year range, then extracts a snapshot of profitability,
balance sheet, and cash-flow metrics from the SEC's XBRL company-facts API. It is a
Vybe-native rework of the public `filings-insightful-bot` app (originally a
Lovable/Vite + Supabase Edge Function project).

Primary goals:

1. Given a ticker + year range, return a structured snapshot (margins, ROA/ROE,
   TTM revenue, FCF, leverage ratios, etc.) plus a multi-period table covering
   income statement, cash flow, balance sheet and margins.
2. Surface direct links to the source SEC filings.
3. Allow analysts to export the historical period table as a CSV.

## Changes Implemented

- Replaced the public Supabase Edge Function with a server-side Next.js route
  `POST /api/sec-financials` that fetches `data.sec.gov` directly. No anon key
  is shipped to the browser (eliminates the original BUG-04 secret exposure).
- Ported the XBRL bucketing engine to TypeScript / Node:
  - Per-period classification (annual / quarterly / instant) by duration.
  - Q4 derivation `Q4 = Annual − (Q1 + Q2 + Q3)`, **skipped for per-share
    flows** (EPS, dividends-per-share) — fixes the original audit's primary
    correctness bug.
  - Sort tie-breaker so FY rows precede co-dated Q4 rows.
  - `forwardAnnualDividendRate = 4 × most-recent quarterly DPS` (no longer
    mislabeled as the trailing sum).
  - SEC User-Agent ships a sensible default identifying the app + contact
    email so it works out of the box; operators may override via the
    `SEC_USER_AGENT` env var. Response Content-Type is verified to defend
    against SEC throttling HTML pages.
- New UI under `/` with `TickerForm`, `SnapshotCard`, `HistoryTable`,
  `FilingsPanel` (shadcn-based, Vybe minimalist aesthetic, no third fonts).
- Form validates that `startYear ≤ endYear` before any network call.
- CSV export uses RFC-4180 escaping, no trailing newline in the filename, and
  defers `URL.revokeObjectURL` by 1 s to survive throttled hardware.
- Payout-ratio row renders neutral (no green/red trend coloring on a
  non-signed value).
- Unit tests for the bucketing engine (`classify`, `bucketFlow` Q4 derivation,
  CSV escaping).

## Architecture and Technical Decisions

- **Server-side SEC fetch (`/api/sec-financials`).** SEC's fair-use policy
  requires a contact email in the User-Agent and fetching from a browser would
  fail CORS anyway. Centralizing the fetch on the server also lets us cache /
  rate-limit later if needed.
- **Pure functional core.** The bucketing/classification logic lives in
  `src/server-lib/sec/sec-financials.ts` as pure functions so they can be unit
  tested without the network. The route handler is a thin orchestrator.
- **Shared types & formatters in `src/shared/sec-types.ts`.** Used by both the
  client UI and the server route, keeping the wire shape in one place.
- **SWR-style mutation** via `axios` + `swr`'s `mutate` is unnecessary for a
  one-shot extraction; we use a small `extractSecFinancials()` helper plus
  local React state. This matches the project's mutation pattern without
  forcing cache invalidation that would never be re-read.
- **Auth & secrets.** Vybe enforces org-only access at the platform layer, so
  the original "anon JWT in bundle" class of bugs is structurally absent. No
  required secrets — the SEC User-Agent has a built-in default; operators
  may override via `SEC_USER_AGENT` if they want their own contact on
  record with SEC EDGAR.
