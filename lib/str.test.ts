import { afterEach, describe, expect, it, vi } from "vitest";
import { applyStrRules, lookupStrEligibility, normalizeDistrict } from "./str";

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("normalizeDistrict", () => {
  it("strips hyphens so GIS and ordinance forms compare equal", () => {
    expect(normalizeDistrict("RS4")).toBe("RS4");
    expect(normalizeDistrict("RS-4")).toBe("RS4");
    expect(normalizeDistrict("rs-4")).toBe("RS4");
    expect(normalizeDistrict("RM-16")).toBe(normalizeDistrict("RM16"));
  });

  it("handles missing values", () => {
    expect(normalizeDistrict(undefined)).toBe("");
  });

  it("matches the live GIS form of the resort districts (space variant)", () => {
    expect(normalizeDistrict("RESORT")).toBe("RESORT");
    expect(normalizeDistrict("RES EXP")).toBe("RESEXP");
  });
});

describe("applyStrRules — district-code normalization (GIS returns hyphen-free codes)", () => {
  it("treats the GIS's hyphen-free RS4 as residential (homestay eligible)", () => {
    const r = applyStrRules({
      jurisdiction: "city",
      jurisdictionName: "CITY OF ASHEVILLE",
      zoning: "RS4",
      permitRegistry: "unchecked",
    });
    expect(r.message).toContain("homestays");
    expect(r.message).not.toContain("may be permitted here under the 2018 ordinance");
  });

  it("treats RM16 as residential too", () => {
    const r = applyStrRules({
      jurisdiction: "city",
      jurisdictionName: "CITY OF ASHEVILLE",
      zoning: "RM16",
      permitRegistry: "unchecked",
    });
    expect(r.message).toContain("homestays");
  });

  it("does NOT report RMX as a resort district (removed from the resort set)", () => {
    const r = applyStrRules({
      jurisdiction: "city",
      jurisdictionName: "CITY OF ASHEVILLE",
      zoning: "RMX",
      permitRegistry: "unchecked",
    });
    expect(r.message).not.toContain("a resort district");
    expect(r.message).toContain("prohibited outside resort districts");
    expect(r.message).toContain("homestays");
  });
});

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

  it("allows whole-home STR in the live GIS's RESORT district", () => {
    const r = applyStrRules({
      jurisdiction: "city",
      jurisdictionName: "CITY OF ASHEVILLE",
      zoning: "RESORT",
      permitRegistry: "unchecked",
    });
    expect(r.value).toBe("city");
    expect(r.message).toContain("resort district");
    expect(r.message).toContain("may be permitted");
  });

  it("allows whole-home STR in the live GIS's RES EXP district", () => {
    const r = applyStrRules({
      jurisdiction: "city",
      jurisdictionName: "CITY OF ASHEVILLE",
      zoning: "RES EXP",
      permitRegistry: "unchecked",
    });
    expect(r.value).toBe("city");
    expect(r.message).toContain("resort district");
    expect(r.message).toContain("may be permitted");
  });

  it("does NOT treat residential-only codes (RS4, RMX) as resort", () => {
    for (const zoning of ["RS4", "RMX"]) {
      const r = applyStrRules({
        jurisdiction: "city",
        jurisdictionName: "CITY OF ASHEVILLE",
        zoning,
        permitRegistry: "unchecked",
      });
      expect(r.message).not.toContain("may be permitted here under the 2018 ordinance");
    }
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

describe("lookupStrEligibility — dead registry probe removed", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("never calls the City portal and keeps the City confirmation wording", async () => {
    const seen: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        seen.push(url);
        if (url.includes("bcmap_vt/MapServer/27")) {
          return jsonResponse({
            features: [
              {
                attributes: {
                  DESCRIPTION: "CITY OF ASHEVILLE",
                  DISTCODE: "CAS",
                },
              },
            ],
          });
        }
        if (url.includes("bcmap_vt/MapServer/31")) {
          return jsonResponse({ features: [{ attributes: { DISTRICTS: "RS4" } }] });
        }
        return jsonResponse({ features: [] });
      })
    );

    const r = await lookupStrEligibility(35.627842303875, -82.543478974663);

    expect(r.status).toBe("result");
    expect(r.permitRegistry).toBe("unchecked");
    expect(r.message).toContain(
      "Permit status must be confirmed directly with the City of Asheville."
    );
    expect(seen.some((u) => u.includes("data.ashevillenc.gov"))).toBe(false);
  });
});
