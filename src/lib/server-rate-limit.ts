// Server-side rate limiting — 2 requests per 3 hours per user/IP
// Uses Upstash Redis in production, in-memory Map for development

const MAX_REQUESTS = 2;
const WINDOW_MS = 3 * 60 * 60 * 1000; // 3 hours

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
        if (now - entry.windowStart > WINDOW_MS) {
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
  entry: RateLimitEntry
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
    // Set expiry to window + buffer
    await fetch(`${url}/expire/${encodeURIComponent(key)}/${Math.ceil(WINDOW_MS / 1000) + 60}`, {
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
  identifier: string
): Promise<RateLimitResult> {
  const now = Date.now();

  // Try Redis first
  const redisEntry = await getRedisEntry(identifier);
  if (redisEntry) {
    if (now - redisEntry.windowStart > WINDOW_MS) {
      const newEntry: RateLimitEntry = { count: 1, windowStart: now };
      await setRedisEntry(identifier, newEntry);
      return {
        allowed: true,
        remaining: MAX_REQUESTS - 1,
        resetAt: now + WINDOW_MS,
      };
    }

    if (redisEntry.count >= MAX_REQUESTS) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: redisEntry.windowStart + WINDOW_MS,
      };
    }

    redisEntry.count++;
    await setRedisEntry(identifier, redisEntry);
    return {
      allowed: true,
      remaining: MAX_REQUESTS - redisEntry.count,
      resetAt: redisEntry.windowStart + WINDOW_MS,
    };
  }

  // Fallback to in-memory store
  const entry = memoryStore.get(identifier);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    memoryStore.set(identifier, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.windowStart + WINDOW_MS,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.count,
    resetAt: entry.windowStart + WINDOW_MS,
  };
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(MAX_REQUESTS),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
  };
}
