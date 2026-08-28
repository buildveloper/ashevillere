import { NextRequest, NextResponse } from "next/server";
import { runLookup, type LookupContext } from "@/lib/lookup";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { logLookupEvent } from "@/lib/lookup-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Abuse floor: 30 full lookups/min/IP (each fans out to FEMA + county GIS).
const LIMIT = 30;

export async function GET(req: NextRequest) {
  const rl = rateLimit(`lookup:${clientIp(req)}`, LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many lookups — please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lon = Number(req.nextUrl.searchParams.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "Missing lat/lon." }, { status: 400 });
  }
  const ctx: LookupContext = {
    latitude: lat,
    longitude: lon,
    zip: req.nextUrl.searchParams.get("zip") ?? undefined,
    city: req.nextUrl.searchParams.get("city") ?? undefined,
    address: req.nextUrl.searchParams.get("address") ?? undefined,
  };
  const result = await runLookup(ctx);

  // Anonymous aggregate logging — best-effort and time-boxed so telemetry can
  // never block or slow the free consumer lookup (lib/lookup-log.ts). The
  // response below is identical to what the tool already returns.
  await Promise.race([
    logLookupEvent(ctx, result),
    new Promise<void>((resolve) => setTimeout(resolve, 2000)),
  ]);

  return NextResponse.json(result);
}
