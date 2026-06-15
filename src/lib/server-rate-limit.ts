// Server-side rate limiting with configurable limits per route
// Uses Upstash Redis in production, in-memory Map for development

const DEFAULT_MAX_REQUESTS = 2;
const DEFAULT_WINDOW_MS = 3 * 60 * 60 * 1000; // 3 hours

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

// Periodic cleanup of expired entries (every 15 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, entry] of memoryStore) {
        if (now - entry.windowStart > DEFAULT_WINDOW_MS) {
          memoryStore.delete(key);
        }
      }
    },
    15 * 60 * 1000
  );
}

async function getRedisEntry(key: string): Promise<RateLimitEntry | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL_KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_URL_KV_REST_API_TOKEN;
  if (!url || !token) return null;

  try {
    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json.result) return JSON.parse(json.result) as RateLimitEntry;
    return null;
  } catch {
    return null;
  }
}

async function setRedisEntry(
  key: string,
  entry: RateLimitEntry,
  ttlSec: number,
): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL_KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_URL_KV_REST_API_TOKEN;
  if (!url || !token) return;

  try {
    await fetch(`${url}/set/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(entry),
    });
    await fetch(`${url}/expire/${encodeURIComponent(key)}/${ttlSec}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // Fall through to memory store
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(
  identifier: string,
  maxRequests = DEFAULT_MAX_REQUESTS,
  windowMs = DEFAULT_WINDOW_MS,
): Promise<RateLimitResult> {
  const now = Date.now();

  // Try Redis first
  const redisEntry = await getRedisEntry(identifier);
  if (redisEntry) {
    if (now - redisEntry.windowStart > windowMs) {
      const newEntry: RateLimitEntry = { count: 1, windowStart: now };
      await setRedisEntry(identifier, newEntry, Math.ceil(windowMs / 1000) + 60);
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetAt: now + windowMs,
      };
    }

    if (redisEntry.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: redisEntry.windowStart + windowMs,
      };
    }

    redisEntry.count++;
    await setRedisEntry(identifier, redisEntry, Math.ceil(windowMs / 1000) + 60);
    return {
      allowed: true,
      remaining: maxRequests - redisEntry.count,
      resetAt: redisEntry.windowStart + windowMs,
    };
  }

  // Fallback to in-memory store
  const entry = memoryStore.get(identifier);
  if (!entry || now - entry.windowStart > windowMs) {
    memoryStore.set(identifier, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.windowStart + windowMs,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.windowStart + windowMs,
  };
}

export function getRateLimitHeaders(
  result: RateLimitResult,
  maxRequests = DEFAULT_MAX_REQUESTS,
): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(maxRequests),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
  };
}
