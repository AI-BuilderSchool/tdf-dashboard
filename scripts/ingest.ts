/**
 * One-off / periodic data refresh: scrapes Wikipedia via the same parsing
 * logic the app used to call live, and writes the result into
 * data/tdf.db. Run with `npm run ingest` (optionally `-- --year 2026` to
 * refresh a single year) whenever the current Tour's data needs updating.
 */
import Database from "better-sqlite3";
import path from "node:path";
import {
  getAvailableYears,
  getStageDetail,
  getYearClassifications,
  getYearStages,
  getYearTeams,
} from "../src/lib/wikipedia";
import { SCHEMA_SQL } from "../src/lib/db/schema";

const DB_PATH = path.join(process.cwd(), "data", "tdf.db");

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function ingestYear(db: Database.Database, year: number) {
  console.log(`\n[${year}] fetching stage list...`);
  const stages = await getYearStages(year);
  if (stages.length === 0) {
    console.warn(`[${year}] no stages found, skipping`);
    return;
  }
  console.log(`[${year}] ${stages.length} stages`);

  const deleteStages = db.prepare("DELETE FROM stages WHERE year = ?");
  const deleteResults = db.prepare("DELETE FROM stage_results WHERE year = ?");
  const deleteTeams = db.prepare("DELETE FROM teams WHERE year = ?");
  const deleteRoster = db.prepare("DELETE FROM roster WHERE year = ?");
  const deleteClassifications = db.prepare("DELETE FROM classifications WHERE year = ?");

  const insertStage = db.prepare(`
    INSERT INTO stages (year, stage, date, course, distance_km, distance_text,
      elevation_gain_m, elevation_gain_text, type_text, profile, winner,
      winner_country, result_sub_article, result_anchor, stage_order)
    VALUES (@year, @stage, @date, @course, @distanceKm, @distanceText,
      @elevationGainM, @elevationGainText, @typeText, @profile, @winner,
      @winnerCountry, @resultSubArticle, @resultAnchor, @stageOrder)
  `);

  const insertResult = db.prepare(`
    INSERT INTO stage_results (year, stage, kind, position, rank, rider, country, team, time)
    VALUES (@year, @stage, @kind, @position, @rank, @rider, @country, @team, @time)
  `);

  const insertTeam = db.prepare(`
    INSERT INTO teams (year, code, name, wiki_title, team_order)
    VALUES (@year, @code, @name, @wikiTitle, @teamOrder)
  `);

  const insertRoster = db.prepare(`
    INSERT INTO roster (year, team_code, position, bib, name, country, final_position)
    VALUES (@year, @teamCode, @position, @bib, @name, @country, @finalPosition)
  `);

  const insertClassification = db.prepare(`
    INSERT INTO classifications (year, jersey, rank, rider, country, team, is_final, through_stage)
    VALUES (@year, @jersey, @rank, @rider, @country, @team, @isFinal, @throughStage)
  `);

  const details = await mapWithConcurrency(stages, 4, async (stage) => {
    try {
      return await getStageDetail(year, stage.stage);
    } catch (err) {
      console.warn(`[${year}] stage ${stage.stage} failed:`, (err as Error).message);
      return null;
    }
  });

  console.log(`[${year}] fetching team rosters...`);
  const teams = await getYearTeams(year).catch((err) => {
    console.warn(`[${year}] teams fetch failed:`, (err as Error).message);
    return [];
  });

  console.log(`[${year}] fetching classification leaders...`);
  const classifications = await getYearClassifications(year).catch((err) => {
    console.warn(`[${year}] classifications fetch failed:`, (err as Error).message);
    return [];
  });

  const tx = db.transaction(() => {
    deleteStages.run(year);
    deleteResults.run(year);
    deleteTeams.run(year);
    deleteRoster.run(year);
    deleteClassifications.run(year);

    stages.forEach((stage, stageOrder) => {
      insertStage.run({
        year,
        stage: stage.stage,
        date: stage.date,
        course: stage.course,
        distanceKm: stage.distanceKm,
        distanceText: stage.distanceText,
        elevationGainM: stage.elevationGainM,
        elevationGainText: stage.elevationGainText,
        typeText: stage.typeText,
        profile: stage.profile,
        winner: stage.winner,
        winnerCountry: stage.winnerCountry,
        resultSubArticle: stage.resultLink?.subArticle ?? null,
        resultAnchor: stage.resultLink?.anchor ?? null,
        stageOrder,
      });

      const detail = details[stageOrder];
      if (!detail) return;

      detail.stageResults.forEach((row, position) => {
        insertResult.run({ year, stage: stage.stage, kind: "stage", position, ...row });
      });
      detail.gcResults.forEach((row, position) => {
        insertResult.run({ year, stage: stage.stage, kind: "gc", position, ...row });
      });
    });

    teams.forEach((team, teamOrder) => {
      insertTeam.run({
        year,
        code: team.code,
        name: team.name,
        wikiTitle: team.wikiTitle,
        teamOrder,
      });
      team.riders.forEach((rider, position) => {
        insertRoster.run({
          year,
          teamCode: team.code,
          position,
          bib: rider.bib,
          name: rider.name,
          country: rider.country,
          finalPosition: rider.position,
        });
      });
    });
    classifications.forEach((leader) => {
      insertClassification.run({
        year,
        jersey: leader.jersey,
        rank: leader.rank,
        rider: leader.rider,
        country: leader.country,
        team: leader.team,
        isFinal: leader.isFinal ? 1 : 0,
        throughStage: leader.throughStage,
      });
    });
  });

  tx();
  console.log(
    `[${year}] done: ${stages.length} stages, ${teams.length} teams, ${classifications.length} classifications`,
  );
}

async function main() {
  const yearArgIdx = process.argv.indexOf("--year");
  const onlyYear = yearArgIdx >= 0 ? Number(process.argv[yearArgIdx + 1]) : null;

  const db = new Database(DB_PATH);
  db.exec(SCHEMA_SQL);

  const years = onlyYear ? [onlyYear] : getAvailableYears();
  for (const year of years) {
    await ingestYear(db, year);
  }

  db.close();
  console.log("\nIngestion complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
