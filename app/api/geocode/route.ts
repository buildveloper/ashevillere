import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocode";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Abuse floor: 30 lookups/min/IP. In-memory per instance — see lib/rate-limit.
const LIMIT = 30;

export async function GET(req: NextRequest) {
  const rl = rateLimit(`geocode:${clientIp(req)}`, LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many lookups — please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  const address = req.nextUrl.searchParams.get("address")?.trim() ?? "";
  if (!address) {
    return NextResponse.json(
      { error: "Missing address parameter." },
      { status: 400 }
    );
  }
  if (address.length > 200) {
    return NextResponse.json(
      { error: "Address is too long." },
      { status: 400 }
    );
  }

  const result = await geocodeAddress(address);
  return NextResponse.json(result);
}
