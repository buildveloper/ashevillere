import { NextRequest, NextResponse } from "next/server";
import { runLookup, type LookupContext } from "@/lib/lookup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lon = Number(req.nextUrl.searchParams.get("lon"));
  const zip = req.nextUrl.searchParams.get("zip") ?? undefined;
  const city = req.nextUrl.searchParams.get("city") ?? undefined;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "Missing lat/lon." }, { status: 400 });
  }
  const ctx: LookupContext = { latitude: lat, longitude: lon, zip, city };
  const result = await runLookup(ctx);
  return NextResponse.json(result);
}
