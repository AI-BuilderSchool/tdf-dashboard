import { AnimatedSection } from "@/components/AnimatedSection";
import { TeamCard } from "@/components/TeamCard";
import { getYearTeamsWithLogos } from "@/lib/db";

export async function TeamsSection({ year }: { year: number }) {
  const teams = await getYearTeamsWithLogos(year);
  if (teams.length === 0) return null;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20">
      <AnimatedSection className="mb-8 text-center">
        <p className="text-base font-semibold tracking-tight text-accent">Teams</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tighter text-white sm:text-4xl">
          참가 팀
        </h2>
        <p className="mt-3 text-white/50">총 {teams.length}개 팀 참가</p>
      </AnimatedSection>
      <AnimatedSection className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {teams.map((team) => (
          <TeamCard key={team.code} year={year} team={team} />
        ))}
      </AnimatedSection>
    </div>
  );
}
