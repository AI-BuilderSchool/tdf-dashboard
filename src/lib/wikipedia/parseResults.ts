import * as cheerio from "cheerio";
import type { ResultRow } from "./types";

type CheerioRoot = ReturnType<typeof cheerio.load>;
type CheerioNode = ReturnType<CheerioRoot>;

function parseResultTable($: CheerioRoot, table: CheerioNode): ResultRow[] {
  const rows: ResultRow[] = [];
  let lastRank = "";

  // Header row tells us whether this is an individual result (Rank/Rider/Team/Time)
  // or a team-only result, e.g. a team time trial stage (Rank/Team/Time).
  const headerCells = table
    .find("tbody > tr")
    .first()
    .find("th")
    .map((_, th) => $(th).text().trim())
    .get();
  const hasRiderColumn = headerCells.some((h) => /rider/i.test(h));
  const fullColumnCount = headerCells.length;

  table
    .find("tbody > tr")
    .slice(1)
    .each((_, tr) => {
      const tds = $(tr).find("td");
      if (tds.length < 2) return;

      const hasRank = tds.length >= fullColumnCount;
      const rankCell = hasRank ? $(tds[0]) : null;
      const offset = hasRank ? 1 : 0;

      const riderCell = hasRiderColumn ? $(tds[offset]) : null;
      const teamCell = $(tds[hasRiderColumn ? offset + 1 : offset]);
      const timeCell = $(tds[hasRiderColumn ? offset + 2 : offset + 1]);

      const rank = rankCell ? rankCell.text().trim() || lastRank : lastRank;
      lastRank = rank;

      const team = teamCell.find("a").first().text().trim() || teamCell.text().trim();
      const rider = riderCell
        ? riderCell.find("a").first().text().trim() || riderCell.text().trim()
        : team;
      const country = riderCell
        ? riderCell.find("abbr").first().text().trim() || null
        : teamCell.find("abbr").first().text().trim() || null;
      const time = timeCell.text().trim();

      if (rider) rows.push({ rank, rider, country, team: hasRiderColumn ? team : "", time });
    });

  return rows.slice(0, 10);
}

export function parseStageResults(
  html: string,
  stage: string,
  isLastStage: boolean,
): { stageResults: ResultRow[]; gcResults: ResultRow[] } {
  const $ = cheerio.load(html);

  let stageResults: ResultRow[] = [];
  let gcResults: ResultRow[] = [];

  const stageResultRe = new RegExp(`^Stage\\s+${stage}\\s+Result`, "i");
  const gcRe = new RegExp(`^General classification after Stage\\s+${stage}\\b`, "i");
  const finalGcRe = /^Final general classification/i;

  $("table.wikitable.plainrowheaders").each((_, el) => {
    const table = $(el);
    const caption = table.find("caption").first().text().trim();

    if (stageResultRe.test(caption)) {
      stageResults = parseResultTable($, table);
    } else if (gcRe.test(caption) || (isLastStage && finalGcRe.test(caption))) {
      gcResults = parseResultTable($, table);
    }
  });

  return { stageResults, gcResults };
}
