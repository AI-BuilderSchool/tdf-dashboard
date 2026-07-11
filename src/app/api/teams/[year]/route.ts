import { NextResponse } from "next/server";
import { getAvailableYears, getYearTeamsWithLogos } from "@/lib/wikipedia";

export const revalidate = 21600; // 6h — rosters/logos rarely change once a Tour starts

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ year: string }> },
) {
  const { year: yearParam } = await params;
  const year = Number(yearParam);

  if (!Number.isInteger(year) || !getAvailableYears().includes(year)) {
    return NextResponse.json({ error: "invalid year" }, { status: 404 });
  }

  const teams = await getYearTeamsWithLogos(year);
  return NextResponse.json({ teams });
}
