import * as cheerio from "cheerio";
import { TRACKED_STOCKS } from "../stocks-config";
import { StockQuote } from "../types";
import { jseTradeDateString } from "../market-hours";

/**
 * Best-effort HTML scraper for the public JSE market data page.
 *
 * jamstockex.com does not publish a documented free public API (JSE does
 * offer an official real-time Market Data Feed - see the `mdf` provider -
 * but it requires requesting access). This scraper is a fallback for
 * self-hosted deployments that want to try pulling live numbers without
 * that agreement in place.
 *
 * It is intentionally defensive: it doesn't hardcode column positions.
 * Instead it reads each table's header row, matches header text against
 * known column meanings (symbol/price/open/high/low/volume/change), and
 * only returns rows for symbols we're already tracking. If the site's
 * markup changes, this will most likely return zero rows rather than wrong
 * data - callers should treat an empty/short result as a failure and fall
 * back to another source.
 */

const SOURCE_URL =
  process.env.JSE_SCRAPE_URL ?? "https://www.jamstockex.com/market-data/";

const HEADER_ALIASES: Record<string, string[]> = {
  symbol: ["symbol", "instrument", "stock", "code"],
  price: ["price", "last", "close", "market price"],
  open: ["open"],
  high: ["high"],
  low: ["low"],
  volume: ["volume", "vol"],
  change: ["change", "chg", "$ change"],
  changePct: ["% change", "%change", "change %", "% chg"],
};

function matchHeader(text: string): string | null {
  const t = text.trim().toLowerCase();
  for (const [key, aliases] of Object.entries(HEADER_ALIASES)) {
    if (aliases.some((a) => t === a || t.includes(a))) return key;
  }
  return null;
}

function toNumber(text: string): number | null {
  const cleaned = text.replace(/[^0-9.\-]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export async function getScrapedQuotes(): Promise<StockQuote[]> {
  const res = await fetch(SOURCE_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; JaDividendDashboard/1.0; +https://github.com/)",
      Accept: "text/html",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`JSE market data page returned HTTP ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const tradeDate = jseTradeDateString();
  const bySymbol = new Map<string, StockQuote>();
  const trackedBySymbol = new Map(TRACKED_STOCKS.map((s) => [s.symbol.toUpperCase(), s]));

  $("table").each((_, table) => {
    const headerCells = $(table).find("thead tr th, tr:first-child th, tr:first-child td");
    const columnMap: (string | null)[] = [];
    headerCells.each((i, cell) => {
      columnMap[i] = matchHeader($(cell).text());
    });
    if (!columnMap.includes("symbol")) return;

    $(table)
      .find("tbody tr, tr")
      .each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length === 0) return;
        const record: Record<string, string> = {};
        cells.each((i, cell) => {
          const key = columnMap[i];
          if (key) record[key] = $(cell).text();
        });
        const symbolRaw = record.symbol?.trim().toUpperCase();
        if (!symbolRaw) return;
        const tracked = trackedBySymbol.get(symbolRaw);
        if (!tracked) return;

        const price = toNumber(record.price ?? "");
        if (price === null) return;
        const open = toNumber(record.open ?? "") ?? price;
        const high = toNumber(record.high ?? "") ?? Math.max(open, price);
        const low = toNumber(record.low ?? "") ?? Math.min(open, price);
        const change = toNumber(record.change ?? "") ?? 0;
        const changePct = toNumber(record.changePct ?? "") ?? 0;
        const volume = toNumber(record.volume ?? "") ?? 0;

        bySymbol.set(tracked.symbol, {
          symbol: tracked.symbol,
          name: tracked.name,
          sector: tracked.sector,
          currency: tracked.currency,
          price,
          open,
          high,
          low,
          previousClose: round(price - change),
          change,
          changePct,
          volume,
          dividendYieldPct: tracked.referenceDividendYieldPct,
          tradeDate,
          lastUpdated: new Date().toISOString(),
        });
      });
  });

  if (bySymbol.size === 0) {
    throw new Error(
      "Could not locate any tracked symbols in the JSE market data page - the site's markup likely changed."
    );
  }

  return Array.from(bySymbol.values());
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
