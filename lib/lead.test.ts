import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { validateLead } from "./lead";

describe("validateLead", () => {
  it("accepts a valid email-only lead", () => {
    const v = validateLead({ email: "  buyer@example.com  " });
    expect(v).toEqual({
      ok: true,
      payload: { email: "buyer@example.com" },
    });
  });

  it("keeps an optional address and message", () => {
    const v = validateLead({
      email: "buyer@example.com",
      address: "287 New Salem Rd, Swannanoa",
      message: "Track this.",
    });
    expect(v.ok && v.payload).toEqual({
      email: "buyer@example.com",
      address: "287 New Salem Rd, Swannanoa",
      message: "Track this.",
    });
  });

  it("rejects a malformed email", () => {
    expect(validateLead({ email: "not-an-email" }).ok).toBe(false);
    expect(validateLead({ email: "" }).ok).toBe(false);
    expect(validateLead({ email: "a@b" }).ok).toBe(false);
  });

  it("rejects submissions with the honeypot filled", () => {
    const v = validateLead({
      email: "buyer@example.com",
      _honey: "spammy-bot",
    });
    expect(v.ok).toBe(false);
  });

  it("rejects non-object input", () => {
    expect(validateLead(null).ok).toBe(false);
    expect(validateLead("buyer@example.com").ok).toBe(false);
  });

  it("truncates oversized address and message fields", () => {
    const v = validateLead({
      email: "buyer@example.com",
      address: "x".repeat(500),
      message: "y".repeat(2000),
    });
    expect(v.ok && v.payload.address?.length).toBe(200);
    expect(v.ok && v.payload.message?.length).toBe(1000);
  });
});

describe("submitLead", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
    vi.unstubAllGlobals();
  });

  it("delivers via Resend and reports ok on a sent id", async () => {
    process.env.FORMSUBMIT_EMAIL = "chris@ashevillere.com";
    process.env.AUTH_RESEND_KEY = "re_test_key";
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ id: "4ef9a417-02e9-4d39-a756" }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    const { submitLead } = await import("./lead");
    const result = await submitLead({ email: "buyer@example.com", address: "1 N Pack Sq" });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer re_test_key"
    );
    const body = JSON.parse(init.body as string);
    expect(body.to).toBe("chris@ashevillere.com");
    expect(body.subject).toBe("Track this address — 1 N Pack Sq");
  });

  it("surfaces the relay failure detail when Resend errors", async () => {
    process.env.FORMSUBMIT_EMAIL = "chris@ashevillere.com";
    process.env.AUTH_RESEND_KEY = "re_test_key";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 403,
        text: async () => "Forbidden",
      }))
    );

    const { submitLead } = await import("./lead");
    const result = await submitLead({ email: "buyer@example.com" });
    expect(result.ok).toBe(false);
    expect(result.detail).toContain("HTTP 403");
  });

  it("returns false when FORMSUBMIT_EMAIL is not configured", async () => {
    delete process.env.FORMSUBMIT_EMAIL;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { submitLead } = await import("./lead");
    const result = await submitLead({ email: "buyer@example.com" });

    expect(result.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});