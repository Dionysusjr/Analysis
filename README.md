# Analysis — live market dashboards

Two dashboards in one Next.js app:

| Route | Dashboard |
| --- | --- |
| `/` | **JA Dividend Watch** — Jamaican (JSE) dividend stocks + news/sentiment feed |
| `/congress` | **Capitol Ledger** — US political trading disclosures ([docs](docs/capitol-ledger.md)) |

## Publish to the internet (get a shareable link)

The fastest way to a public URL is Vercel — free tier, no config files needed:

1. Go to **[vercel.com/new](https://vercel.com/new)**, sign in with GitHub, and
   import **`Dionysusjr/Analysis`** (grant access if prompted). Vercel detects
   Next.js automatically — accept the defaults.
2. Under *Environment Variables*, add **`CONTACT_EMAIL`** = your email (the
   SEC's fair-access policy requires requests identify their sender; the
   House/Senate sites behave better with one too).
3. Click **Deploy**. In ~2 minutes you get a public link like
   `https://analysis-xxxx.vercel.app` — that's the URL to share.
   `/congress` is the Capitol Ledger dashboard; both pages self-refresh
   every 30 seconds in the browser.

Every push to the production branch auto-redeploys; other branches get their
own preview URLs.

**No placeholder data when deployed:** in production the Capitol Ledger
defaults to strict `live` mode — the simulator never runs, prices come from
real market data (stooq), and if an upstream source is down the page shows an
honest "awaiting live data" state with per-source status instead of
placeholder filers. See [docs/capitol-ledger.md](docs/capitol-ledger.md) for
what each free source can and cannot provide (short version: Senate eFD
yields ticker-level trades; the House index is filing-level only unless you
add an aggregator API key). The JSE dashboard keeps its own
`STOCK_DATA_SOURCE` setting — set it to `scrape` or `mdf` for live JSE data.

Also deploys anywhere else Next.js runs (Node host, Docker, Render, Fly.io):
`npm run build && npm start`.

---

# JA Dividend Watch

A live-updating dashboard for Jamaican (JSE) dividend-paying stocks: price,
open/high/low, volume, dividend yield, and change, alongside a news feed
filtered to headlines relevant to those companies and their sectors, tagged
with a lightweight sentiment read.

Built with Next.js 14 (App Router) + TypeScript + Tailwind CSS.

## What's included

- **Live-updating stock table** — symbol, company, sector, price, change %,
  dividend yield, volume, open/high/low, and trade date for a curated
  watchlist of ~20 JSE dividend payers (`lib/stocks-config.ts`). Sortable
  columns, sector filter, and search. Rows flash green/red on price moves.
- **Stock detail panel** — click any row for a full breakdown plus an
  intraday sparkline built from prices seen during the current browser
  session, and headlines related to that specific stock.
- **Live news & sentiment feed** — aggregates public RSS feeds from Jamaican
  outlets, keeps only articles that mention a tracked company or its sector
  (e.g. a Bank of Jamaica rate story surfaces for every Banking & Finance
  holding even without naming a specific bank), and scores each headline
  with a small finance-word lexicon (`lib/sentiment.ts`) to flag it
  positive/neutral/negative. This is a heuristic for spotting sentiment
  shifts quickly, not investment advice.
- **Auto-refresh** — the browser polls `/api/stocks` (default 30s) and
  `/api/news` (default 5min) via SWR; both intervals are configurable.
- **Market-hours awareness** — a "JSE Market Open/Closed" indicator based on
  the exchange's normal Mon–Fri 9:30am–3:30pm (America/Jamaica) session.

## Stock price data source

There is no free, documented public API for JSE market data. The app ships
with a pluggable provider (`lib/providers/`) and three modes, set via
`STOCK_DATA_SOURCE` in `.env`:

| Mode | What it does | Setup |
| --- | --- | --- |
| `mock` (default) | Realistic simulator seeded from researched reference prices/yields; moves in real time during JSE market hours. Clearly labeled "SIMULATED" in the UI. | none |
| `scrape` | Best-effort HTML scrape of jamstockex.com's public market data page. No credentials needed, but the site sits behind bot protection and can change markup without notice — treat as unreliable, not a guarantee. | set `STOCK_DATA_SOURCE=scrape` |
| `mdf` | JSE's official real-time **Market Data Feed** API — the only source with true exchange-grade real-time data. Requires requesting access from JSE. | request access at jamstockex.com/services/api-services/, then set `STOCK_DATA_SOURCE=mdf`, `JSE_MDF_BASE_URL`, `JSE_MDF_API_KEY` |

If `scrape` or `mdf` fails for any reason (network, markup change, bad
credentials), the API route automatically falls back to `mock` and surfaces
a warning banner in the UI rather than showing stale or broken data.

`lib/stocks-config.ts` is a plain array — add, remove, or re-sector any
company, and update `referencePrice` / `referenceDividendYieldPct` as
current data warrants (these seed the simulator only; they are not fetched
live).

## News sources

`lib/news/feeds.ts` lists the RSS feeds polled (Jamaica Observer, Jamaica
Gleaner, Loop Jamaica, Nationwide News Network). Each is fetched
independently (`Promise.allSettled`), so one dead feed doesn't take down the
panel — it's just skipped with a warning. Feed URLs occasionally move;
check the publisher's RSS listing page if one starts failing consistently.

Relevance + sector keyword matching lives in `lib/news/relevance.ts`.

## Running locally

```bash
npm install
cp .env.example .env   # defaults to STOCK_DATA_SOURCE=mock, works out of the box
npm run dev
```

Open http://localhost:3000.

```bash
npm run build && npm start   # production build
npm run typecheck            # type-only check
```

## Deploying

Deploys anywhere Next.js runs (Vercel, Node host, Docker). No database is
required — the mock provider's open/high/low state lives in server memory
for the process lifetime, which is enough for a live demo; wire up `scrape`
or `mdf` for real numbers, and add persistent storage if you want history to
survive restarts/multiple server instances.

## Disclaimer

Reference prices, dividend yields, and simulated data in this project are
approximate and for demonstration purposes. Sentiment tags are generated by
a simple keyword heuristic. Nothing in this dashboard is investment advice —
verify figures against jamstockex.com or a licensed data provider before
making financial decisions.
