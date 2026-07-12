import { fetchWikipediaPageHtml } from "./client";
import { parseStageTable } from "./parseStages";
import { parseStageResults } from "./parseResults";
import { parseTeamsAndRiders } from "./parseTeams";
import { parseClassificationLeaders } from "./parseClassifications";
import type { ClassificationLeader, StageDetail, StageSummary, TeamEntry } from "./types";

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

export async function getYearClassifications(
  year: number,
): Promise<ClassificationLeader[]> {
  const html = await fetchWikipediaPageHtml(`${year} Tour de France`, year);
  if (!html) return [];
  return parseClassificationLeaders(html);
}

export async function getYearTeams(year: number): Promise<TeamEntry[]> {
  const html = await fetchWikipediaPageHtml(
    `List of teams and cyclists in the ${year} Tour de France`,
    year,
  );
  if (!html) return [];
  return parseTeamsAndRiders(html);
}

export async function getTeamDetail(
  year: number,
  code: string,
): Promise<TeamEntry | null> {
  const teams = await getYearTeams(year);
  return teams.find((t) => t.code === code) ?? null;
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
} from "./types";
