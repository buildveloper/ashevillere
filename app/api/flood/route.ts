import { NextRequest, NextResponse } from "next/server";
import { lookupFloodZone } from "@/lib/flood";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lon = Number(req.nextUrl.searchParams.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "Missing lat/lon." }, { status: 400 });
  }
  const result = await lookupFloodZone(lat, lon);
  return NextResponse.json(result);
}
