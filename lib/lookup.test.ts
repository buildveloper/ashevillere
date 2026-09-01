import { describe, expect, it } from "vitest";
import { lookupFailurePanels } from "./lookup";

describe("lookupFailurePanels", () => {
  it("returns all three panels in a terminal unavailable state", () => {
    const result = lookupFailurePanels();
    expect(Object.keys(result).sort()).toEqual(["flood", "recovery", "str"]);
    expect(result.flood.status).toBe("unavailable");
    expect(result.str.status).toBe("unavailable");
    expect(result.recovery.status).toBe("unavailable");
    // Terminal: no panel may stay in "checking" — that is the forever-spin bug.
    expect(result.flood.status).not.toBe("checking");
    expect(result.str.status).not.toBe("checking");
    expect(result.recovery.status).not.toBe("checking");
  });

  it("carries an honest message onto every panel", () => {
    const message = "The lookup could not be completed — try again.";
    const result = lookupFailurePanels(message);
    expect(result.flood.message).toBe(message);
    expect(result.str.message).toBe(message);
    expect(result.recovery.message).toBe(message);
  });

  it("defaults to a no-guessed-data message", () => {
    const result = lookupFailurePanels();
    expect(result.flood.message).toMatch(/no guessed data/i);
    expect(result.str.message).toMatch(/no guessed data/i);
    expect(result.recovery.message).toMatch(/no guessed data/i);
  });
});
