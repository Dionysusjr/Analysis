import { TrackedStock } from "./types";

/**
 * Curated watchlist of JSE Main Market companies with a history of paying
 * dividends. `referencePrice` / `referenceDividendYieldPct` are approximate,
 * research-based reference points (2026) used only to seed the built-in
 * demo/mock data source with realistic starting values - they are NOT live
 * market data. Verify current figures against jamstockex.com or your data
 * provider before relying on them, and prune/extend this list to match the
 * portfolio you actually want to track.
 */
export const TRACKED_STOCKS: TrackedStock[] = [
  { symbol: "NCBFG", name: "NCB Financial Group Limited", sector: "Banking & Finance", referencePrice: 68.5, referenceDividendYieldPct: 3.1, currency: "JMD" },
  { symbol: "SGJ", name: "Scotia Group Jamaica Limited", sector: "Banking & Finance", referencePrice: 34.0, referenceDividendYieldPct: 5.0, currency: "JMD" },
  { symbol: "JMMBGL", name: "JMMB Group Limited", sector: "Banking & Finance", referencePrice: 29.5, referenceDividendYieldPct: 2.4, currency: "JMD" },
  { symbol: "SJ", name: "Sagicor Group Jamaica Limited", sector: "Insurance", referencePrice: 46.0, referenceDividendYieldPct: 3.6, currency: "JMD" },
  { symbol: "BIL", name: "Barita Investments Limited", sector: "Investment & Financial Services", referencePrice: 68.0, referenceDividendYieldPct: 1.8, currency: "JMD" },
  { symbol: "MJE", name: "Mayberry Jamaican Equities Limited", sector: "Investment & Financial Services", referencePrice: 8.4, referenceDividendYieldPct: 3.0, currency: "JMD" },
  { symbol: "VMIL", name: "Victoria Mutual Investments Limited", sector: "Investment & Financial Services", referencePrice: 3.6, referenceDividendYieldPct: 2.6, currency: "JMD" },
  { symbol: "GK", name: "GraceKennedy Limited", sector: "Conglomerate", referencePrice: 92.0, referenceDividendYieldPct: 2.2, currency: "JMD" },
  { symbol: "PJAM", name: "PanJam Investment Limited", sector: "Conglomerate", referencePrice: 61.0, referenceDividendYieldPct: 2.9, currency: "JMD" },
  { symbol: "WISYNCO", name: "Wisynco Group Limited", sector: "Food, Drink & Distribution", referencePrice: 17.8, referenceDividendYieldPct: 3.4, currency: "JMD" },
  { symbol: "JBG", name: "Jamaica Broilers Group Limited", sector: "Food, Drink & Distribution", referencePrice: 32.5, referenceDividendYieldPct: 1.9, currency: "JMD" },
  { symbol: "SALF", name: "Salada Foods Jamaica Limited", sector: "Food, Drink & Distribution", referencePrice: 9.2, referenceDividendYieldPct: 3.2, currency: "JMD" },
  { symbol: "JAMT", name: "Jamaican Teas Limited", sector: "Food, Drink & Distribution", referencePrice: 6.1, referenceDividendYieldPct: 1.5, currency: "JMD" },
  { symbol: "CAR", name: "Carreras Limited", sector: "Manufacturing", referencePrice: 6.3, referenceDividendYieldPct: 11.0, currency: "JMD" },
  { symbol: "BRG", name: "Berger Paints Jamaica Limited", sector: "Manufacturing", referencePrice: 5.6, referenceDividendYieldPct: 5.4, currency: "JMD" },
  { symbol: "CCC", name: "Caribbean Cement Company Limited", sector: "Manufacturing", referencePrice: 88.0, referenceDividendYieldPct: 2.7, currency: "JMD" },
  { symbol: "SVL", name: "Supreme Ventures Limited", sector: "Gaming & Lottery", referencePrice: 24.0, referenceDividendYieldPct: 3.8, currency: "JMD" },
  { symbol: "KW", name: "Kingston Wharves Limited", sector: "Transport & Logistics", referencePrice: 115.0, referenceDividendYieldPct: 2.3, currency: "JMD" },
  { symbol: "TJH", name: "TransJamaican Highway Limited", sector: "Real Estate & Infrastructure", referencePrice: 2.9, referenceDividendYieldPct: 7.0, currency: "JMD" },
  { symbol: "PULS", name: "Pulse Investments Limited", sector: "Real Estate & Infrastructure", referencePrice: 2.4, referenceDividendYieldPct: 2.0, currency: "JMD" },
  { symbol: "138SL", name: "138 Student Living Jamaica Limited", sector: "Real Estate & Infrastructure", referencePrice: 3.1, referenceDividendYieldPct: 1.6, currency: "JMD" },
];

export const SECTORS = Array.from(
  new Set(TRACKED_STOCKS.map((s) => s.sector))
).sort();

export function findStock(symbol: string): TrackedStock | undefined {
  return TRACKED_STOCKS.find((s) => s.symbol === symbol);
}
