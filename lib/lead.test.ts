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

  it("only reports success when the relay body says success", async () => {
    process.env.FORMSUBMIT_EMAIL = "chris@ashevillere.com";
    const fetchMock = vi.fn(async () => {
      return {
        ok: true,
        json: async () => ({ success: "false", message: "This form needs Activation." }),
      } as unknown as Response;
    });
    vi.stubGlobal("fetch", fetchMock);

    const { submitLead } = await import("./lead");
    const ok = await submitLead({ email: "buyer@example.com", address: "1 N Pack Sq" });

    expect(ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({
      Origin: "https://ashevillere.com",
      Referer: "https://ashevillere.com/",
    });
  });

  it("returns false when FORMSUBMIT_EMAIL is not configured", async () => {
    delete process.env.FORMSUBMIT_EMAIL;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { submitLead } = await import("./lead");
    const ok = await submitLead({ email: "buyer@example.com" });

    expect(ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});