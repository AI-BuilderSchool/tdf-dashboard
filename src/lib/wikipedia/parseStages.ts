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
 * Parses the "Stage characteristics" table from a grand tour year article.
 * Column layout varies by race/year — some editions omit "Elevation gain",
 * some (Giro/Vuelta) add a trailing "Ref" column — so columns are resolved
 * by matching header <th> labels (expanded for colspan) rather than a fixed
 * index or a raw <td> count.
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

  // Build a label per physical <td> column (skipping the leading "Stage" <th>),
  // expanding any colspan so the list lines up 1:1 with each row's <td>s.
  const headerRow = table.find("tr").first();
  const columns: string[] = [];
  headerRow
    .find("th")
    .slice(1)
    .each((_, th) => {
      const $th = $(th);
      const label = $th.text().trim();
      const span = parseInt($th.attr("colspan") ?? "1", 10) || 1;
      for (let i = 0; i < span; i++) columns.push(label);
    });

  // Header text can carry a trailing footnote marker (e.g. "Elevation gain[10]"),
  // so match by prefix rather than exact equality.
  const findColumn = (label: string) => columns.findIndex((c) => c.startsWith(label));
  const dateIdx = findColumn("Date");
  const courseIdx = findColumn("Course");
  const distanceIdx = findColumn("Distance");
  const elevationIdx = findColumn("Elevation gain");
  const typeIndices = columns.reduce<number[]>((acc, label, i) => {
    if (label.startsWith("Type")) acc.push(i);
    return acc;
  }, []);
  const winnerIdx = findColumn("Winner");

  const stages: StageSummary[] = [];

  table
    .find("tr")
    .slice(1)
    .each((_, row) => {
      const $row = $(row);
      const stageHeader = $row.find("th").first();
      const stage = stageHeader.text().trim();
      // Skip rest-day rows (blank stage cell) and the trailing "Total" summary
      // row some editions add; real stage labels are like "1" or "11a".
      if (!/^\d+[a-z]?$/i.test(stage)) return;

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
      if (tds.length === 0 || winnerIdx < 0) return;

      const date = dateIdx >= 0 ? $(tds[dateIdx]).text().trim() : "";
      const course =
        courseIdx >= 0 ? $(tds[courseIdx]).text().trim().replace(/\s+/g, " ") : "";
      const distanceText =
        distanceIdx >= 0 ? $(tds[distanceIdx]).text().trim() || null : null;
      const elevationGainText =
        elevationIdx >= 0 ? $(tds[elevationIdx]).text().trim() || null : null;

      // Of the two "Type" columns, the icon cell has an <img>; the other has text.
      const iconIdx = typeIndices.find((i) => $(tds[i]).find("img").length > 0);
      const typeTextIdx = typeIndices.find((i) => i !== iconIdx);
      const iconAlt = iconIdx !== undefined ? $(tds[iconIdx]).find("img").attr("alt") ?? "" : "";
      const typeText = typeTextIdx !== undefined ? $(tds[typeTextIdx]).text().trim() : "";

      const winnerCell = $(tds[winnerIdx]);
      // For team time trial stages the winner is a team, and its flag (unlike
      // the plain-image flag used for individual riders) is itself a link —
      // skip to the first <a> that actually has text.
      const winnerLink = winnerCell
        .find("a")
        .filter((_, el) => $(el).text().trim().length > 0)
        .first();
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
