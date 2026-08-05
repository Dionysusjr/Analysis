import { StockDataSourceKind, StockQuoteResponse } from "../types";
import { getMockQuotes } from "./mock-provider";
import { getScrapedQuotes } from "./scrape-provider";
import { getMdfQuotes } from "./mdf-provider";
import { isJseMarketOpen } from "../market-hours";

function configuredSource(): StockDataSourceKind {
  const raw = (process.env.STOCK_DATA_SOURCE ?? "mock").toLowerCase();
  if (raw === "scrape" || raw === "mdf" || raw === "mock") return raw;
  return "mock";
}

export async function fetchStockQuotes(): Promise<StockQuoteResponse> {
  const source = configuredSource();
  const generatedAt = new Date().toISOString();
  const marketOpen = isJseMarketOpen();

  if (source === "mock") {
    return { source: "mock", isLive: false, marketOpen, generatedAt, quotes: getMockQuotes() };
  }

  try {
    const quotes = source === "scrape" ? await getScrapedQuotes() : await getMdfQuotes();
    return { source, isLive: true, marketOpen, generatedAt, quotes };
  } catch (err) {
    // Never let a flaky upstream take the dashboard down - fall back to the
    // simulator and surface why, so the UI can show a clear "demo data"
    // banner instead of a blank screen.
    const message = err instanceof Error ? err.message : String(err);
    return {
      source: "mock",
      isLive: false,
      marketOpen,
      generatedAt,
      quotes: getMockQuotes(),
      warning: `Falling back to simulated data: ${message}`,
    };
  }
}
