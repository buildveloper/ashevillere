import { describe, expect, it } from "vitest";
import { buildSchoolMessage, SCHOOL_DISCLAIMER } from "./schools";

describe("buildSchoolMessage", () => {
  it("lists every level the county record carries, verbatim", () => {
    const m = buildSchoolMessage({
      description: "Buncombe County Schools",
      elementary: "Sand Hill-Venable",
      middle: "Enka Middle",
      high: "Enka High",
    });
    expect(m).toContain("Elementary — Sand Hill-Venable");
    expect(m).toContain("Middle — Enka Middle");
    expect(m).toContain("High — Enka High");
    expect(m).toContain("Buncombe County Schools and Asheville City Schools");
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
      description: "Buncombe County Schools",
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
      description: "Asheville City Schools",
      elementary: "Claxton",
      middle: "Asheville Middle",
      high: "Asheville High",
    });
    expect(m).toContain("District record: Asheville City Schools");
  });
});

describe("SCHOOL_DISCLAIMER", () => {
  it("tells the user zones change and to verify with the district", () => {
    expect(SCHOOL_DISCLAIMER).toMatch(/Attendance zones change/i);
    expect(SCHOOL_DISCLAIMER).toMatch(/verify with the school district directly/i);
  });
});
