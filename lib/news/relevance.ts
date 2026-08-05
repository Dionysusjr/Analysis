import { Sector, TrackedStock } from "../types";
import { TRACKED_STOCKS } from "../stocks-config";

/** Sector-level keywords used to catch industry/trend stories even when no
 * tracked company is named directly (e.g. "Bank of Jamaica raises policy
 * rate" is relevant to every Banking & Finance holding). */
const SECTOR_KEYWORDS: Record<Sector, string[]> = {
  "Banking & Finance": ["bank", "banking", "bank of jamaica", "boj", "interest rate", "policy rate", "loan", "lending", "credit union"],
  "Insurance": ["insurance", "insurer", "underwriting", "claims", "reinsurance", "actuarial"],
  "Investment & Financial Services": ["brokerage", "securities", "mutual fund", "unit trust", "asset management", "investment bank", "wealth management"],
  "Conglomerate": ["conglomerate", "diversified holdings", "subsidiary"],
  "Manufacturing": ["manufacturing", "manufacturer", "factory", "production line", "cement", "paint", "tobacco"],
  "Food, Drink & Distribution": ["food", "beverage", "agro-processing", "fmcg", "grocery", "distribution", "poultry", "broiler"],
  "Gaming & Lottery": ["gaming", "lottery", "betting", "casino", "gambling", "wagering"],
  "Real Estate & Infrastructure": ["real estate", "construction", "infrastructure", "highway", "toll road", "property development", "housing"],
  "Transport & Logistics": ["port", "shipping", "logistics", "wharf", "freight", "transport", "container traffic"],
  "Tourism & Leisure": ["tourism", "tourist", "hotel", "resort", "visitor arrivals", "cruise ship", "airbnb"],
  "Telecommunications": ["telecom", "telecommunications", "broadband", "mobile network", "5g", "digicel", "flow jamaica"],
};

const MARKET_KEYWORDS = [
  "jamaica stock exchange",
  "jse",
  "dividend",
  "stock market",
  "shares",
  "equities",
  "market capitalisation",
  "market capitalization",
  "junior market",
  "main market",
  "ipo",
  "initial public offering",
];

export interface RelevanceMatch {
  symbols: string[];
  sectors: Sector[];
  isMarketRelevant: boolean;
}

function includesWord(haystack: string, needle: string): boolean {
  return haystack.includes(needle.toLowerCase());
}

export function matchRelevance(text: string): RelevanceMatch {
  const lower = text.toLowerCase();
  const symbols = new Set<string>();
  const sectors = new Set<Sector>();

  for (const stock of TRACKED_STOCKS as TrackedStock[]) {
    const nameHit = includesWord(lower, stock.name.toLowerCase());
    const symbolHit = new RegExp(`\\b${stock.symbol.toLowerCase()}\\b`).test(lower);
    if (nameHit || symbolHit) {
      symbols.add(stock.symbol);
      sectors.add(stock.sector);
    }
  }

  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS) as [Sector, string[]][]) {
    if (keywords.some((k) => includesWord(lower, k))) {
      sectors.add(sector);
    }
  }

  const isMarketRelevant = MARKET_KEYWORDS.some((k) => includesWord(lower, k));

  return { symbols: Array.from(symbols), sectors: Array.from(sectors), isMarketRelevant };
}
