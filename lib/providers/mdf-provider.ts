import { TRACKED_STOCKS } from "../stocks-config";
import { StockQuote } from "../types";
import { jseTradeDateString } from "../market-hours";

/**
 * Adapter for the Jamaica Stock Exchange's official real-time Market Data
 * Feed (MDF). This is the only source that gives true exchange-grade
 * real-time data - request access via
 * https://www.jamstockex.com/services/api-services/, then set
 * JSE_MDF_BASE_URL and JSE_MDF_API_KEY.
 *
 * The exact response shape depends on the plan/format JSE provisions for
 * your account (their docs describe a JSON feed). This adapter expects an
 * array of objects with at minimum: symbol, price/last, open, high, low,
 * previousClose or change, volume - adjust `mapRecord` below to match the
 * payload your credentials actually return.
 */

interface RawMdfRecord {
  symbol: string;
  instrumentName?: string;
  price?: number;
  last?: number;
  open?: number;
  high?: number;
  low?: number;
  previousClose?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
}

export async function getMdfQuotes(): Promise<StockQuote[]> {
  const baseUrl = process.env.JSE_MDF_BASE_URL;
  const apiKey = process.env.JSE_MDF_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "STOCK_DATA_SOURCE=mdf requires JSE_MDF_BASE_URL and JSE_MDF_API_KEY to be set."
    );
  }

  const res = await fetch(baseUrl, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`JSE Market Data Feed returned HTTP ${res.status}`);
  }

  const payload = (await res.json()) as RawMdfRecord[] | { data: RawMdfRecord[] };
  const records = Array.isArray(payload) ? payload : payload.data ?? [];
  const trackedBySymbol = new Map(TRACKED_STOCKS.map((s) => [s.symbol.toUpperCase(), s]));
  const tradeDate = jseTradeDateString();

  const quotes: StockQuote[] = [];
  for (const record of records) {
    const tracked = trackedBySymbol.get(record.symbol?.toUpperCase() ?? "");
    if (!tracked) continue;

    const price = record.price ?? record.last;
    if (price === undefined) continue;
    const previousClose =
      record.previousClose ?? price - (record.change ?? 0);
    const change = record.change ?? price - previousClose;
    const changePct =
      record.changePercent ?? (previousClose ? (change / previousClose) * 100 : 0);

    quotes.push({
      symbol: tracked.symbol,
      name: record.instrumentName ?? tracked.name,
      sector: tracked.sector,
      currency: tracked.currency,
      price,
      open: record.open ?? price,
      high: record.high ?? price,
      low: record.low ?? price,
      previousClose,
      change,
      changePct,
      volume: record.volume ?? 0,
      dividendYieldPct: tracked.referenceDividendYieldPct,
      tradeDate,
      lastUpdated: new Date().toISOString(),
    });
  }

  if (quotes.length === 0) {
    throw new Error("JSE Market Data Feed returned no matching tracked symbols.");
  }

  return quotes;
}
