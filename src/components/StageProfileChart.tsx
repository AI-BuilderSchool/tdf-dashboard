import type { StageProfile } from "@/lib/db";
import { PROFILE_LABEL } from "@/lib/profile";
import { PROFILE_CHART_COLOR, buildProfileChart } from "@/lib/profileChart";

export function StageProfileChart({
  profile,
  startCity,
  finishCity,
}: {
  profile: StageProfile;
  startCity: string;
  finishCity: string;
}) {
  const { linePath, areaPath, width, height } = buildProfileChart(profile);
  const color = PROFILE_CHART_COLOR[profile];
  const gradientId = `profile-fill-${profile}`;

  return (
    <div className="rounded-3xl bg-surface p-6 sm:p-8">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${PROFILE_LABEL[profile]} 코스 개략도`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-2 flex items-center justify-between text-xs text-white/40">
        <span>{startCity}</span>
        <span>{finishCity}</span>
      </div>
      <p className="mt-4 text-center text-xs text-white/30">
        코스 개략도 · {PROFILE_LABEL[profile]} 분류 기반 (실측 고도 데이터 아님)
      </p>
    </div>
  );
}
