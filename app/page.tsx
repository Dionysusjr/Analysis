"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { NewsResponse, StockQuoteResponse } from "@/lib/types";
import { SECTORS } from "@/lib/stocks-config";
import { formatRelativeTime } from "@/lib/format";
import LiveStatusBadge from "@/components/LiveStatusBadge";
import StatCard from "@/components/StatCard";
import SectorFilter from "@/components/SectorFilter";
import StockTable from "@/components/StockTable";
import StockDetailPanel from "@/components/StockDetailPanel";
import NewsFeed from "@/components/NewsFeed";

const STOCK_POLL_MS = Number(process.env.NEXT_PUBLIC_STOCK_POLL_MS ?? 30000);
const NEWS_POLL_MS = Number(process.env.NEXT_PUBLIC_NEWS_POLL_MS ?? 300000);
const MAX_HISTORY_POINTS = 60;

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardPage() {
  const { data: stockData } = useSWR<StockQuoteResponse>("/api/stocks", fetcher, {
    refreshInterval: STOCK_POLL_MS,
    revalidateOnFocus: true,
  });
  const { data: newsData } = useSWR<NewsResponse>("/api/news", fetcher, {
    refreshInterval: NEWS_POLL_MS,
    revalidateOnFocus: false,
  });

  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [sector, setSector] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<Record<string, number[]>>({});

  const quotes = useMemo(() => stockData?.quotes ?? [], [stockData]);
  const articles = newsData?.articles ?? [];

  useEffect(() => {
    if (quotes.length === 0) return;
    setHistory((prev) => {
      const next = { ...prev };
      for (const q of quotes) {
        const existing = next[q.symbol];
        const series = existing ? [...existing] : [];
        series.push(q.price);
        if (series.length > MAX_HISTORY_POINTS) series.shift();
        next[q.symbol] = series;
      }
      return next;
    });
    const firstQuote = quotes[0];
    if (!selectedSymbol && firstQuote) setSelectedSymbol(firstQuote.symbol);
  }, [quotes, selectedSymbol]);

  const filtered = useMemo(() => {
    return quotes.filter((q) => {
      if (sector && q.sector !== sector) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!q.symbol.toLowerCase().includes(s) && !q.name.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [quotes, sector, search]);

  const selectedQuote = quotes.find((q) => q.symbol === selectedSymbol) ?? null;
  const selectedNews = selectedSymbol
    ? articles.filter((a) => a.relatedSymbols.includes(selectedSymbol))
    : [];

  const gainers = quotes.filter((q) => q.changePct > 0).length;
  const decliners = quotes.filter((q) => q.changePct < 0).length;
  const avgYield =
    quotes.length > 0 ? quotes.reduce((sum, q) => sum + q.dividendYieldPct, 0) / quotes.length : 0;

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">JA Dividend Watch</h1>
            <p className="text-sm text-gray-400">
              Live-updating dashboard for Jamaican dividend-paying stocks, with a related news &amp; sentiment feed.
            </p>
          </div>
          {stockData && (
            <LiveStatusBadge
              source={stockData.source}
              isLive={stockData.isLive}
              marketOpen={stockData.marketOpen}
              warning={stockData.warning}
            />
          )}
        </div>
        {stockData && (
          <div className="text-xs text-gray-500">
            Prices last refreshed {formatRelativeTime(stockData.generatedAt)} · auto-refreshing every{" "}
            {Math.round(STOCK_POLL_MS / 1000)}s
          </div>
        )}
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Tracked Stocks" value={String(quotes.length)} />
        <StatCard label="Gainers" value={String(gainers)} tone="positive" />
        <StatCard label="Decliners" value={String(decliners)} tone="negative" />
        <StatCard label="Avg Dividend Yield" value={`${avgYield.toFixed(1)}%`} />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <SectorFilter
            sectors={SECTORS}
            active={sector}
            onChange={setSector}
            search={search}
            onSearchChange={setSearch}
          />
          <StockTable quotes={filtered} selectedSymbol={selectedSymbol} onSelect={setSelectedSymbol} />
          <StockDetailPanel
            quote={selectedQuote}
            history={selectedSymbol ? history[selectedSymbol] ?? [] : []}
            relatedNews={selectedNews}
          />
        </div>
        <div className="xl:sticky xl:top-6 xl:self-start">
          <NewsFeed articles={articles} warning={newsData?.warning} />
        </div>
      </div>

      <footer className="mt-8 text-xs text-gray-600">
        Data source: {stockData?.source ?? "…"}. Prices in demo mode are simulated for demonstration and are not
        real market data. Dividend yields shown are approximate reference figures - verify against{" "}
        <a
          className="underline hover:text-gray-400"
          href="https://www.jamstockex.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          jamstockex.com
        </a>{" "}
        before making financial decisions. Nothing here is investment advice.
      </footer>
    </main>
  );
}
