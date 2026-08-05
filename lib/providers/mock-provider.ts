import { TRACKED_STOCKS } from "../stocks-config";
import { StockQuote } from "../types";
import { isJseMarketOpen, jseTradeDateString } from "../market-hours";

interface SimState {
  price: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  tradeDate: string;
}

// Module-level state persists for the lifetime of the server process, which
// gives the simulator a continuous, self-consistent "live" feed across
// requests (open/high/low accumulate through the trading day) without a
// database. It resets on cold start / redeploy - acceptable for a demo data
// source; swap to STOCK_DATA_SOURCE=scrape or mdf for real persistence.
const state = new Map<string, SimState>();

function seedIfNeeded(symbol: string, referencePrice: number) {
  const today = jseTradeDateString();
  const existing = state.get(symbol);
  if (existing && existing.tradeDate === today) return;

  // New trading day (or first run): open near the last close with a small gap.
  const previousClose = existing?.price ?? referencePrice;
  const gapPct = (Math.random() - 0.5) * 0.01; // +/-0.5% opening gap
  const open = round(previousClose * (1 + gapPct));
  state.set(symbol, {
    price: open,
    open,
    high: open,
    low: open,
    previousClose,
    volume: 0,
    tradeDate: today,
  });
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

function tick(symbol: string) {
  const s = state.get(symbol);
  if (!s) return;
  if (!isJseMarketOpen()) return; // price only moves during trading hours

  // Small mean-reverting random walk, roughly +/-0.35% per tick.
  const driftToOpen = (s.open - s.price) * 0.02;
  const noise = (Math.random() - 0.5) * s.price * 0.007;
  const next = round(Math.max(0.01, s.price + driftToOpen + noise));

  s.price = next;
  s.high = round(Math.max(s.high, next));
  s.low = round(Math.min(s.low, next));
  s.volume += Math.floor(Math.random() * 4000) + 100;
}

export function getMockQuotes(): StockQuote[] {
  return TRACKED_STOCKS.map((stock) => {
    seedIfNeeded(stock.symbol, stock.referencePrice);
    tick(stock.symbol);
    const s = state.get(stock.symbol)!;
    const change = round(s.price - s.previousClose);
    const changePct = round((change / s.previousClose) * 100);

    const quote: StockQuote = {
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      currency: stock.currency,
      price: s.price,
      open: s.open,
      high: s.high,
      low: s.low,
      previousClose: s.previousClose,
      change,
      changePct,
      volume: s.volume,
      dividendYieldPct: stock.referenceDividendYieldPct,
      tradeDate: s.tradeDate,
      lastUpdated: new Date().toISOString(),
    };
    return quote;
  });
}
