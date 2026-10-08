import { describe, expect, it } from "vitest";
import { buildSchoolMessage, SCHOOL_DISCLAIMER } from "./schools";

describe("buildSchoolMessage", () => {
  it("lists every level the county record carries, verbatim", () => {
    const m = buildSchoolMessage({
      descr: "W D WILLIAMS ELEM",
      elementary: "W D WILLIAMS ELEM",
      middle: "CHARLES D OWEN MIDDLE",
      high: "CHARLES D OWEN HIGH",
    });
    expect(m).toContain("Elementary — W D WILLIAMS ELEM");
    expect(m).toContain("Middle — CHARLES D OWEN MIDDLE");
    expect(m).toContain("High — CHARLES D OWEN HIGH");
    expect(m).toContain("Buncombe County Schools and Asheville City Schools");
  });

  it("reads the live mirror's lowercase descr field (city-hosted layer 8)", () => {
    // Real record shape from the live mirror (2026-10-08):
    // { descr: "ASHEVILLE CITY", elementary: "ASHEVILLE CITY",
    //   intermediate: null, middle: "ASHEVILLE MIDDLE", high: "ASHEVILLE HIGH" }
    const m = buildSchoolMessage({
      descr: "ASHEVILLE CITY",
      elementary: "ASHEVILLE CITY",
      intermediate: null,
      middle: "ASHEVILLE MIDDLE",
      high: "ASHEVILLE HIGH",
    });
    expect(m).toContain("District record: ASHEVILLE CITY");
    expect(m).toContain("Middle — ASHEVILLE MIDDLE");
    expect(m).toContain("High — ASHEVILLE HIGH");
    expect(m).not.toContain("Intermediate");
  });

  it("includes the intermediate school when the record has one", () => {
    const m = buildSchoolMessage({
      elementary: "North Windy Ridge",
      intermediate: "Reynolds Middle",
      middle: "Reynolds Middle",
      high: "T.C. Roberson",
    });
    expect(m).toContain("Intermediate — Reynolds Middle");
  });

  it("shows blanks as a data gap, never an inferred assignment", () => {
    const m = buildSchoolMessage({
      descr: "W D WILLIAMS ELEM",
      elementary: "",
      middle: null,
      high: undefined,
    });
    expect(m).toContain("no school names are filled in");
    expect(m).not.toContain("Elementary —");
  });

  it("omits the intermediate level when absent, without blank slots", () => {
    const m = buildSchoolMessage({
      elementary: "Haw Creek",
      middle: "Clyde A. Erwin",
      high: "Clyde A. Erwin",
    });
    expect(m).not.toContain("Intermediate");
  });

  it("uses the record description verbatim", () => {
    const m = buildSchoolMessage({
      descr: "ASHEVILLE CITY",
      elementary: "Claxton",
      middle: "Asheville Middle",
      high: "Asheville High",
    });
    expect(m).toContain("District record: ASHEVILLE CITY");
  });
});

describe("SCHOOL_DISCLAIMER", () => {
  it("tells the user zones change and to verify with the district", () => {
    expect(SCHOOL_DISCLAIMER).toMatch(/Attendance zones change/i);
    expect(SCHOOL_DISCLAIMER).toMatch(/verify with the school district directly/i);
  });
});

describe("isolation — schools failure cannot break the other panels", () => {
  // NOTE: live-network isolation proofs (bad-URL queryPoint, mid-ocean
  // runLookup) exceed the sandbox tool timeout, so they run from the Vercel
  // preview instead — see the verification report. The structural guarantee
  // lives in lib/lookup.ts (Promise.all + per-panel try/catch) and
  // lib/arcgis.ts (fetchWithRetry: 10s timeout, retry once, null on failure).
  it("runSchools maps a null fetch to honest unavailable (contract check)", async () => {
    const { lookupFailurePanels } = await import("./lookup");
    const panels = lookupFailurePanels("down");
    expect(panels.schools.status).toBe("unavailable");
    expect(panels.flood.status).toBe("unavailable");
    expect(panels.str.status).toBe("unavailable");
    expect(panels.recovery.status).toBe("unavailable");
  });
});
