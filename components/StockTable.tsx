"use client";

import { useEffect, useRef, useState } from "react";
import { StockQuote } from "@/lib/types";
import { formatMoney, formatNumber, formatPct } from "@/lib/format";

type SortKey = "symbol" | "price" | "changePct" | "dividendYieldPct" | "volume";

interface Props {
  quotes: StockQuote[];
  selectedSymbol: string | null;
  onSelect: (symbol: string) => void;
}

export default function StockTable({ quotes, selectedSymbol, onSelect }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("symbol");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const prevPrices = useRef<Map<string, number>>(new Map());
  const [flashes, setFlashes] = useState<Map<string, "up" | "down">>(new Map());

  useEffect(() => {
    const nextFlashes = new Map<string, "up" | "down">();
    for (const q of quotes) {
      const prev = prevPrices.current.get(q.symbol);
      if (prev !== undefined && prev !== q.price) {
        nextFlashes.set(q.symbol, q.price > prev ? "up" : "down");
      }
      prevPrices.current.set(q.symbol, q.price);
    }
    if (nextFlashes.size > 0) {
      setFlashes(nextFlashes);
      const t = setTimeout(() => setFlashes(new Map()), 1000);
      return () => clearTimeout(t);
    }
  }, [quotes]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  }

  const sorted = [...quotes].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * sortDir;
    return ((av as number) - (bv as number)) * sortDir;
  });

  const columns: { key: SortKey; label: string }[] = [
    { key: "symbol", label: "Symbol" },
    { key: "price", label: "Price" },
    { key: "changePct", label: "Chg %" },
    { key: "dividendYieldPct", label: "Yield" },
    { key: "volume", label: "Volume" },
  ];

  if (quotes.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-gray-400">
        No stocks match the current filter.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/5 text-left text-xs uppercase tracking-wide text-gray-400">
            {columns.map((col) => (
              <th
                key={col.key}
                className="cursor-pointer select-none whitespace-nowrap px-3 py-2"
                onClick={() => toggleSort(col.key)}
              >
                {col.label}
                {sortKey === col.key ? (sortDir === 1 ? " ▲" : " ▼") : ""}
              </th>
            ))}
            <th className="whitespace-nowrap px-3 py-2">Open</th>
            <th className="whitespace-nowrap px-3 py-2">High</th>
            <th className="whitespace-nowrap px-3 py-2">Low</th>
            <th className="whitespace-nowrap px-3 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((q) => {
            const flash = flashes.get(q.symbol);
            const isSelected = selectedSymbol === q.symbol;
            return (
              <tr
                key={q.symbol}
                onClick={() => onSelect(q.symbol)}
                className={`cursor-pointer border-t border-white/5 hover:bg-white/5 ${
                  isSelected ? "bg-white/10" : ""
                } ${flash === "up" ? "animate-flashGreen" : flash === "down" ? "animate-flashRed" : ""}`}
              >
                <td className="whitespace-nowrap px-3 py-2">
                  <div className="font-medium">{q.symbol}</div>
                  <div className="text-xs text-gray-500">{q.sector}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-2 font-mono">{formatMoney(q.price, q.currency)}</td>
                <td
                  className={`whitespace-nowrap px-3 py-2 font-mono ${
                    q.changePct > 0 ? "text-rise" : q.changePct < 0 ? "text-fall" : "text-gray-400"
                  }`}
                >
                  {formatPct(q.changePct)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 font-mono">{q.dividendYieldPct.toFixed(1)}%</td>
                <td className="whitespace-nowrap px-3 py-2 font-mono">{formatNumber(q.volume)}</td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-gray-400">{formatMoney(q.open, q.currency)}</td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-gray-400">{formatMoney(q.high, q.currency)}</td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-gray-400">{formatMoney(q.low, q.currency)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-400">{q.tradeDate}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
