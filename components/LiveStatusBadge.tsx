"use client";

import { StockDataSourceKind } from "@/lib/types";

interface Props {
  source: StockDataSourceKind;
  isLive: boolean;
  marketOpen: boolean;
  warning?: string;
}

const SOURCE_LABEL: Record<StockDataSourceKind, string> = {
  mock: "SIMULATED",
  scrape: "LIVE (SCRAPED)",
  mdf: "LIVE (JSE FEED)",
};

export default function LiveStatusBadge({ source, isLive, marketOpen, warning }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
        <span
          className={`h-2 w-2 rounded-full ${isLive ? "bg-rise animate-pulseDot" : "bg-amber-400 animate-pulseDot"}`}
        />
        <span className="font-medium tracking-wide">{SOURCE_LABEL[source]}</span>
      </span>
      <span
        className={`rounded-full px-3 py-1 border ${
          marketOpen
            ? "border-rise/40 bg-rise/10 text-rise"
            : "border-white/10 bg-white/5 text-gray-400"
        }`}
      >
        JSE Market {marketOpen ? "Open" : "Closed"}
      </span>
      {warning && (
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-amber-300">
          {warning}
        </span>
      )}
    </div>
  );
}
