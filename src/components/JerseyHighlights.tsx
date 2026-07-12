import { AnimatedSection } from "@/components/AnimatedSection";
import { getYearClassifications } from "@/lib/db";
import { JERSEY_META, JERSEY_ORDER } from "@/lib/jersey";

export async function JerseyHighlights({ year }: { year: number }) {
  const leaders = await getYearClassifications(year);
  if (leaders.length === 0) return null;

  const general = leaders.find((l) => l.jersey === "general");
  const isFinal = general?.isFinal ?? false;

  return (
    <div id="section-jerseys" className="mx-auto max-w-6xl px-6 pb-20">
      {general && (
        <AnimatedSection className="mb-10 text-center">
          <p className="text-base font-semibold tracking-tight text-accent">
            {isFinal ? "종합 우승" : `현재 종합 선두 · ${general.throughStage} 스테이지 기준`}
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tighter text-white sm:text-5xl">
            {general.rider}
          </h2>
          <p className="mt-2 text-lg text-white/50">{general.team}</p>
        </AnimatedSection>
      )}

      <AnimatedSection className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {JERSEY_ORDER.map((jersey) => {
          const leader = leaders.find((l) => l.jersey === jersey);
          const meta = JERSEY_META[jersey];
          if (!leader) return null;

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
                {leader.rider}
              </p>
              <p className="mt-1 text-sm text-white/50">{leader.team}</p>
            </div>
          );
        })}
      </AnimatedSection>
    </div>
  );
}
