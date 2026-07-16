import type { JerseyKind } from "@/lib/db";

export type RaceSlug = "tour-de-france" | "giro-d-italia" | "vuelta-a-espana";

export interface JerseyStyle {
  officialName: string;
  label: string;
  gradient: string;
  dot: string;
}

export interface RaceMeta {
  slug: RaceSlug;
  name: string;
  /** Used to build Wikipedia article titles: "{year} {wikiName}". */
  wikiName: string;
  firstYear: number;
  jerseys: Record<JerseyKind, JerseyStyle>;
}

export const RACES: Record<RaceSlug, RaceMeta> = {
  "tour-de-france": {
    slug: "tour-de-france",
    name: "Tour de France",
    wikiName: "Tour de France",
    firstYear: 2020,
    jerseys: {
      general: {
        officialName: "Yellow Jersey",
        label: "옐로 저지 · 종합",
        gradient: "from-yellow-400/30 to-yellow-600/10",
        dot: "bg-yellow-400",
      },
      points: {
        officialName: "Green Jersey",
        label: "그린 저지 · 포인트",
        gradient: "from-green-500/30 to-green-700/10",
        dot: "bg-green-500",
      },
      mountains: {
        officialName: "Polka Dot Jersey",
        label: "폴카 도트 저지 · 산악",
        gradient: "from-red-500/25 to-white/10",
        dot: "bg-red-500",
      },
      youth: {
        officialName: "White Jersey",
        label: "화이트 저지 · 영라이더",
        gradient: "from-white/25 to-white/5",
        dot: "bg-white",
      },
    },
  },
  "giro-d-italia": {
    slug: "giro-d-italia",
    name: "Giro d'Italia",
    wikiName: "Giro d'Italia",
    firstYear: 2023,
    jerseys: {
      general: {
        officialName: "Pink Jersey",
        label: "핑크 저지 · 종합 (Maglia Rosa)",
        gradient: "from-pink-400/30 to-pink-700/10",
        dot: "bg-pink-400",
      },
      points: {
        officialName: "Cyclamen Jersey",
        label: "시클라멘 저지 · 포인트 (Maglia Ciclamino)",
        gradient: "from-fuchsia-500/30 to-fuchsia-800/10",
        dot: "bg-fuchsia-500",
      },
      mountains: {
        officialName: "Blue Jersey",
        label: "블루 저지 · 산악 (Maglia Azzurra)",
        gradient: "from-blue-500/30 to-blue-800/10",
        dot: "bg-blue-500",
      },
      youth: {
        officialName: "White Jersey",
        label: "화이트 저지 · 영라이더 (Maglia Bianca)",
        gradient: "from-white/25 to-white/5",
        dot: "bg-white",
      },
    },
  },
  "vuelta-a-espana": {
    slug: "vuelta-a-espana",
    name: "Vuelta a España",
    wikiName: "Vuelta a España",
    firstYear: 2023,
    jerseys: {
      general: {
        officialName: "Red Jersey",
        label: "레드 저지 · 종합 (Maillot Rojo)",
        gradient: "from-red-500/30 to-red-800/10",
        dot: "bg-red-500",
      },
      points: {
        officialName: "Green Jersey",
        label: "그린 저지 · 포인트 (Maillot Verde)",
        gradient: "from-green-500/30 to-green-700/10",
        dot: "bg-green-500",
      },
      mountains: {
        officialName: "Blue Polka Dot Jersey",
        label: "블루 폴카 도트 저지 · 산악",
        gradient: "from-blue-500/25 to-white/10",
        dot: "bg-blue-500",
      },
      youth: {
        officialName: "White Jersey",
        label: "화이트 저지 · 영라이더 (Maillot Blanco)",
        gradient: "from-white/25 to-white/5",
        dot: "bg-white",
      },
    },
  },
};

export const RACE_ORDER: RaceSlug[] = ["tour-de-france", "giro-d-italia", "vuelta-a-espana"];

export function isRaceSlug(value: string): value is RaceSlug {
  return value in RACES;
}
