import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { AnimatedSection } from "@/components/AnimatedSection";
import { StatTile } from "@/components/StatTile";
import { ResultTable } from "@/components/ResultTable";
import { getAvailableYears, getStageDetail, getYearStages } from "@/lib/db";
import { PROFILE_GRADIENT, PROFILE_LABEL } from "@/lib/profile";

export const dynamicParams = false;

export async function generateStaticParams() {
  const params: { year: string; stage: string }[] = [];
  for (const year of getAvailableYears()) {
    const stages = await getYearStages(year);
    for (const stage of stages) {
      params.push({ year: String(year), stage: stage.stage });
    }
  }
  return params;
}

export default async function StagePage({
  params,
}: {
  params: Promise<{ year: string; stage: string }>;
}) {
  const { year: yearParam, stage: stageParam } = await params;
  const year = Number(yearParam);
  const stageId = decodeURIComponent(stageParam);

  if (!Number.isInteger(year) || !getAvailableYears().includes(year)) {
    notFound();
  }

  const detail = await getStageDetail(year, stageId);
  if (!detail) notFound();

  const { summary, stageResults, gcResults } = detail;

  return (
    <>
      <Nav
        crumbs={[
          { label: String(year), href: `/${year}` },
          { label: `Stage ${summary.stage}` },
        ]}
      />
      <main className="flex-1">
        <section
          className={`flex flex-col items-center bg-gradient-to-b px-6 py-24 text-center ${PROFILE_GRADIENT[summary.profile]}`}
        >
          <p className="text-base font-semibold tracking-tight text-accent">
            Stage {summary.stage} · {summary.date}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tighter text-white sm:text-7xl">
            {summary.course}
          </h1>
          <p className="mt-5 text-lg font-normal tracking-tight text-white/70 sm:text-xl">
            {PROFILE_LABEL[summary.profile]}
          </p>
        </section>

        <AnimatedSection className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile
              value={summary.distanceKm != null ? String(summary.distanceKm) : "—"}
              unit="km"
              label="거리"
            />
            <StatTile
              value={
                summary.elevationGainM != null
                  ? summary.elevationGainM.toLocaleString()
                  : "—"
              }
              unit="m"
              label="누적 고도"
            />
            <StatTile value={PROFILE_LABEL[summary.profile]} label="코스 유형" />
            <StatTile value={summary.winner ?? "—"} label="스테이지 우승" />
          </div>
        </AnimatedSection>

        <AnimatedSection className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 pb-32 lg:grid-cols-2">
          <ResultTable
            title="스테이지 순위 (Top 10)"
            rows={stageResults}
            emptyLabel="스테이지 결과 데이터를 찾을 수 없습니다."
          />
          <ResultTable
            title="종합 순위 (Top 10)"
            rows={gcResults}
            emptyLabel="종합 순위 데이터를 찾을 수 없습니다."
          />
        </AnimatedSection>
      </main>
    </>
  );
}
