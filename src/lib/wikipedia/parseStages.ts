import * as cheerio from "cheerio";
import type { StageProfile, StageSummary } from "./types";

function parseLeadingNumber(text: string | null | undefined): number | null {
  if (!text) return null;
  const match = text.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

function inferProfile(typeText: string, iconAlt: string): StageProfile {
  const t = `${typeText} ${iconAlt}`.toLowerCase();
  if (t.includes("team time trial")) return "ttt";
  if (t.includes("time trial")) return "itt";
  if (t.includes("medium-mountain") || t.includes("medium mountain")) return "hilly";
  if (t.includes("summit")) return "mountain-summit";
  if (t.includes("mountain")) return "mountain";
  if (t.includes("hilly")) return "hilly";
  if (t.includes("flat") || t.includes("plain")) return "flat";
  return "unknown";
}

/**
 * Parses the "Stage characteristics" table from a Tour de France year article.
 * Column layout varies by year (some editions omit "Elevation gain"), so columns
 * are resolved by counting <td>s per row rather than a fixed index.
 */
export function parseStageTable(html: string): StageSummary[] {
  const $ = cheerio.load(html);

  const table = $("table.wikitable")
    .filter((_, el) => {
      const headers = $(el).find("tr").first().find("th").map((__, th) => $(th).text().trim()).get();
      return headers.includes("Stage") && headers.includes("Course");
    })
    .first();

  if (table.length === 0) return [];

  const stages: StageSummary[] = [];

  table
    .find("tr")
    .slice(1)
    .each((_, row) => {
      const $row = $(row);
      const stageHeader = $row.find("th").first();
      const stage = stageHeader.text().trim();
      if (!stage) return;

      const link = stageHeader.find("a").first();
      const href = link.attr("href") ?? "";
      const anchorIdx = href.indexOf("#");
      const resultLink =
        anchorIdx >= 0
          ? {
              subArticle: decodeURIComponent(href.slice(2, anchorIdx)),
              anchor: href.slice(anchorIdx + 1),
            }
          : null;

      const tds = $row.find("td");
      const n = tds.length;
      if (n < 6) return;

      const hasElevation = n === 7;
      const date = $(tds[0]).text().trim();
      const course = $(tds[1]).text().trim().replace(/\s+/g, " ");
      const distanceText = $(tds[2]).text().trim() || null;
      const elevationGainText = hasElevation ? $(tds[3]).text().trim() || null : null;
      const iconIdx = hasElevation ? 4 : 3;
      const typeIdx = hasElevation ? 5 : 4;
      const winnerIdx = n - 1;

      const iconAlt = $(tds[iconIdx]).find("img").attr("alt") ?? "";
      const typeText = $(tds[typeIdx]).text().trim();
      const winnerCell = $(tds[winnerIdx]);
      const winnerLink = winnerCell.find("a").first();
      const winnerText = winnerLink.text().trim() || null;
      const countryMatch = winnerCell.text().match(/\(([A-Z]{3})\)/);

      stages.push({
        stage,
        date,
        course,
        distanceText,
        distanceKm: parseLeadingNumber(distanceText),
        elevationGainText,
        elevationGainM: parseLeadingNumber(elevationGainText),
        typeText: typeText || "Unknown",
        profile: inferProfile(typeText, iconAlt),
        winner: winnerText,
        winnerCountry: countryMatch ? countryMatch[1] : null,
        resultLink,
      });
    });

  return stages;
}
