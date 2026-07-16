export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS stages (
  race TEXT NOT NULL,
  year INTEGER NOT NULL,
  stage TEXT NOT NULL,
  date TEXT,
  course TEXT,
  distance_km REAL,
  distance_text TEXT,
  elevation_gain_m REAL,
  elevation_gain_text TEXT,
  type_text TEXT,
  profile TEXT NOT NULL,
  winner TEXT,
  winner_country TEXT,
  result_sub_article TEXT,
  result_anchor TEXT,
  stage_order INTEGER NOT NULL,
  PRIMARY KEY (race, year, stage)
);

CREATE TABLE IF NOT EXISTS stage_results (
  race TEXT NOT NULL,
  year INTEGER NOT NULL,
  stage TEXT NOT NULL,
  kind TEXT NOT NULL,
  position INTEGER NOT NULL,
  rank TEXT,
  rider TEXT,
  country TEXT,
  team TEXT,
  time TEXT
);
CREATE INDEX IF NOT EXISTS idx_stage_results ON stage_results(race, year, stage, kind);

CREATE TABLE IF NOT EXISTS teams (
  race TEXT NOT NULL,
  year INTEGER NOT NULL,
  code TEXT NOT NULL,
  name TEXT,
  wiki_title TEXT,
  team_order INTEGER NOT NULL,
  PRIMARY KEY (race, year, code)
);

CREATE TABLE IF NOT EXISTS roster (
  race TEXT NOT NULL,
  year INTEGER NOT NULL,
  team_code TEXT NOT NULL,
  position INTEGER NOT NULL,
  bib TEXT,
  name TEXT,
  country TEXT,
  final_position TEXT
);
CREATE INDEX IF NOT EXISTS idx_roster ON roster(race, year, team_code);

CREATE TABLE IF NOT EXISTS classifications (
  race TEXT NOT NULL,
  year INTEGER NOT NULL,
  jersey TEXT NOT NULL,
  rank INTEGER NOT NULL,
  rider TEXT,
  country TEXT,
  team TEXT,
  is_final INTEGER NOT NULL,
  through_stage TEXT,
  PRIMARY KEY (race, year, jersey, rank)
);
`;
