import type { JerseyKind } from "@/lib/db";

export const JERSEY_META: Record<
  JerseyKind,
  { officialName: string; label: string; gradient: string; dot: string }
> = {
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
};

export const JERSEY_ORDER: JerseyKind[] = ["general", "points", "mountains", "youth"];
