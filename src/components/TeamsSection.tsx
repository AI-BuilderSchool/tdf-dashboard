"use client";

import { useEffect, useState } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { TeamCard } from "@/components/TeamCard";
import type { TeamWithLogo } from "@/lib/wikipedia";

export function TeamsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-20">
      <div className="mb-8 text-center">
        <p className="text-base font-semibold tracking-tight text-accent">Teams</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tighter text-white sm:text-4xl">
          참가 팀
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-4 rounded-3xl bg-surface p-6"
          >
            <div className="h-24 w-full animate-pulse rounded-2xl bg-white/10" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TeamsSection({ year }: { year: number }) {
  const [teams, setTeams] = useState<TeamWithLogo[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setTeams(null);

    fetch(`/api/teams/${year}`)
      .then((res) => res.json())
      .then((data: { teams: TeamWithLogo[] }) => {
        if (!cancelled) setTeams(data.teams ?? []);
      })
      .catch(() => {
        if (!cancelled) setTeams([]);
      });

    return () => {
      cancelled = true;
    };
  }, [year]);

  if (teams === null) return <TeamsSkeleton />;
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
