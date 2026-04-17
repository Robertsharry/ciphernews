import "server-only";

export type NewsApiArticle = {
  source: { id: string | null; name: string } | null;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
};

type NewsApiResponse = {
  status: "ok" | "error";
  totalResults?: number;
  articles?: NewsApiArticle[];
  message?: string;
  code?: string;
};

const BASE = "https://newsapi.org/v2";

function key() {
  const k = process.env.NEWSAPI_KEY;
  if (!k) throw new Error("NEWSAPI_KEY is not set");
  return k;
}

export async function fetchTopHeadlines(opts: {
  country?: string;
  category?:
    | "business"
    | "entertainment"
    | "general"
    | "health"
    | "science"
    | "sports"
    | "technology";
  q?: string;
  pageSize?: number;
}): Promise<NewsApiArticle[]> {
  const params = new URLSearchParams({
    apiKey: key(),
    pageSize: String(opts.pageSize ?? 60),
  });
  if (opts.country) params.set("country", opts.country);
  if (opts.category) params.set("category", opts.category);
  if (opts.q) params.set("q", opts.q);

  const res = await fetch(`${BASE}/top-headlines?${params.toString()}`, {
    cache: "no-store",
  });
  const json = (await res.json()) as NewsApiResponse;
  if (json.status !== "ok" || !json.articles) {
    throw new Error(`NewsAPI error: ${json.message ?? json.code ?? "unknown"}`);
  }
  return json.articles;
}

export async function fetchEverything(opts: {
  q: string;
  from?: string;
  to?: string;
  sortBy?: "publishedAt" | "relevancy" | "popularity";
  pageSize?: number;
  language?: string;
}): Promise<NewsApiArticle[]> {
  const params = new URLSearchParams({
    apiKey: key(),
    q: opts.q,
    sortBy: opts.sortBy ?? "publishedAt",
    pageSize: String(opts.pageSize ?? 40),
    language: opts.language ?? "en",
  });
  if (opts.from) params.set("from", opts.from);
  if (opts.to) params.set("to", opts.to);

  const res = await fetch(`${BASE}/everything?${params.toString()}`, {
    cache: "no-store",
  });
  const json = (await res.json()) as NewsApiResponse;
  if (json.status !== "ok" || !json.articles) {
    throw new Error(`NewsAPI error: ${json.message ?? json.code ?? "unknown"}`);
  }
  return json.articles;
}

/** Fetch a diverse world-news batch: mix general + categories from multiple countries. */
export async function fetchWorldBatch(): Promise<NewsApiArticle[]> {
  const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const groups = await Promise.all([
    fetchTopHeadlines({ category: "general", pageSize: 40 }),
    fetchTopHeadlines({ category: "business", pageSize: 20 }),
    fetchTopHeadlines({ category: "science", pageSize: 15 }),
    fetchTopHeadlines({ category: "technology", pageSize: 15 }),
    fetchEverything({
      q: "(world OR international OR global)",
      from: since,
      pageSize: 30,
    }),
  ]);
  return dedupe(groups.flat());
}

/** Local batch: use the user's city + region + country. */
export async function fetchLocalBatch(opts: {
  city: string;
  region: string | null;
  country: string;
}): Promise<NewsApiArticle[]> {
  const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const queries = [
    `"${opts.city}"`,
    opts.region ? `"${opts.city}" AND "${opts.region}"` : null,
  ].filter((q): q is string => !!q);

  const groups = await Promise.all([
    // Country top headlines (NewsAPI uses 2-letter lowercase country codes)
    fetchTopHeadlines({
      country: opts.country.toLowerCase(),
      pageSize: 30,
    }).catch(() => []),
    ...queries.map((q) =>
      fetchEverything({ q, from: since, pageSize: 20 }).catch(() => []),
    ),
  ]);
  return dedupe(groups.flat());
}

function dedupe(articles: NewsApiArticle[]): NewsApiArticle[] {
  const seen = new Set<string>();
  const out: NewsApiArticle[] = [];
  for (const a of articles) {
    const key = a.url || a.title;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  return out;
}
