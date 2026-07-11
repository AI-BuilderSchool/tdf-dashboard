import type { StageProfile } from "@/lib/wikipedia";

export const PROFILE_LABEL: Record<StageProfile, string> = {
  flat: "평지",
  hilly: "구릉",
  mountain: "산악",
  "mountain-summit": "산악 (정상 피니시)",
  itt: "개인 타임트라이얼",
  ttt: "팀 타임트라이얼",
  unknown: "코스",
};

export const PROFILE_GRADIENT: Record<StageProfile, string> = {
  flat: "from-emerald-500/30 to-emerald-900/10",
  hilly: "from-amber-500/30 to-amber-900/10",
  mountain: "from-red-500/30 to-red-900/10",
  "mountain-summit": "from-red-500/40 to-fuchsia-900/10",
  itt: "from-blue-500/30 to-blue-900/10",
  ttt: "from-sky-500/30 to-sky-900/10",
  unknown: "from-white/20 to-white/5",
};
