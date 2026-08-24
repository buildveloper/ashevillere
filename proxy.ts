import { NextRequest, NextResponse } from "next/server";

/**
 * Edge proxy (Next 16's replacement for the deprecated `middleware`
 * convention) — rate-limits magic-link sign-in requests.
 *
 * Auth.js has no built-in limiter, and every POST to /api/auth/signin/*
 * triggers a real email. This is an abuse floor (per edge instance,
 * in-memory — see lib/rate-limit.ts for the honest scope note), not a
 * hard quota. Everything else passes through untouched.
 */

const WINDOW_MS = 60_000;
const SIGNIN_LIMIT = 10;

const hits = new Map<string, number[]>();

function rateLimited(key: string): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  let list = hits.get(key);
  if (list) {
    list = list.filter((t) => now - t < WINDOW_MS);
    if (list.length === 0) {
      hits.delete(key);
      list = undefined;
    }
  }
  if (!list) {
    list = [];
    hits.set(key, list);
  }
  if (list.length >= SIGNIN_LIMIT) {
    const oldest = list[0];
    return {
      limited: true,
      retryAfter: Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000)),
    };
  }
  list.push(now);
  return { limited: false, retryAfter: 0 };
}

export function proxy(req: NextRequest) {
  const isSignin =
    req.method === "POST" && req.nextUrl.pathname.startsWith("/api/auth/signin");
  if (!isSignin) return NextResponse.next();

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const { limited, retryAfter } = rateLimited(`signin:${ip}`);

  if (limited) {
    return new NextResponse(
      JSON.stringify({ error: "Too many sign-in attempts — try again shortly." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      }
    );
  }
  return NextResponse.next();
}

export const config = {
  // Only run on the auth routes that trigger email sends; static assets skip it.
  matcher: ["/api/auth/signin/:path*"],
};