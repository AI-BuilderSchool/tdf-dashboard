const USER_AGENT =
  "TdF-Dashboard/1.0 (personal cycling dashboard project; contact: yddeul@builderschool.ai)";

const REST_HTML_BASE = "https://en.wikipedia.org/api/rest_v1/page/html";

/** Past editions never change; only the in-progress current year needs a short revalidate. */
function revalidateFor(year: number): number {
  const currentYear = new Date().getFullYear();
  return year >= currentYear ? 3600 : 60 * 60 * 24 * 30;
}

export async function fetchWikipediaPageHtml(
  title: string,
  year: number,
): Promise<string | null> {
  const url = `${REST_HTML_BASE}/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    next: { revalidate: revalidateFor(year) },
  });
  if (!res.ok) return null;
  return res.text();
}
