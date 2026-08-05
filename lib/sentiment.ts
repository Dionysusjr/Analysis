import { SentimentLabel } from "./types";

/**
 * Lightweight lexicon-based sentiment scorer. This is a heuristic, not a
 * financial model - it exists to give a quick directional read ("does this
 * headline skew positive/negative for the company or sector") on a news
 * feed, not investment advice.
 */

const POSITIVE_WORDS = [
  "growth", "profit", "profits", "profitable", "surge", "surged", "surging",
  "record", "rally", "rallied", "gain", "gains", "gained", "upgrade",
  "upgraded", "strong", "robust", "expansion", "expand", "expands", "rise",
  "rose", "rising", "boost", "boosted", "outperform", "outperformed", "beat",
  "beats", "recovery", "recovered", "optimistic", "positive", "upbeat",
  "milestone", "award", "awarded", "partnership", "inflow", "bullish",
  "dividend increase", "increased dividend", "buyback", "acquisition",
  "profit surge", "earnings beat",
];

const NEGATIVE_WORDS = [
  "decline", "declined", "declining", "loss", "losses", "slump", "slumped",
  "downgrade", "downgraded", "weak", "weaker", "weakness", "contraction",
  "fall", "fell", "falling", "drop", "dropped", "plunge", "plunged",
  "underperform", "underperformed", "miss", "missed", "layoff", "layoffs",
  "lawsuit", "fraud", "scandal", "delay", "delayed", "warning", "recession",
  "deficit", "debt crisis", "bankruptcy", "default", "strike", "disruption",
  "bearish", "sell-off", "selloff", "shortfall", "dividend cut", "suspended",
  "investigation", "penalty", "fine",
];

function countMatches(text: string, words: string[]): number {
  let count = 0;
  for (const word of words) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\b${escaped}\\b`, "gi");
    const matches = text.match(pattern);
    if (matches) count += matches.length;
  }
  return count;
}

export function scoreSentiment(text: string): { label: SentimentLabel; score: number } {
  const positive = countMatches(text, POSITIVE_WORDS);
  const negative = countMatches(text, NEGATIVE_WORDS);
  const total = positive + negative;

  if (total === 0) return { label: "neutral", score: 0 };

  const raw = (positive - negative) / total; // -1..1
  const score = Math.round(raw * 100) / 100;

  let label: SentimentLabel = "neutral";
  if (score > 0.15) label = "positive";
  else if (score < -0.15) label = "negative";

  return { label, score };
}
