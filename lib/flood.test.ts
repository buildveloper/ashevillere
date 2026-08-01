import { describe, expect, it } from "vitest";
import { classifyZone } from "./flood";

describe("classifyZone", () => {
  it("labels high-risk AE with insurance note", () => {
    const r = classifyZone("AE");
    expect(r.status).toBe("result");
    expect(r.zone).toBe("AE");
    expect(r.inSfha).toBe(true);
    expect(r.message).toContain("high flood risk");
    expect(r.message).toContain("Insurance required");
  });

  it("labels AO", () => {
    const r = classifyZone("AO");
    expect(r.zone).toBe("AO");
    expect(r.inSfha).toBe(true);
    expect(r.message).toContain("shallow flooding");
  });

  it("labels X as moderate-to-low", () => {
    const r = classifyZone("X");
    expect(r.zone).toBe("X");
    expect(r.inSfha).toBe(false);
    expect(r.message).toContain("moderate to low");
  });

  it("falls back gracefully when zone missing", () => {
    const r = classifyZone(undefined);
    expect(r.status).toBe("result");
    expect(r.zone).toBe("X");
    expect(r.message).toContain("Verify");
  });

  it("labels unknown zones honestly", () => {
    const r = classifyZone("ZZZ");
    expect(r.zone).toBe("ZZZ");
    expect(r.message).toContain("verify");
  });
});
