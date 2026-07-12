import type { StageProfile } from "@/lib/db";

const WIDTH = 600;
const HEIGHT = 160;
const BASELINE = 140;

/**
 * We don't have real elevation-by-distance data (Wikipedia only gives a single
 * total elevation-gain figure, and only for some years/stages) — so these are
 * fixed, illustrative shapes keyed off the stage's profile classification only,
 * never a claim about the actual route.
 */
const PROFILE_SHAPE: Record<StageProfile, number[]> = {
  flat: [0.25, 0.4, 0.3, 0.45, 0.3, 0.4, 0.25, 0.35, 0.28],
  hilly: [0.2, 0.55, 0.3, 0.7, 0.35, 0.6, 0.3, 0.5, 0.25],
  mountain: [0.15, 0.4, 0.25, 0.75, 0.35, 0.55, 0.3, 0.85, 0.2],
  "mountain-summit": [0.1, 0.2, 0.3, 0.25, 0.45, 0.4, 0.6, 0.8, 1],
  itt: [0.3, 0.38, 0.32, 0.42, 0.3, 0.38, 0.32, 0.4, 0.3],
  ttt: [0.3, 0.38, 0.32, 0.42, 0.3, 0.38, 0.32, 0.4, 0.3],
  unknown: [0.25, 0.4, 0.3, 0.45, 0.3, 0.4, 0.25, 0.35, 0.28],
};

const PROFILE_AMPLITUDE: Record<StageProfile, number> = {
  flat: 20,
  hilly: 50,
  mountain: 85,
  "mountain-summit": 100,
  itt: 12,
  ttt: 12,
  unknown: 20,
};

export const PROFILE_CHART_COLOR: Record<StageProfile, string> = {
  flat: "#10b981",
  hilly: "#f59e0b",
  mountain: "#ef4444",
  "mountain-summit": "#f43f5e",
  itt: "#3b82f6",
  ttt: "#0ea5e9",
  unknown: "#9ca3af",
};

function smoothPath(points: [number, number][]): string {
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    d += ` Q ${x0} ${y0}, ${mx} ${my}`;
  }
  const [lastX, lastY] = points[points.length - 1];
  d += ` L ${lastX} ${lastY}`;
  return d;
}

export function buildProfileChart(profile: StageProfile) {
  const shape = PROFILE_SHAPE[profile];
  const amplitude = PROFILE_AMPLITUDE[profile];
  const step = WIDTH / (shape.length - 1);

  const points: [number, number][] = shape.map((v, i) => [
    i * step,
    BASELINE - v * amplitude,
  ]);

  const linePath = smoothPath(points);
  const areaPath = `${linePath} L ${WIDTH} ${BASELINE} L 0 ${BASELINE} Z`;

  return { linePath, areaPath, width: WIDTH, height: HEIGHT, baseline: BASELINE };
}
