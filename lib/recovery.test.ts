import { afterEach, describe, expect, it, vi } from "vitest";
import {
  classifyDamageResponse,
  lookupRecoveryContext,
  matchCountyAddress,
  streetSignature,
} from "./recovery";

describe("classifyDamageResponse", () => {
  it("maps a county record to damage-reported with the damage type", () => {
    const r = classifyDamageResponse({
      damageType: "NATURAL DISASTER - MAJOR DAMAGE",
    });
    expect(r.status).toBe("result");
    expect(r.value).toBe("damage-reported");
    expect(r.damageType).toBe("NATURAL DISASTER - MAJOR DAMAGE");
    expect(r.message).toContain("in Buncombe County's Helene damage parcels dataset");
    expect(r.message).toContain("NATURAL DISASTER - MAJOR DAMAGE");
    expect(r.message).toContain("verify with Buncombe County");
  });

  it("surfaces a no-damage-record state when the query returns no feature", () => {
    const r = classifyDamageResponse(null);
    expect(r.status).toBe("result");
    expect(r.value).toBe("no-damage-record");
    expect(r.message).toContain("No record for this parcel");
    // Honest caveat — never a guarantee.
    expect(r.message).toContain("does not guarantee no damage");
  });

  it("omits damageType when the record has none", () => {
    const r = classifyDamageResponse({});
    expect(r.status).toBe("result");
    expect(r.value).toBe("damage-reported");
    expect(r.damageType).toBeUndefined();
  });

  it("cites a source only for real fetched data", () => {
    const r = classifyDamageResponse({ damageType: "MINOR" });
    expect(r.sources?.length).toBe(1);
    expect(r.sources?.[0].url).toBe("https://data.buncombenc.gov/");
  });

  it("never fabricates permit or rebuild activity", () => {
    const damaged = classifyDamageResponse({ damageType: "MAJOR" });
    const none = classifyDamageResponse(null);
    // The county does not publish a queryable per-address permit API; the
    // panel must never claim nearby permit/rebuild activity.
    expect(damaged.message).not.toMatch(/permit|rebuild/i);
    expect(none.message).not.toMatch(/permit|rebuild/i);
  });
});

describe("streetSignature", () => {
  it("parses number, name, suffix and prefix directional", () => {
    expect(streetSignature("48 GRIFFING BLVD")).toEqual({
      number: "48",
      name: "GRIFFING",
      suffix: "BLVD",
      directional: "",
    });
    expect(streetSignature("48 S GRIFFING BLVD #2")).toEqual({
      number: "48",
      name: "GRIFFING",
      suffix: "BLVD",
      directional: "S",
    });
  });

  it("canonicalizes suffix spelling (STREET = ST)", () => {
    expect(streetSignature("123 MAIN STREET")?.suffix).toBe(
      streetSignature("123 MAIN ST")?.suffix
    );
  });

  it("keeps multi-word street names", () => {
    expect(streetSignature("287 NEW SALEM RD")).toEqual({
      number: "287",
      name: "NEW SALEM",
      suffix: "RD",
      directional: "",
    });
  });

  it("returns null without a house number", () => {
    expect(streetSignature("GRIFFING BLVD")).toBeNull();
  });
});

describe("matchCountyAddress", () => {
  const target = streetSignature("48 GRIFFING BLVD")!;

  it("matches a county row that carries an extra directional", () => {
    expect(
      matchCountyAddress(target, ["48 S GRIFFING BLVD", "48 GRIFFING CIR"])
    ).toBe("48 S GRIFFING BLVD");
  });

  it("matches across suffix spelling differences", () => {
    const t = streetSignature("123 MAIN AVENUE")!;
    expect(matchCountyAddress(t, ["123 MAIN AVE"])).toBe("123 MAIN AVE");
  });

  it("does not pick between two different directionals when ambiguous", () => {
    expect(
      matchCountyAddress(target, ["48 N GRIFFING BLVD", "48 S GRIFFING BLVD"])
    ).toBeNull();
  });

  it("honors an explicit directional", () => {
    const t = streetSignature("48 S GRIFFING BLVD")!;
    expect(
      matchCountyAddress(t, ["48 N GRIFFING BLVD", "48 S GRIFFING BLVD"])
    ).toBe("48 S GRIFFING BLVD");
  });

  it("returns null when nothing matches", () => {
    expect(matchCountyAddress(target, ["50 GRIFFING BLVD"])).toBeNull();
  });
});

describe("lookupRecoveryContext — county parcel match", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const jsonResponse = (body: unknown) =>
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  it("resolves the parcel when Census omitted the directional (48 Griffing Blvd)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          features: [
            { attributes: { ParcelNumber: "974072722100000", FullAddress: "48 S GRIFFING BLVD" } },
          ],
        })
      )
      .mockResolvedValueOnce(jsonResponse({ features: [] })) // damage table: no record
      .mockResolvedValueOnce(jsonResponse({ serviceDataType: "esriImageServiceDataTypeGeneric" })); // imagery
    vi.stubGlobal("fetch", fetchMock);

    const r = await lookupRecoveryContext(
      35.627844724318,
      -82.543480145144,
      "48 GRIFFING BLVD, ASHEVILLE, NC, 28804"
    );
    expect(r.status).toBe("result");
    expect(r.value).toBe("no-damage-record");
    // The number+name query actually went to the county address table.
    expect(String(fetchMock.mock.calls[0][0])).toContain("Accela/MapServer/4/query");
    expect(
      decodeURIComponent(String(fetchMock.mock.calls[0][0])).replace(/\+/g, " ")
    ).toContain("LIKE '48 %GRIFFING%'");
  });

  it("stays honestly unavailable when the address isn't in the county table", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ features: [] }));
    vi.stubGlobal("fetch", fetchMock);

    const r = await lookupRecoveryContext(35.6, -82.5, "99999 NOWHERE RD, ASHEVILLE, NC");
    expect(r.status).toBe("unavailable");
    expect(r.message).toContain("couldn't match this address");
  });
});
