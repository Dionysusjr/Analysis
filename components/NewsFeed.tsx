"use client";

import { NewsArticle, SentimentLabel } from "@/lib/types";
import { formatRelativeTime } from "@/lib/format";

interface Props {
  articles: NewsArticle[];
  warning?: string;
}

const SENTIMENT_STYLE: Record<SentimentLabel, string> = {
  positive: "border-rise/40 bg-rise/10 text-rise",
  negative: "border-fall/40 bg-fall/10 text-fall",
  neutral: "border-white/10 bg-white/5 text-gray-400",
};

const SENTIMENT_LABEL: Record<SentimentLabel, string> = {
  positive: "Positive",
  negative: "Negative",
  neutral: "Neutral",
};

export default function NewsFeed({ articles, warning }: Props) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-white/10 bg-white/5">
      <div className="border-b border-white/10 px-4 py-3">
        <div className="text-sm font-semibold">Live News &amp; Sentiment</div>
        <div className="text-xs text-gray-500">
          Headlines relevant to tracked stocks and their sectors, tagged with a heuristic sentiment read.
        </div>
        {warning && <div className="mt-2 text-xs text-amber-300">{warning}</div>}
      </div>
      <div className="max-h-[70vh] flex-1 space-y-3 overflow-y-auto p-4">
        {articles.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">
            No relevant articles right now — this refreshes automatically.
          </div>
        )}
        {articles.map((a) => (
          <a
            key={a.id}
            href={a.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-white/5 p-3 transition hover:border-white/20 hover:bg-white/5"
          >
            <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
              <span>{a.source}</span>
              <span>{formatRelativeTime(a.publishedAt)}</span>
            </div>
            <div className="mt-1 text-sm font-medium text-gray-100">{a.title}</div>
            {a.summary && <div className="mt-1 line-clamp-2 text-xs text-gray-400">{a.summary}</div>}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full border px-2 py-0.5 text-[11px] ${SENTIMENT_STYLE[a.sentiment]}`}>
                {SENTIMENT_LABEL[a.sentiment]}
              </span>
              {a.relatedSymbols.map((s) => (
                <span key={s} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-gray-300">
                  {s}
                </span>
              ))}
              {a.relatedSymbols.length === 0 &&
                a.relatedSectors.slice(0, 2).map((s) => (
                  <span key={s} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-gray-400">
                    {s}
                  </span>
                ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
