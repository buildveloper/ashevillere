import { NextRequest, NextResponse } from "next/server";
import { submitLead, validateLead } from "@/lib/lead";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Basic in-memory rate limit (per process): 5 submissions / 60s per client.
// Not a hard security boundary — it keeps a happy path from being hammered.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

export async function POST(req: NextRequest) {
  const client = req.headers.get("x-forwarded-for") ?? "unknown";
  if (rateLimited(client)) {
    return NextResponse.json(
      { error: "Too many submissions — try again in a minute." },
      { status: 429 }
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

  const delivered = await submitLead(v.payload);
  if (!delivered) {
    return NextResponse.json(
      { error: "Couldn’t submit right now — please try again in a moment." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}