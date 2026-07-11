import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { AnimatedSection } from "@/components/AnimatedSection";
import { TeamsSection } from "@/components/TeamsSection";
import { getAvailableYears, getYearStages } from "@/lib/wikipedia";
import { PROFILE_GRADIENT, PROFILE_LABEL } from "@/lib/profile";

export async function generateStaticParams() {
  return getAvailableYears().map((year) => ({ year: String(year) }));
}

export default async function YearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: yearParam } = await params;
  const year = Number(yearParam);
  if (!Number.isInteger(year) || !getAvailableYears().includes(year)) {
    notFound();
  }

  const stages = await getYearStages(year);

  return (
    <>
      <Nav crumbs={[{ label: String(year) }]} />
      <main className="flex-1">
        <section className="flex flex-col items-center px-6 py-28 text-center">
          <p className="text-base font-semibold tracking-tight text-accent">
            {year}
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tighter text-white sm:text-7xl">
            {year} Tour de France
          </h1>
          <p className="mt-5 text-lg font-normal tracking-tight text-white/60 sm:text-xl">
            {stages.length > 0
              ? `총 ${stages.length}개 스테이지`
              : "스테이지 데이터를 불러올 수 없습니다."}
          </p>
        </section>

        <TeamsSection year={year} />

        <div className="mx-auto max-w-4xl px-6 pb-32">
          <div className="flex flex-col gap-4">
            {stages.map((stage, i) => (
              <AnimatedSection key={stage.stage} delay={Math.min(i * 0.03, 0.3)}>
                <Link
                  href={`/${year}/${encodeURIComponent(stage.stage)}`}
                  className="group flex items-center gap-6 overflow-hidden rounded-3xl bg-surface p-6 transition duration-300 hover:bg-surface-2 sm:p-8"
                >
                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-semibold text-white sm:h-20 sm:w-20 sm:text-2xl ${PROFILE_GRADIENT[stage.profile]}`}
                  >
                    {stage.stage}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-lg font-semibold tracking-tight text-white sm:text-xl">
                      {stage.course}
                    </p>
                    <p className="mt-1 text-sm text-white/50">
                      {stage.date} · {PROFILE_LABEL[stage.profile]}
                      {stage.distanceKm != null ? ` · ${stage.distanceKm} km` : ""}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-xs uppercase tracking-wide text-white/40">
                      Winner
                    </p>
                    <p className="text-sm font-medium text-white">
                      {stage.winner ?? "—"}
                    </p>
                  </div>
                  <span className="shrink-0 text-white/30 transition group-hover:translate-x-1 group-hover:text-accent">
                    →
                  </span>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
