import { getDb } from "./client";
import type { RaceSlug } from "@/lib/races";
import type {
  ClassificationLeader,
  JerseyKind,
  ResultRow,
  RosterRider,
  StageDetail,
  StageProfile,
  StageSummary,
  TeamEntry,
} from "../wikipedia/types";

export function getAvailableYears(race: RaceSlug): number[] {
  const rows = getDb()
    .prepare("SELECT DISTINCT year FROM stages WHERE race = ? ORDER BY year DESC")
    .all(race) as { year: number }[];
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

export async function getYearStages(
  race: RaceSlug,
  year: number,
): Promise<StageSummary[]> {
  const rows = getDb()
    .prepare("SELECT * FROM stages WHERE race = ? AND year = ? ORDER BY stage_order")
    .all(race, year) as StageRow[];
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
  race: RaceSlug,
  year: number,
  stageId: string,
): Promise<StageDetail | null> {
  const db = getDb();
  const stageRow = db
    .prepare("SELECT * FROM stages WHERE race = ? AND year = ? AND stage = ?")
    .get(race, year, stageId) as StageRow | undefined;
  if (!stageRow) return null;

  const stageResults = db
    .prepare(
      "SELECT rank, rider, country, team, time FROM stage_results WHERE race = ? AND year = ? AND stage = ? AND kind = 'stage' ORDER BY position",
    )
    .all(race, year, stageId) as ResultRowRaw[];
  const gcResults = db
    .prepare(
      "SELECT rank, rider, country, team, time FROM stage_results WHERE race = ? AND year = ? AND stage = ? AND kind = 'gc' ORDER BY position",
    )
    .all(race, year, stageId) as ResultRowRaw[];

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
}

interface RosterRow {
  bib: string | null;
  name: string | null;
  country: string | null;
  final_position: string | null;
}

function getRoster(
  db: ReturnType<typeof getDb>,
  race: RaceSlug,
  year: number,
  code: string,
): RosterRider[] {
  const rows = db
    .prepare(
      "SELECT bib, name, country, final_position FROM roster WHERE race = ? AND year = ? AND team_code = ? ORDER BY position",
    )
    .all(race, year, code) as RosterRow[];
  return rows.map((r) => ({
    bib: r.bib ?? "",
    name: r.name ?? "",
    country: r.country,
    position: r.final_position ?? "",
  }));
}

export async function getYearTeams(
  race: RaceSlug,
  year: number,
): Promise<TeamEntry[]> {
  const db = getDb();
  const teamRows = db
    .prepare("SELECT * FROM teams WHERE race = ? AND year = ? ORDER BY team_order")
    .all(race, year) as TeamRow[];

  return teamRows.map((row) => ({
    code: row.code,
    name: row.name ?? row.code,
    wikiTitle: row.wiki_title ?? "",
    riders: getRoster(db, race, year, row.code),
  }));
}

export async function getTeamDetail(
  race: RaceSlug,
  year: number,
  code: string,
): Promise<TeamEntry | null> {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM teams WHERE race = ? AND year = ? AND code = ?")
    .get(race, year, code) as TeamRow | undefined;
  if (!row) return null;

  return {
    code: row.code,
    name: row.name ?? row.code,
    wikiTitle: row.wiki_title ?? "",
    riders: getRoster(db, race, year, row.code),
  };
}

interface ClassificationRow {
  jersey: JerseyKind;
  rank: number;
  rider: string | null;
  country: string | null;
  team: string | null;
  is_final: number;
  through_stage: string | null;
}

export async function getYearClassifications(
  race: RaceSlug,
  year: number,
): Promise<ClassificationLeader[]> {
  const rows = getDb()
    .prepare(
      "SELECT * FROM classifications WHERE race = ? AND year = ? ORDER BY jersey, rank",
    )
    .all(race, year) as ClassificationRow[];

  return rows
    .filter((r) => r.rider)
    .map((r) => ({
      jersey: r.jersey,
      rank: r.rank,
      rider: r.rider!,
      country: r.country,
      team: r.team ?? "",
      isFinal: r.is_final === 1,
      throughStage: r.through_stage,
    }));
}

export interface StageWinnerRider {
  name: string;
  team: string;
  wins: number;
}

export interface StageWinnerTeam {
  team: string;
  wins: number;
}

export interface StageHunters {
  riders: StageWinnerRider[];
  teams: StageWinnerTeam[];
}

interface StageWinRow {
  rider: string | null;
  team: string | null;
  profile: string;
}

export async function getYearStageHunters(
  race: RaceSlug,
  year: number,
): Promise<StageHunters> {
  const rows = getDb()
    .prepare(
      `SELECT sr.rider, sr.team, s.profile
       FROM stage_results sr
       JOIN stages s ON s.race = sr.race AND s.year = sr.year AND s.stage = sr.stage
       WHERE sr.race = ? AND sr.year = ? AND sr.kind = 'stage' AND sr.position = 0`,
    )
    .all(race, year) as StageWinRow[];

  const riderWins = new Map<string, { team: string; wins: number }>();
  const teamWins = new Map<string, number>();

  for (const row of rows) {
    // Team time trial results store the winning team's name in `rider`
    // (there's no individual winner), so count it as a team win only.
    const isTeamStage = row.profile === "ttt";
    const teamName = isTeamStage ? row.rider : row.team;
    if (teamName) {
      teamWins.set(teamName, (teamWins.get(teamName) ?? 0) + 1);
    }
    if (!isTeamStage && row.rider) {
      const existing = riderWins.get(row.rider);
      riderWins.set(row.rider, {
        team: row.team ?? "",
        wins: (existing?.wins ?? 0) + 1,
      });
    }
  }

  const maxRiderWins = Math.max(0, ...[...riderWins.values()].map((r) => r.wins));
  const maxTeamWins = Math.max(0, ...teamWins.values());

  const riders = [...riderWins.entries()]
    .filter(([, v]) => v.wins === maxRiderWins && maxRiderWins > 0)
    .map(([name, v]) => ({ name, team: v.team, wins: v.wins }));

  const teams = [...teamWins.entries()]
    .filter(([, wins]) => wins === maxTeamWins && maxTeamWins > 0)
    .map(([team, wins]) => ({ team, wins }));

  return { riders, teams };
}

export type {
  StageDetail,
  StageSummary,
  ResultRow,
  StageProfile,
  RosterRider,
  TeamEntry,
  ClassificationLeader,
  JerseyKind,
} from "../wikipedia/types";
export type { RaceSlug, RaceMeta, JerseyStyle } from "@/lib/races";
