import Parser from "rss-parser";
import { NEWS_FEEDS } from "./feeds";
import { matchRelevance } from "./relevance";
import { scoreSentiment } from "../sentiment";
import { NewsArticle, NewsResponse } from "../types";

const parser = new Parser({
  timeout: 10_000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; JaDividendDashboard/1.0)" },
});

function makeId(link: string | undefined, title: string | undefined): string {
  const base = link ?? title ?? Math.random().toString(36);
  return Buffer.from(base).toString("base64url").slice(0, 24);
}

export async function fetchRelevantNews(): Promise<NewsResponse> {
  const generatedAt = new Date().toISOString();

  const results = await Promise.allSettled(
    NEWS_FEEDS.map(async (feed) => ({
      feed,
      parsed: await parser.parseURL(feed.url),
    }))
  );

  const articles: NewsArticle[] = [];
  const failures: string[] = [];
  const seen = new Set<string>();

  for (const result of results) {
    if (result.status === "rejected") {
      failures.push(String(result.reason?.message ?? result.reason));
      continue;
    }
    const { feed, parsed } = result.value;

    for (const item of parsed.items) {
      const title = item.title?.trim();
      if (!title) continue;
      const link = item.link ?? "";
      const dedupeKey = link || title;
      if (seen.has(dedupeKey)) continue;

      const summary = (item.contentSnippet ?? item.content ?? "").trim().slice(0, 320);
      const relevance = matchRelevance(`${title} ${summary}`);
      const isRelevant =
        relevance.symbols.length > 0 || relevance.sectors.length > 0 || relevance.isMarketRelevant;
      if (!isRelevant) continue;

      seen.add(dedupeKey);
      const sentiment = scoreSentiment(`${title} ${summary}`);

      articles.push({
        id: makeId(link, title),
        title,
        link,
        source: feed.name,
        publishedAt: item.isoDate ?? item.pubDate ?? generatedAt,
        summary,
        relatedSymbols: relevance.symbols,
        relatedSectors: relevance.sectors,
        sentiment: sentiment.label,
        sentimentScore: sentiment.score,
      });
    }
  }

  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const response: NewsResponse = {
    generatedAt,
    articles: articles.slice(0, 40),
  };

  if (failures.length === NEWS_FEEDS.length) {
    response.warning = `All news sources are currently unreachable (${failures[0]}).`;
  } else if (failures.length > 0) {
    response.warning = `${failures.length} of ${NEWS_FEEDS.length} news sources were unreachable this refresh.`;
  }

  return response;
}
