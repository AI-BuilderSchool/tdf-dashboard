import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { getAvailableYears, getYearTeamsWithLogos } from "@/lib/wikipedia";

// Route Handlers aren't cached by `export const revalidate` alone; unstable_cache
// persists the result across invocations via Next's Data Cache regardless of
// the route's static/dynamic classification.
const getCachedYearTeams = unstable_cache(
  (year: number) => getYearTeamsWithLogos(year),
  ["year-teams-with-logos"],
  { revalidate: 21600 }, // 6h — rosters/logos rarely change once a Tour starts
);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ year: string }> },
) {
  const { year: yearParam } = await params;
  const year = Number(yearParam);

  if (!Number.isInteger(year) || !getAvailableYears().includes(year)) {
    return NextResponse.json({ error: "invalid year" }, { status: 404 });
  }

  const teams = await getCachedYearTeams(year);
  return NextResponse.json({ teams });
}
