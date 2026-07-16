import { AnimatedSection } from "@/components/AnimatedSection";
import { getYearClassifications, getYearStageHunters } from "@/lib/db";
import { JERSEY_META, JERSEY_ORDER, PODIUM_RANK_STYLE } from "@/lib/jersey";

export async function JerseyHighlights({ year }: { year: number }) {
  const [leaders, hunters] = await Promise.all([
    getYearClassifications(year),
    getYearStageHunters(year),
  ]);
  if (leaders.length === 0) return null;

  const podium = leaders
    .filter((l) => l.jersey === "general")
    .sort((a, b) => a.rank - b.rank);
  const leader = podium[0];
  const isFinal = leader?.isFinal ?? false;

  return (
    <div id="section-jerseys" className="mx-auto max-w-6xl px-6 pb-20">
      {leader && (
        <AnimatedSection className="mb-10 text-center">
          <p className="text-base font-semibold tracking-tight text-accent">
            {isFinal ? "종합 우승" : `현재 종합 선두 · ${leader.throughStage} 스테이지 기준`}
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tighter text-white sm:text-5xl">
            {leader.rider}
          </h2>
          <p className="mt-2 text-lg text-white/50">{leader.team}</p>
        </AnimatedSection>
      )}

      {podium.length > 0 && (
        <AnimatedSection className="mb-4">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-white/40">
            종합 포디움
          </p>
          <div className="grid grid-cols-3 gap-4">
            {podium.map((p) => (
              <div
                key={p.rank}
                className="flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-b from-yellow-400/20 to-yellow-600/5 p-6 text-center"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${PODIUM_RANK_STYLE[p.rank]}`}
                >
                  {p.rank}
                </span>
                <div>
                  <p className="text-lg font-semibold tracking-tight text-white">
                    {p.rider}
                  </p>
                  <p className="mt-1 text-sm text-white/50">{p.team}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      )}

      <AnimatedSection className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {JERSEY_ORDER.map((jersey) => {
          const jerseyLeader = leaders.find((l) => l.jersey === jersey);
          const meta = JERSEY_META[jersey];
          if (!jerseyLeader) return null;

          return (
            <div
              key={jersey}
              className={`overflow-hidden rounded-3xl bg-gradient-to-b p-6 ${meta.gradient}`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                <span className="text-xs font-medium uppercase tracking-wide text-white/60">
                  {meta.officialName}
                </span>
              </div>
              <p className="mt-1 text-xs text-white/40">{meta.label}</p>
              <p className="mt-4 text-lg font-semibold tracking-tight text-white">
                {jerseyLeader.rider}
              </p>
              <p className="mt-1 text-sm text-white/50">{jerseyLeader.team}</p>
            </div>
          );
        })}
      </AnimatedSection>

      {(hunters.riders.length > 0 || hunters.teams.length > 0) && (
        <AnimatedSection className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-gradient-to-b from-sky-500/25 to-sky-900/10 p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-white/60">
              Stage Hunter
            </p>
            <p className="mt-1 text-xs text-white/40">
              스테이지 헌터 · 최다 스테이지 우승 선수
            </p>
            <div className="mt-4 space-y-3">
              {hunters.riders.map((r) => (
                <div key={r.name} className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold tracking-tight text-white">
                      {r.name}
                    </p>
                    <p className="truncate text-sm text-white/50">{r.team}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-accent">
                    {r.wins}승
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-b from-purple-500/25 to-purple-900/10 p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-white/60">
              Stage Hunter Team
            </p>
            <p className="mt-1 text-xs text-white/40">
              스테이지 헌터팀 · 최다 스테이지 우승 팀
            </p>
            <div className="mt-4 space-y-3">
              {hunters.teams.map((t) => (
                <div key={t.team} className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-lg font-semibold tracking-tight text-white">
                    {t.team}
                  </p>
                  <span className="shrink-0 text-sm font-semibold text-accent">
                    {t.wins}승
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}
    </div>
  );
}
