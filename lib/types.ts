export type Sector =
  | "Banking & Finance"
  | "Insurance"
  | "Investment & Financial Services"
  | "Conglomerate"
  | "Manufacturing"
  | "Food, Drink & Distribution"
  | "Gaming & Lottery"
  | "Real Estate & Infrastructure"
  | "Transport & Logistics"
  | "Tourism & Leisure"
  | "Telecommunications";

export interface TrackedStock {
  symbol: string;
  name: string;
  sector: Sector;
  /** Reference values used to seed the demo/mock data source. Not live data. */
  referencePrice: number;
  referenceDividendYieldPct: number;
  currency: "JMD" | "USD";
}

export interface StockQuote {
  symbol: string;
  name: string;
  sector: Sector;
  currency: "JMD" | "USD";
  price: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  change: number;
  changePct: number;
  volume: number;
  dividendYieldPct: number;
  tradeDate: string;
  lastUpdated: string;
}

export type StockDataSourceKind = "mock" | "scrape" | "mdf";

export interface StockQuoteResponse {
  source: StockDataSourceKind;
  isLive: boolean;
  marketOpen: boolean;
  generatedAt: string;
  quotes: StockQuote[];
  warning?: string;
}

export type SentimentLabel = "positive" | "neutral" | "negative";

export interface NewsArticle {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  summary: string;
  relatedSymbols: string[];
  relatedSectors: Sector[];
  sentiment: SentimentLabel;
  sentimentScore: number;
}

export interface NewsResponse {
  generatedAt: string;
  articles: NewsArticle[];
  warning?: string;
}
