"use client";

import { NewsArticle, StockQuote } from "@/lib/types";
import { formatMoney, formatNumber, formatPct, formatRelativeTime } from "@/lib/format";
import Sparkline from "./Sparkline";

interface Props {
  quote: StockQuote | null;
  history: number[];
  relatedNews: NewsArticle[];
}

export default function StockDetailPanel({ quote, history, relatedNews }: Props) {
  if (!quote) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-gray-400">
        Select a stock from the table to see full intraday detail.
      </div>
    );
  }

  const rows: { label: string; value: string }[] = [
    { label: "Open", value: formatMoney(quote.open, quote.currency) },
    { label: "High", value: formatMoney(quote.high, quote.currency) },
    { label: "Low", value: formatMoney(quote.low, quote.currency) },
    { label: "Previous Close", value: formatMoney(quote.previousClose, quote.currency) },
    { label: "Volume", value: formatNumber(quote.volume) },
    { label: "Dividend Yield", value: `${quote.dividendYieldPct.toFixed(1)}%` },
    { label: "Trade Date", value: quote.tradeDate },
  ];

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-semibold">{quote.symbol}</div>
          <div className="text-sm text-gray-400">{quote.name}</div>
          <div className="text-xs text-gray-500">{quote.sector}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold font-mono">{formatMoney(quote.price, quote.currency)}</div>
          <div className={`font-mono text-sm ${quote.changePct >= 0 ? "text-rise" : "text-fall"}`}>
            {formatPct(quote.changePct)} ({formatMoney(quote.change, quote.currency)})
          </div>
        </div>
      </div>

      <div>
        <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">Session (this browser tab)</div>
        <Sparkline values={history} width={280} height={56} />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between border-b border-white/5 py-1">
            <dt className="text-gray-500">{r.label}</dt>
            <dd className="font-mono">{r.value}</dd>
          </div>
        ))}
      </dl>

      <div className="text-xs text-gray-500">Last updated {formatRelativeTime(quote.lastUpdated)}</div>

      {relatedNews.length > 0 && (
        <div>
          <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">Related headlines</div>
          <ul className="space-y-2">
            {relatedNews.slice(0, 4).map((a) => (
              <li key={a.id}>
                <a
                  href={a.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-200 hover:text-white hover:underline"
                >
                  {a.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
