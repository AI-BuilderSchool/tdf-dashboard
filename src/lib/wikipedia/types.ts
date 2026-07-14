export type StageProfile =
  | "flat"
  | "hilly"
  | "mountain"
  | "mountain-summit"
  | "itt"
  | "ttt"
  | "unknown";

export interface StageResultLink {
  subArticle: string;
  anchor: string;
}

export interface StageSummary {
  stage: string;
  date: string;
  course: string;
  distanceText: string | null;
  distanceKm: number | null;
  elevationGainText: string | null;
  elevationGainM: number | null;
  typeText: string;
  profile: StageProfile;
  winner: string | null;
  winnerCountry: string | null;
  resultLink: StageResultLink | null;
}

export interface ResultRow {
  rank: string;
  rider: string;
  country: string | null;
  team: string;
  time: string;
}

export interface StageDetail {
  summary: StageSummary;
  stageResults: ResultRow[];
  gcResults: ResultRow[];
}

export interface YearOverview {
  year: number;
  stages: StageSummary[];
}

export interface RosterRider {
  bib: string;
  name: string;
  country: string | null;
  position: string;
}

export interface TeamEntry {
  code: string;
  name: string;
  wikiTitle: string;
  riders: RosterRider[];
}

export type JerseyKind = "general" | "points" | "mountains" | "youth";

export interface ClassificationLeader {
  jersey: JerseyKind;
  rank: number;
  rider: string;
  country: string | null;
  team: string;
  isFinal: boolean;
  throughStage: string | null;
}
