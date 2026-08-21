import { describe, expect, it } from "vitest";
import { activeSponsors, isTierActive, type SponsorRow } from "./sponsors";

const ROWS: SponsorRow[] = [
  {
    id: "a",
    name: "Alpha Realty",
    tier: "featured",
    tagline: "Local agents",
    url: "https://example.com/alpha",
    activeFrom: "2026-08-01",
    activeTo: "2026-08-31",
  },
  {
    id: "b",
    name: "Beta Lending",
    tier: "spotlight",
    tagline: "Mortgages",
    url: "https://example.com/beta",
    activeFrom: "2026-08-10",
    activeTo: "2026-08-20",
  },
  {
    id: "c",
    name: "Gamma Title",
    tier: "directory",
    tagline: null,
    url: null,
    activeFrom: "2026-09-01",
    activeTo: "2026-09-30",
  },
  {
    id: "d",
    name: "Delta Insurance",
    tier: "featured",
    activeFrom: "2026-08-01",
    activeTo: "2026-08-31",
  },
];

describe("activeSponsors", () => {
  it("includes only sponsors whose window covers the reference date", () => {
    const active = activeSponsors(ROWS, new Date("2026-08-15T12:00:00Z"));
    expect(active.map((s) => s.id)).toEqual(["b", "a", "d"]);
  });

  it("sorts spotlight above featured above directory, then by name", () => {
    const active = activeSponsors(ROWS, new Date("2026-08-15T12:00:00Z"));
    expect(active[0].id).toBe("b"); // spotlight
    expect(active[1].id).toBe("a"); // featured, alphabetical
    expect(active[2].id).toBe("d"); // featured, alphabetical
  });

  it("returns nothing outside every window", () => {
    expect(activeSponsors(ROWS, new Date("2026-12-01T12:00:00Z"))).toEqual([]);
  });

  it("treats a same-day start/end as active", () => {
    const row: SponsorRow = {
      id: "x",
      name: "X",
      tier: "directory",
      activeFrom: "2026-08-21",
      activeTo: "2026-08-21",
    };
    expect(isTierActive(row, new Date("2026-08-21T00:00:00Z"))).toBe(true);
    expect(isTierActive(row, new Date("2026-08-22T00:00:00Z"))).toBe(false);
  });
});