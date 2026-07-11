import Image from "next/image";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { AnimatedSection } from "@/components/AnimatedSection";
import { getAvailableYears, getTeamDetail } from "@/lib/wikipedia";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ year: string; team: string }>;
}) {
  const { year: yearParam, team: teamParam } = await params;
  const year = Number(yearParam);
  const code = decodeURIComponent(teamParam);

  if (!Number.isInteger(year) || !getAvailableYears().includes(year)) {
    notFound();
  }

  const team = await getTeamDetail(year, code);
  if (!team) notFound();

  return (
    <>
      <Nav
        crumbs={[
          { label: String(year), href: `/${year}` },
          { label: team.name },
        ]}
      />
      <main className="flex-1">
        <section className="flex flex-col items-center px-6 py-24 text-center">
          <div className="relative h-28 w-48 overflow-hidden rounded-3xl bg-white/95 p-4">
            {team.logoUrl ? (
              <Image
                src={team.logoUrl}
                alt={team.name}
                fill
                className="object-contain p-2"
                unoptimized
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm text-black/40">
                {team.code}
              </span>
            )}
          </div>
          <h1 className="mt-8 max-w-3xl text-4xl font-semibold tracking-tighter text-white sm:text-6xl">
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
