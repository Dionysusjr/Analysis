export interface NewsFeedSource {
  name: string;
  url: string;
}

/**
 * Public RSS feeds covering Jamaican business/financial news. These are
 * read-only headline feeds (title/link/summary/date) - full article text
 * always stays on the publisher's site, and every article card links back
 * to the original source.
 *
 * Feed URLs occasionally move; if one starts failing, `aggregator.ts`
 * quietly skips it (Promise.allSettled) rather than breaking the whole
 * news panel - check the publisher's current RSS listing page and update
 * the URL here.
 */
export const NEWS_FEEDS: NewsFeedSource[] = [
  { name: "Jamaica Observer - Business", url: "https://www.jamaicaobserver.com/category/business/feed/" },
  { name: "Jamaica Observer - Latest News", url: "https://www.jamaicaobserver.com/feed/" },
  { name: "Jamaica Gleaner", url: "https://jamaica-gleaner.com/feed" },
  { name: "Loop Jamaica", url: "https://jamaica.loopnews.com/rss.xml" },
  { name: "Nationwide News Network", url: "https://nationwideradiojm.com/feed" },
];
