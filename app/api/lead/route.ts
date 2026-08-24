import { NextRequest, NextResponse } from "next/server";
import { submitLead, validateLead } from "@/lib/lead";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Abuse floor: 5 lead submissions/min/IP — leads trigger real emails.
const LIMIT = 5;

export async function POST(req: NextRequest) {
  const rl = rateLimit(`lead:${clientIp(req)}`, LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many submissions — try again in a minute." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const v = validateLead(body);
  if (!v.ok) {
    return NextResponse.json({ error: v.error }, { status: 400 });
  }

  const result = await submitLead(v.payload);
  if (!result.ok) {
    // Surface the relay's own message so failures are diagnosable —
    // never claim a lead was captured when it wasn't.
    console.error("[lead] submit failed:", result.detail);
    return NextResponse.json(
      { error: "Couldn’t submit right now — please try again in a moment." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}