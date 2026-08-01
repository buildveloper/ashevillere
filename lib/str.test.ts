import { describe, expect, it } from "vitest";
import { applyStrRules } from "./str";

describe("applyStrRules — city jurisdiction", () => {
  it("prohibits whole-home STR in non-resort city zoning (2018 ordinance)", () => {
    const r = applyStrRules({
      jurisdiction: "city",
      jurisdictionName: "CITY OF ASHEVILLE",
      zoning: "CBD",
      permitRegistry: "unchecked",
    });
    expect(r.value).toBe("city");
    expect(r.message).toContain("prohibited outside resort districts");
    expect(r.message).toContain("2018 ordinance");
  });

  it("allows whole-home STR in a resort district", () => {
    const r = applyStrRules({
      jurisdiction: "city",
      jurisdictionName: "CITY OF ASHEVILLE",
      zoning: "RES",
      permitRegistry: "unchecked",
    });
    expect(r.value).toBe("city");
    expect(r.message).toContain("resort district");
    expect(r.message).toContain("may be permitted");
  });

  it("allows homestay in residential city zoning with permit note", () => {
    const r = applyStrRules({
      jurisdiction: "city",
      jurisdictionName: "CITY OF ASHEVILLE",
      zoning: "RS-2",
      permitRegistry: "unchecked",
    });
    expect(r.value).toBe("city");
    expect(r.message).toContain("homestays");
    expect(r.message).toContain("city permit");
    expect(r.message).toContain("confirmed directly with the City of Asheville");
  });
});

describe("applyStrRules — county jurisdiction", () => {
  it("flags unincorporated county as more permissive", () => {
    const r = applyStrRules({
      jurisdiction: "county",
      jurisdictionName: "Unincorporated Buncombe County",
      zoning: "R-3",
      permitRegistry: "unchecked",
    });
    expect(r.value).toBe("county");
    expect(r.message).toContain("materially different");
    expect(r.message).toContain("more permissive");
    expect(r.message).toContain("check the current county rules");
  });
});

describe("applyStrRules — HOA disclaimer", () => {
  it("always includes the HOA caveat", () => {
    const r = applyStrRules({
      jurisdiction: "county",
      jurisdictionName: "Unincorporated Buncombe County",
      zoning: "R-3",
      permitRegistry: "unchecked",
    });
    expect(r.message).toContain("HOA covenants");
  });
});
