import type { JerseyKind } from "@/lib/db";

/** The three non-GC jerseys shown as cards; general classification gets its own podium.
 * Per-race jersey colors/names live in `lib/races.ts`. */
export const JERSEY_ORDER: JerseyKind[] = ["points", "mountains", "youth"];

export const PODIUM_RANK_STYLE: Record<number, string> = {
  1: "bg-yellow-400 text-black",
  2: "bg-white/70 text-black",
  3: "bg-amber-700/80 text-white",
};
