/**
 * One-off / periodic data refresh: scrapes Wikipedia via the same parsing
 * logic the app used to call live, and writes the result into data/tdf.db.
 *
 *   npm run ingest                                    # every race, every year
 *   npm run ingest -- --race tour-de-france            # one race, every year
 *   npm run ingest -- --race tour-de-france --year 2026 # one race + year (use for the in-progress Tour)
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
import { RACE_ORDER, type RaceSlug } from "../src/lib/races";

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

async function ingestRaceYear(db: Database.Database, race: RaceSlug, year: number) {
  const tag = `${race} ${year}`;
  console.log(`\n[${tag}] fetching stage list...`);
  const stages = await getYearStages(race, year);
  if (stages.length === 0) {
    console.warn(`[${tag}] no stages found, skipping`);
    return;
  }
  console.log(`[${tag}] ${stages.length} stages`);

  const deleteStages = db.prepare("DELETE FROM stages WHERE race = ? AND year = ?");
  const deleteResults = db.prepare(
    "DELETE FROM stage_results WHERE race = ? AND year = ?",
  );
  const deleteTeams = db.prepare("DELETE FROM teams WHERE race = ? AND year = ?");
  const deleteRoster = db.prepare("DELETE FROM roster WHERE race = ? AND year = ?");
  const deleteClassifications = db.prepare(
    "DELETE FROM classifications WHERE race = ? AND year = ?",
  );

  const insertStage = db.prepare(`
    INSERT INTO stages (race, year, stage, date, course, distance_km, distance_text,
      elevation_gain_m, elevation_gain_text, type_text, profile, winner,
      winner_country, result_sub_article, result_anchor, stage_order)
    VALUES (@race, @year, @stage, @date, @course, @distanceKm, @distanceText,
      @elevationGainM, @elevationGainText, @typeText, @profile, @winner,
      @winnerCountry, @resultSubArticle, @resultAnchor, @stageOrder)
  `);

  const insertResult = db.prepare(`
    INSERT INTO stage_results (race, year, stage, kind, position, rank, rider, country, team, time)
    VALUES (@race, @year, @stage, @kind, @position, @rank, @rider, @country, @team, @time)
  `);

  const insertTeam = db.prepare(`
    INSERT INTO teams (race, year, code, name, wiki_title, team_order)
    VALUES (@race, @year, @code, @name, @wikiTitle, @teamOrder)
  `);

  const insertRoster = db.prepare(`
    INSERT INTO roster (race, year, team_code, position, bib, name, country, final_position)
    VALUES (@race, @year, @teamCode, @position, @bib, @name, @country, @finalPosition)
  `);

  const insertClassification = db.prepare(`
    INSERT INTO classifications (race, year, jersey, rank, rider, country, team, is_final, through_stage)
    VALUES (@race, @year, @jersey, @rank, @rider, @country, @team, @isFinal, @throughStage)
  `);

  const details = await mapWithConcurrency(stages, 4, async (stage) => {
    try {
      return await getStageDetail(race, year, stage.stage);
    } catch (err) {
      console.warn(`[${tag}] stage ${stage.stage} failed:`, (err as Error).message);
      return null;
    }
  });

  console.log(`[${tag}] fetching team rosters...`);
  const teams = await getYearTeams(race, year).catch((err) => {
    console.warn(`[${tag}] teams fetch failed:`, (err as Error).message);
    return [];
  });

  console.log(`[${tag}] fetching classification leaders...`);
  const classifications = await getYearClassifications(race, year).catch((err) => {
    console.warn(`[${tag}] classifications fetch failed:`, (err as Error).message);
    return [];
  });

  const tx = db.transaction(() => {
    deleteStages.run(race, year);
    deleteResults.run(race, year);
    deleteTeams.run(race, year);
    deleteRoster.run(race, year);
    deleteClassifications.run(race, year);

    stages.forEach((stage, stageOrder) => {
      insertStage.run({
        race,
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
        insertResult.run({
          race,
          year,
          stage: stage.stage,
          kind: "stage",
          position,
          ...row,
        });
      });
      detail.gcResults.forEach((row, position) => {
        insertResult.run({
          race,
          year,
          stage: stage.stage,
          kind: "gc",
          position,
          ...row,
        });
      });
    });

    teams.forEach((team, teamOrder) => {
      insertTeam.run({
        race,
        year,
        code: team.code,
        name: team.name,
        wikiTitle: team.wikiTitle,
        teamOrder,
      });
      team.riders.forEach((rider, position) => {
        insertRoster.run({
          race,
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
        race,
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
    `[${tag}] done: ${stages.length} stages, ${teams.length} teams, ${classifications.length} classifications`,
  );
}

async function main() {
  const raceArgIdx = process.argv.indexOf("--race");
  const onlyRace = raceArgIdx >= 0 ? (process.argv[raceArgIdx + 1] as RaceSlug) : null;
  const yearArgIdx = process.argv.indexOf("--year");
  const onlyYear = yearArgIdx >= 0 ? Number(process.argv[yearArgIdx + 1]) : null;

  const db = new Database(DB_PATH);
  db.exec(SCHEMA_SQL);

  const races = onlyRace ? [onlyRace] : RACE_ORDER;
  for (const race of races) {
    const years = onlyYear ? [onlyYear] : getAvailableYears(race);
    for (const year of years) {
      await ingestRaceYear(db, race, year);
    }
  }

  db.close();
  console.log("\nIngestion complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
