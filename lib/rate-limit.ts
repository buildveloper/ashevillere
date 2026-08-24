/**
 * Per-IP sliding-window rate limiting for public API routes.
 *
 * In-memory, per serverless instance: each Vercel function instance keeps
 * its own window, so the effective global limit is roughly
 * limit × concurrent instances. That is an intentional $0-infrastructure
 * floor against abuse — not a hard quota. If per-instance drift ever
 * matters, the upgrade path is a shared store (e.g. Upstash free tier);
 * this module's interface is deliberately store-shaped to make that swap
 * local to `hits`.
 */

const WINDOW_MS = 60_000;

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

/** Prune + count hits inside the window for `key`. */
function recentCount(key: string, now: number): number {
  const bucket = buckets.get(key);
  if (!bucket) return 0;
  bucket.hits = bucket.hits.filter((t) => now - t < WINDOW_MS);
  if (bucket.hits.length === 0) buckets.delete(key);
  return bucket.hits.length;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the next request would be allowed (for Retry-After). */
  retryAfterSeconds: number;
  remaining: number;
}

/**
 * Check-and-record one request for `key`. Returns allowed=false once
 * `limit` requests have been recorded within the trailing minute.
 */
export function rateLimit(key: string, limit: number): RateLimitResult {
  const now = Date.now();
  const count = recentCount(key, now);

  if (count >= limit) {
    const oldest = buckets.get(key)?.hits[0] ?? now;
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000)),
      remaining: 0,
    };
  }

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }
  bucket.hits.push(now);

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: limit - (count + 1),
  };
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}