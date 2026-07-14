import * as cheerio from "cheerio";
import type { ClassificationLeader, JerseyKind } from "./types";

const HEADING_BY_JERSEY: Record<JerseyKind, string> = {
  general: "General_classification",
  points: "Points_classification",
  mountains: "Mountains_classification",
  youth: "Young_rider_classification",
};

// General classification shows a full podium (top 3); the other jerseys just
// need their current leader.
const ROWS_BY_JERSEY: Record<JerseyKind, number> = {
  general: 3,
  points: 1,
  mountains: 1,
  youth: 1,
};

export function parseClassificationLeaders(html: string): ClassificationLeader[] {
  const $ = cheerio.load(html);
  const leaders: ClassificationLeader[] = [];

  for (const [jersey, headingId] of Object.entries(HEADING_BY_JERSEY) as [
    JerseyKind,
    string,
  ][]) {
    const section = $(`h3#${headingId}`).parent();
    const table = section.find("table.wikitable").first();
    if (table.length === 0) continue;

    const caption = table.find("caption").first().text().trim();
    const isFinal = /^Final/i.test(caption);
    const stageMatch = caption.match(/after Stage\s+(\S+)/i);
    const throughStage = stageMatch ? stageMatch[1] : null;

    const rowCount = ROWS_BY_JERSEY[jersey];
    for (let rank = 1; rank <= rowCount; rank++) {
      const dataRow = table.find("tbody > tr").eq(rank);
      if (dataRow.length === 0) break;

      const riderCell = dataRow.find("td").first();
      const teamCell = dataRow.find("td").eq(1);

      const rider = riderCell.find("a").first().text().trim();
      const country = riderCell.find("abbr").first().text().trim() || null;
      const team = teamCell.find("a").first().text().trim() || teamCell.text().trim();

      if (rider) {
        leaders.push({ jersey, rank, rider, country, team, isFinal, throughStage });
      }
    }
  }

  return leaders;
}
