import * as cheerio from "cheerio";
import type { ClassificationLeader, JerseyKind } from "./types";

const HEADING_BY_JERSEY: Record<JerseyKind, string> = {
  general: "General_classification",
  points: "Points_classification",
  mountains: "Mountains_classification",
  youth: "Young_rider_classification",
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

    const firstDataRow = table.find("tbody > tr").eq(1);
    const riderCell = firstDataRow.find("td").first();
    const teamCell = firstDataRow.find("td").eq(1);

    const rider = riderCell.find("a").first().text().trim();
    const country = riderCell.find("abbr").first().text().trim() || null;
    const team = teamCell.find("a").first().text().trim() || teamCell.text().trim();

    if (rider) {
      leaders.push({ jersey, rider, country, team, isFinal, throughStage });
    }
  }

  return leaders;
}
