import { after, NextRequest, NextResponse } from "next/server";
import { runLookupTimed, type LookupContext } from "@/lib/lookup";
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
  const { result, timings } = await runLookupTimed(ctx);

  // Anonymous aggregate logging runs after the response is sent (Next `after`
  // → Vercel `waitUntil`), so it can never delay or block the lookup response.
  // logLookupEvent catches its own failures; telemetry is never a dependency.
  after(() => logLookupEvent(ctx, result));

  return NextResponse.json(result, {
    headers: {
      // Server-measured panel durations, for preview/production diagnostics.
      // The JSON payload is unchanged.
      "Server-Timing": `flood;dur=${timings.flood}, str;dur=${timings.str}, recovery;dur=${timings.recovery}, schools;dur=${timings.schools}, total;dur=${timings.total}`,
      "X-Lookup-Timings": `flood=${timings.flood};str=${timings.str};recovery=${timings.recovery};schools=${timings.schools};total=${timings.total}`,
    },
  });
}
