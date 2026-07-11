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

async function fetchWikipediaPage(
  title: string,
  revalidate: number,
  attempt = 0,
): Promise<string | null> {
  const url = `${REST_HTML_BASE}/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      next: { revalidate },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    // Build environments can hit transient network timeouts under heavy
    // concurrency; retry a couple of times before giving up on this page.
    if (attempt >= 2) throw err;
    await sleep(500 * (attempt + 1));
    return fetchWikipediaPage(title, revalidate, attempt + 1);
  }
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
