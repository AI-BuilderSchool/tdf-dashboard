import { fetchWikipediaEvergreenPage, fetchWikipediaPageHtml } from "./client";
import { parseStageTable } from "./parseStages";
import { parseStageResults } from "./parseResults";
import { parseTeamsAndRiders } from "./parseTeams";
import { parseInfoboxLogo } from "./parseTeamLogo";
import type { StageDetail, StageSummary, TeamEntry, TeamWithLogo } from "./types";

export const FIRST_YEAR = 2020;

export function getAvailableYears(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear; y >= FIRST_YEAR; y--) years.push(y);
  return years;
}

export async function getYearStages(year: number): Promise<StageSummary[]> {
  const html = await fetchWikipediaPageHtml(`${year} Tour de France`, year);
  if (!html) return [];
  return parseStageTable(html);
}

export async function getStageDetail(
  year: number,
  stageId: string,
): Promise<StageDetail | null> {
  const stages = await getYearStages(year);
  const summary = stages.find((s) => s.stage === stageId);
  if (!summary) return null;

  if (!summary.resultLink) {
    return { summary, stageResults: [], gcResults: [] };
  }

  const isLastStage = stages[stages.length - 1]?.stage === stageId;
  const subArticleHtml = await fetchWikipediaPageHtml(
    summary.resultLink.subArticle.replace(/_/g, " "),
    year,
  );
  if (!subArticleHtml) {
    return { summary, stageResults: [], gcResults: [] };
  }

  const { stageResults, gcResults } = parseStageResults(
    subArticleHtml,
    stageId,
    isLastStage,
  );
  return { summary, stageResults, gcResults };
}

export async function getYearTeams(year: number): Promise<TeamEntry[]> {
  const html = await fetchWikipediaPageHtml(
    `List of teams and cyclists in the ${year} Tour de France`,
    year,
  );
  if (!html) return [];
  return parseTeamsAndRiders(html);
}

export async function getTeamLogo(wikiTitle: string): Promise<string | null> {
  const html = await fetchWikipediaEvergreenPage(wikiTitle);
  if (!html) return null;
  return parseInfoboxLogo(html);
}

/** Caps in-flight requests per roster so we don't open dozens of sockets at once. */
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

export async function getYearTeamsWithLogos(year: number): Promise<TeamWithLogo[]> {
  const teams = await getYearTeams(year);
  return mapWithConcurrency(teams, 8, async (team) => ({
    ...team,
    logoUrl: await getTeamLogo(team.wikiTitle),
  }));
}

export async function getTeamDetail(
  year: number,
  code: string,
): Promise<TeamWithLogo | null> {
  const teams = await getYearTeams(year);
  const team = teams.find((t) => t.code === code);
  if (!team) return null;
  return { ...team, logoUrl: await getTeamLogo(team.wikiTitle) };
}

export type {
  StageDetail,
  StageSummary,
  ResultRow,
  StageProfile,
  RosterRider,
  TeamEntry,
  TeamWithLogo,
} from "./types";
