import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { AnimatedSection } from "@/components/AnimatedSection";
import { getAvailableYears, getTeamDetail, getYearTeams } from "@/lib/db";
import { RACES, RACE_ORDER, isRaceSlug, type RaceSlug } from "@/lib/races";

export const dynamicParams = false;

export async function generateStaticParams() {
  const params: { race: string; year: string; team: string }[] = [];
  for (const race of RACE_ORDER) {
    for (const year of getAvailableYears(race)) {
      const teams = await getYearTeams(race, year);
      for (const team of teams) {
        params.push({ race, year: String(year), team: team.code });
      }
    }
  }
  return params;
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ race: string; year: string; team: string }>;
}) {
  const { race: raceParam, year: yearParam, team: teamParam } = await params;
  if (!isRaceSlug(raceParam)) notFound();
  const race: RaceSlug = raceParam;
  const year = Number(yearParam);
  const code = decodeURIComponent(teamParam);

  if (!Number.isInteger(year) || !getAvailableYears(race).includes(year)) {
    notFound();
  }

  const team = await getTeamDetail(race, year, code);
  if (!team) notFound();

  const meta = RACES[race];

  return (
    <>
      <Nav
        crumbs={[
          { label: meta.name, href: `/${race}` },
          { label: String(year), href: `/${race}/${year}` },
          { label: team.name },
        ]}
      />
      <main className="flex-1">
        <section className="flex flex-col items-center px-6 py-24 text-center">
          <p className="text-base font-semibold tracking-tight text-accent">
            {team.code}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tighter text-white sm:text-6xl">
            {team.name}
          </h1>
          <p className="mt-4 text-lg font-normal tracking-tight text-white/60">
            출전 선수 {team.riders.length}명
          </p>
        </section>

        <AnimatedSection className="mx-auto max-w-3xl px-6 pb-32">
          <div className="overflow-hidden rounded-3xl bg-surface">
            <div className="border-b border-white/10 px-6 py-5 sm:px-8">
              <h3 className="text-lg font-semibold text-white">출전 선수 명단</h3>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-white/40">
                  <th className="w-14 px-6 py-3 font-medium sm:px-8">No.</th>
                  <th className="px-3 py-3 font-medium">선수</th>
                  <th className="px-6 py-3 text-right font-medium sm:px-8">
                    최종 순위
                  </th>
                </tr>
              </thead>
              <tbody>
                {team.riders.map((rider) => (
                  <tr key={rider.bib} className="border-t border-white/5">
                    <td className="px-6 py-3 font-semibold text-accent sm:px-8">
                      {rider.bib}
                    </td>
                    <td className="px-3 py-3 text-white">
                      {rider.name}
                      {rider.country && (
                        <span className="ml-2 text-xs text-white/40">
                          {rider.country}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-white/80 sm:px-8">
                      {rider.position || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimatedSection>
      </main>
    </>
  );
}
