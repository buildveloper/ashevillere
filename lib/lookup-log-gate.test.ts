import { describe, expect, it } from "vitest";
import { isTrustedProbe, shouldLogLookup } from "./lookup-log-gate";

describe("shouldLogLookup", () => {
  it("logs real production traffic", () => {
    expect(shouldLogLookup("production", false)).toBe(true);
  });

  it("never logs a trusted probe, even in production", () => {
    expect(shouldLogLookup("production", true)).toBe(false);
  });

  it("does not log preview, development, or local runs", () => {
    expect(shouldLogLookup("preview", false)).toBe(false);
    expect(shouldLogLookup("development", false)).toBe(false);
    expect(shouldLogLookup(undefined, false)).toBe(false);
  });

  it("treats an unknown environment as not production", () => {
    expect(shouldLogLookup("staging", false)).toBe(false);
    expect(shouldLogLookup("", false)).toBe(false);
  });
});

describe("isTrustedProbe", () => {
  const secret = "s3cret-probe-value";

  it("accepts an exact match", () => {
    expect(isTrustedProbe(secret, secret)).toBe(true);
  });

  it("rejects a missing header", () => {
    expect(isTrustedProbe(null, secret)).toBe(false);
    expect(isTrustedProbe("", secret)).toBe(false);
  });

  it("rejects when no secret is configured", () => {
    expect(isTrustedProbe(secret, undefined)).toBe(false);
    expect(isTrustedProbe(secret, "")).toBe(false);
  });

  it("rejects a wrong secret of equal and different length", () => {
    expect(isTrustedProbe("s3cret-probe-valuX", secret)).toBe(false);
    expect(isTrustedProbe("short", secret)).toBe(false);
  });
});
