import { describe, expect, it } from "vitest";
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