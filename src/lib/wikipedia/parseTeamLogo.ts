import * as cheerio from "cheerio";

/**
 * Team infobox images are inconsistent across Wikipedia: some are the
 * clean team logo, others are event/action photos or a generic
 * "current event" notice icon. Heuristically skip anything that looks
 * like a dated event photo and keep looking until a plausible logo is found.
 */
function isLikelyLogo(filename: string): boolean {
  const normalized = filename.replace(/_/g, " ");
  if (/^cycling current event\.svg$/i.test(normalized)) return false;
  const hasYear = /\d{4}/.test(normalized);
  const looksLikeLogo = /logo/i.test(normalized);
  return !hasYear || looksLikeLogo;
}

export function parseInfoboxLogo(html: string): string | null {
  const $ = cheerio.load(html);
  const images = $(".infobox").first().find("img").toArray();

  for (const el of images) {
    const $el = $(el);
    const src = $el.attr("src");
    const resource = $el.attr("resource") ?? "";
    if (!src) continue;

    const filename = decodeURIComponent(resource.replace(/^\.\/File:/, ""));
    if (!isLikelyLogo(filename)) continue;

    return src.startsWith("//") ? `https:${src}` : src;
  }

  return null;
}
