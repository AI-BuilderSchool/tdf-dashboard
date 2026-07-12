import { getDb } from "./client";
import type {
  ResultRow,
  RosterRider,
  StageDetail,
  StageProfile,
  StageSummary,
  TeamWithLogo,
} from "../wikipedia/types";

export function getAvailableYears(): number[] {
  const rows = getDb()
    .prepare("SELECT DISTINCT year FROM stages ORDER BY year DESC")
    .all() as { year: number }[];
  return rows.map((r) => r.year);
}

interface StageRow {
  stage: string;
  date: string | null;
  course: string | null;
  distance_km: number | null;
  distance_text: string | null;
  elevation_gain_m: number | null;
  elevation_gain_text: string | null;
  type_text: string | null;
  profile: string;
  winner: string | null;
  winner_country: string | null;
  result_sub_article: string | null;
  result_anchor: string | null;
}

function rowToStageSummary(row: StageRow): StageSummary {
  return {
    stage: row.stage,
    date: row.date ?? "",
    course: row.course ?? "",
    distanceText: row.distance_text,
    distanceKm: row.distance_km,
    elevationGainText: row.elevation_gain_text,
    elevationGainM: row.elevation_gain_m,
    typeText: row.type_text ?? "Unknown",
    profile: row.profile as StageProfile,
    winner: row.winner,
    winnerCountry: row.winner_country,
    resultLink:
      row.result_sub_article && row.result_anchor
        ? { subArticle: row.result_sub_article, anchor: row.result_anchor }
        : null,
  };
}

export async function getYearStages(year: number): Promise<StageSummary[]> {
  const rows = getDb()
    .prepare("SELECT * FROM stages WHERE year = ? ORDER BY stage_order")
    .all(year) as StageRow[];
  return rows.map(rowToStageSummary);
}

interface ResultRowRaw {
  rank: string | null;
  rider: string | null;
  country: string | null;
  team: string | null;
  time: string | null;
}

function rowToResultRow(row: ResultRowRaw): ResultRow {
  return {
    rank: row.rank ?? "",
    rider: row.rider ?? "",
    country: row.country,
    team: row.team ?? "",
    time: row.time ?? "",
  };
}

export async function getStageDetail(
  year: number,
  stageId: string,
): Promise<StageDetail | null> {
  const db = getDb();
  const stageRow = db
    .prepare("SELECT * FROM stages WHERE year = ? AND stage = ?")
    .get(year, stageId) as StageRow | undefined;
  if (!stageRow) return null;

  const stageResults = db
    .prepare(
      "SELECT rank, rider, country, team, time FROM stage_results WHERE year = ? AND stage = ? AND kind = 'stage' ORDER BY position",
    )
    .all(year, stageId) as ResultRowRaw[];
  const gcResults = db
    .prepare(
      "SELECT rank, rider, country, team, time FROM stage_results WHERE year = ? AND stage = ? AND kind = 'gc' ORDER BY position",
    )
    .all(year, stageId) as ResultRowRaw[];

  return {
    summary: rowToStageSummary(stageRow),
    stageResults: stageResults.map(rowToResultRow),
    gcResults: gcResults.map(rowToResultRow),
  };
}

interface TeamRow {
  code: string;
  name: string | null;
  wiki_title: string | null;
  logo_url: string | null;
}

interface RosterRow {
  bib: string | null;
  name: string | null;
  country: string | null;
  final_position: string | null;
}

function getRoster(
  db: ReturnType<typeof getDb>,
  year: number,
  code: string,
): RosterRider[] {
  const rows = db
    .prepare(
      "SELECT bib, name, country, final_position FROM roster WHERE year = ? AND team_code = ? ORDER BY position",
    )
    .all(year, code) as RosterRow[];
  return rows.map((r) => ({
    bib: r.bib ?? "",
    name: r.name ?? "",
    country: r.country,
    position: r.final_position ?? "",
  }));
}

export async function getYearTeamsWithLogos(year: number): Promise<TeamWithLogo[]> {
  const db = getDb();
  const teamRows = db
    .prepare("SELECT * FROM teams WHERE year = ? ORDER BY team_order")
    .all(year) as TeamRow[];

  return teamRows.map((row) => ({
    code: row.code,
    name: row.name ?? row.code,
    wikiTitle: row.wiki_title ?? "",
    logoUrl: row.logo_url,
    riders: getRoster(db, year, row.code),
  }));
}

export async function getTeamDetail(
  year: number,
  code: string,
): Promise<TeamWithLogo | null> {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM teams WHERE year = ? AND code = ?")
    .get(year, code) as TeamRow | undefined;
  if (!row) return null;

  return {
    code: row.code,
    name: row.name ?? row.code,
    wikiTitle: row.wiki_title ?? "",
    logoUrl: row.logo_url,
    riders: getRoster(db, year, row.code),
  };
}

export type {
  StageDetail,
  StageSummary,
  ResultRow,
  StageProfile,
  RosterRider,
  TeamEntry,
  TeamWithLogo,
} from "../wikipedia/types";
