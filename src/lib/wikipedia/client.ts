const USER_AGENT =
  "TdF-Dashboard/1.0 (personal cycling dashboard project; contact: yddeul@builderschool.ai)";

const REST_HTML_BASE = "https://en.wikipedia.org/api/rest_v1/page/html";

/** Past editions never change; only the in-progress current year needs a short revalidate. */
function revalidateFor(year: number): number {
  const currentYear = new Date().getFullYear();
  return year >= currentYear ? 3600 : 60 * 60 * 24 * 30;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  revalidate: number,
  attempt = 0,
): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      next: { revalidate },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    // Build environments can hit transient network timeouts under heavy
    // concurrency; retry a few times with backoff before giving up.
    if (attempt >= 3) throw err;
    await sleep(750 * 2 ** attempt);
    return fetchWithRetry(url, revalidate, attempt + 1);
  }
}

// Coalesce concurrent requests for the same page into a single in-flight
// fetch, so N pages that reference the same team article during static
// generation don't each open their own connection to Wikipedia.
const inFlight = new Map<string, Promise<string | null>>();

async function fetchWikipediaPage(
  title: string,
  revalidate: number,
): Promise<string | null> {
  const url = `${REST_HTML_BASE}/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  const cached = inFlight.get(url);
  if (cached) return cached;

  const promise = fetchWithRetry(url, revalidate).finally(() => {
    inFlight.delete(url);
  });
  inFlight.set(url, promise);
  return promise;
}

export async function fetchWikipediaPageHtml(
  title: string,
  year: number,
): Promise<string | null> {
  return fetchWikipediaPage(title, revalidateFor(year));
}

/** Team pages aren't tied to a race year; a long revalidate is fine since logos rarely change. */
export async function fetchWikipediaEvergreenPage(
  title: string,
): Promise<string | null> {
  return fetchWikipediaPage(title, 60 * 60 * 24 * 30);
}
