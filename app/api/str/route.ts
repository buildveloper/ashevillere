import { NextRequest, NextResponse } from "next/server";
import { lookupStrEligibility } from "@/lib/str";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lon = Number(req.nextUrl.searchParams.get("lon"));
  const zip = req.nextUrl.searchParams.get("zip") ?? undefined;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "Missing lat/lon." }, { status: 400 });
  }
  const result = await lookupStrEligibility(lat, lon, zip);
  return NextResponse.json(result);
}
