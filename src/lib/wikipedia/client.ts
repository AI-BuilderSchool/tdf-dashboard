const USER_AGENT =
  "TdF-Dashboard/1.0 (personal cycling dashboard project; contact: yddeul@builderschool.ai)";

const REST_HTML_BASE = "https://en.wikipedia.org/api/rest_v1/page/html";

/** Past editions never change; only the in-progress current year needs a short revalidate. */
function revalidateFor(year: number): number {
  const currentYear = new Date().getFullYear();
  return year >= currentYear ? 3600 : 60 * 60 * 24 * 30;
}

async function fetchWikipediaPage(
  title: string,
  revalidate: number,
): Promise<string | null> {
  const url = `${REST_HTML_BASE}/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    next: { revalidate },
  });
  if (!res.ok) return null;
  return res.text();
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
