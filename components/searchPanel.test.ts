import { describe, expect, it } from "vitest";
import { shouldStartLookup } from "./SearchPanel";

describe("shouldStartLookup", () => {
  it("allows a lookup when idle with a non-blank address", () => {
    expect(shouldStartLookup(false, "70 Woodfin Pl, Asheville")).toBe(true);
  });

  it("blocks re-entry while a lookup is already in flight", () => {
    expect(shouldStartLookup(true, "70 Woodfin Pl, Asheville")).toBe(false);
  });

  it("blocks blank and whitespace-only addresses", () => {
    expect(shouldStartLookup(false, "")).toBe(false);
    expect(shouldStartLookup(false, "   ")).toBe(false);
  });

  it("treats surrounding whitespace as non-blank input", () => {
    expect(shouldStartLookup(false, "  20 Church St, Black Mountain  ")).toBe(true);
  });
});
