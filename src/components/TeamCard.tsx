import Image from "next/image";
import Link from "next/link";
import type { TeamWithLogo } from "@/lib/db";

export function TeamCard({
  year,
  team,
}: {
  year: number;
  team: TeamWithLogo;
}) {
  return (
    <Link
      href={`/${year}/teams/${encodeURIComponent(team.code)}`}
      className="group flex flex-col items-center gap-4 rounded-3xl bg-surface p-6 text-center transition duration-300 hover:bg-surface-2"
    >
      <div className="relative h-24 w-full overflow-hidden rounded-2xl bg-white/95 p-3">
        {team.logoUrl ? (
          <Image
            src={team.logoUrl}
            alt={team.name}
            fill
            className="object-contain p-2"
            unoptimized
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-3xl font-bold tracking-tight text-black/50">
            {team.code}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-tight text-white transition group-hover:text-accent">
          {team.name}
        </p>
        <p className="mt-1 text-xs text-white/40">{team.riders.length}명 출전</p>
      </div>
    </Link>
  );
}
