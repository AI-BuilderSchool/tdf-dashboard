import Link from "next/link";
import type { TeamEntry } from "@/lib/db";

export function TeamCard({
  year,
  team,
}: {
  year: number;
  team: TeamEntry;
}) {
  return (
    <Link
      href={`/${year}/teams/${encodeURIComponent(team.code)}`}
      className="group flex flex-col items-center justify-center gap-2 rounded-3xl bg-surface px-6 py-10 text-center transition duration-300 hover:bg-surface-2"
    >
      <p className="text-base font-semibold tracking-tight text-white transition group-hover:text-accent">
        {team.name}
      </p>
      <p className="text-xs text-white/40">{team.riders.length}명 출전</p>
    </Link>
  );
}
