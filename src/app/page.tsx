import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";
import { RACES, RACE_ORDER } from "@/lib/races";

const RACE_TAGLINE: Record<string, string> = {
  "tour-de-france": "France · 2020–",
  "giro-d-italia": "Italy · 2023–",
  "vuelta-a-espana": "Spain · 2023–",
};

export default function Home() {
  return (
    <main className="flex-1">
      <section className="flex min-h-[75vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-base font-semibold tracking-tight text-accent">
          Grand Tours
        </p>
        <h1 className="mt-4 max-w-5xl text-6xl font-semibold tracking-tighter text-white sm:text-8xl">
          사이클 대시보드
        </h1>
        <p className="mt-6 max-w-xl text-xl font-normal tracking-tight text-white/60 sm:text-2xl">
          대회를 선택해 연도별 스테이지, 코스 정보, 순위를 확인하세요.
        </p>
      </section>

      <AnimatedSection className="mx-auto max-w-6xl px-6 pb-32">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {RACE_ORDER.map((race) => {
            const meta = RACES[race];
            return (
              <Link
                key={race}
                href={`/${race}`}
                className={`group relative overflow-hidden rounded-3xl bg-gradient-to-b p-8 transition duration-300 hover:bg-surface-2 ${meta.jerseys.general.gradient}`}
              >
                <div className="relative flex h-56 flex-col justify-between">
                  <span className="text-xs uppercase tracking-wide text-white/50">
                    {RACE_TAGLINE[race]}
                  </span>
                  <div>
                    <h2 className="text-3xl font-semibold tracking-tighter text-white transition group-hover:text-accent">
                      {meta.name}
                    </h2>
                    <p className="mt-2 text-sm text-white/50">
                      {meta.jerseys.general.officialName}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </AnimatedSection>
    </main>
  );
}
