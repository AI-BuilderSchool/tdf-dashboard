import { fetchWikipediaPageHtml } from "./client";
import { parseStageTable } from "./parseStages";
import { parseStageResults } from "./parseResults";
import type { StageDetail, StageSummary } from "./types";

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

export type { StageDetail, StageSummary, ResultRow, StageProfile } from "./types";
