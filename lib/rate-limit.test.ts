import { describe, expect, it } from "vitest";
import { rateLimit } from "./rate-limit";

// Keys are namespaced per test so the module-level Map never leaks state
// between cases.
describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    const key = "test-under";
    expect(rateLimit(key, 3).allowed).toBe(true);
    expect(rateLimit(key, 3).allowed).toBe(true);
    const third = rateLimit(key, 3);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it("blocks the request after the limit and reports retry-after", () => {
    const key = "test-block";
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, 5).allowed).toBe(true);
    }
    const blocked = rateLimit(key, 5);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThanOrEqual(1);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("tracks limits independently per key", () => {
    for (let i = 0; i < 2; i++) rateLimit("test-iso-a", 2);
    expect(rateLimit("test-iso-a", 2).allowed).toBe(false);
    expect(rateLimit("test-iso-b", 2).allowed).toBe(true);
  });

  it("keeps separate buckets for different route prefixes", () => {
    // Same IP hitting two routes must not share a window.
    expect(rateLimit("geocode:1.2.3.4", 30).allowed).toBe(true);
    expect(rateLimit("lookup:1.2.3.4", 30).allowed).toBe(true);
  });
});