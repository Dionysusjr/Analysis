"use client";

import { useState } from "react";
import { SourceStatus } from "@/lib/congress/types";
import { VIZ } from "@/lib/congress/viz-tokens";

/**
 * Provenance banner + per-source health.
 *
 * Simulated data must never look like real disclosures, so when `isLive` is
 * false this states plainly that the filers are fictional. Source failures are
 * shown rather than swallowed, so a dead upstream is visible instead of quietly
 * shrinking the dataset.
 */
export default function DataBanner({
  isLive,
  generatedAt,
  marketOpen,
  sources,
  warnings,
  lastUpdatedLabel,
}: {
  isLive: boolean;
  generatedAt: string;
  marketOpen: boolean;
  sources: SourceStatus[];
  warnings: string[];
  lastUpdatedLabel: string;
}) {
  const [open, setOpen] = useState(false);

  const active = sources.filter((s) => s.active);
  const failed = sources.filter((s) => !s.ok);
  const available = sources.filter((s) => !s.active && s.ok);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-semibold tracking-wide"
          style={{
            borderColor: isLive ? `${VIZ.buyMark}66` : "#af913c66",
            backgroundColor: isLive ? `${VIZ.buyMark}1a` : "#af913c1a",
            color: isLive ? VIZ.buyText : "#e0c063",
          }}
        >
          <span
            aria-hidden
            className="h-2 w-2 rounded-full animate-pulseDot"
            style={{ backgroundColor: isLive ? VIZ.buyMark : "#af913c" }}
          />
          {isLive ? "LIVE DISCLOSURES" : "SIMULATED — FICTIONAL FILERS"}
        </span>

        <span
          className="rounded-full border px-3 py-1"
          style={{
            borderColor: marketOpen ? `${VIZ.buyMark}66` : VIZ.border,
            backgroundColor: marketOpen ? `${VIZ.buyMark}1a` : "rgba(255,255,255,0.04)",
            color: marketOpen ? VIZ.buyText : VIZ.textMuted,
          }}
        >
          US market {marketOpen ? "open" : "closed"}
        </span>

        <span style={{ color: VIZ.textMuted }}>Updated {lastUpdatedLabel}</span>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border px-3 py-1 transition-colors hover:bg-white/5"
          style={{ borderColor: VIZ.border, color: VIZ.textSecondary }}
          aria-expanded={open}
        >
          {active.length} source{active.length === 1 ? "" : "s"} active
          {failed.length > 0 && ` · ${failed.length} failing`}
          {open ? " ▲" : " ▼"}
        </button>
      </div>

      {!isLive && (
        <p
          className="rounded-lg border px-3 py-2 text-xs leading-relaxed"
          style={{ borderColor: "#af913c4d", backgroundColor: "#af913c14", color: "#e0c063" }}
        >
          <strong>This is simulated data.</strong> The filers below are invented, not real
          officials, and every transaction is generated — deliberately, so that no fabricated
          financial record is ever attributed to a real person. Configure a live source to see
          actual disclosures.
        </p>
      )}

      {warnings.length > 0 && (
        <ul className="space-y-1">
          {warnings.map((w) => (
            <li
              key={w}
              className="rounded-lg border px-3 py-2 text-xs leading-relaxed"
              style={{ borderColor: `${VIZ.sellMark}4d`, backgroundColor: `${VIZ.sellMark}14`, color: VIZ.sellText }}
            >
              {w}
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div
          className="overflow-x-auto rounded-xl border"
          style={{ borderColor: VIZ.border, backgroundColor: VIZ.surfaceRaised }}
        >
          <table className="w-full min-w-[36rem] text-left text-xs">
            <thead style={{ color: VIZ.textMuted }}>
              <tr className="border-b" style={{ borderColor: VIZ.border }}>
                <th className="px-3 py-2 font-medium">Source</th>
                <th className="px-3 py-2 font-medium">State</th>
                <th className="px-3 py-2 text-right font-medium">Trades</th>
                <th className="px-3 py-2 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody>
              {[...active, ...failed, ...available].map((s) => (
                <tr key={s.id} className="border-b last:border-0" style={{ borderColor: VIZ.border }}>
                  <td className="px-3 py-2" style={{ color: VIZ.textPrimary }}>
                    {s.label}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      style={{
                        color: !s.ok
                          ? VIZ.sellText
                          : s.active
                            ? VIZ.buyText
                            : VIZ.textMuted,
                      }}
                    >
                      {!s.ok ? "✕ failing" : s.active ? "● active" : s.needsCredentials ? "○ needs key" : "○ idle"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums" style={{ color: VIZ.textSecondary }}>
                    {s.tradeCount.toLocaleString()}
                  </td>
                  <td className="px-3 py-2" style={{ color: VIZ.textMuted }}>
                    {s.message ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
