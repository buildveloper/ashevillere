import { afterEach, describe, expect, it, vi } from "vitest";
import {
  classifyCensusResponse,
  geocodeAddress,
  isBuncombeZip,
  streetSuffixConflict,
} from "./geocode";
const ashevilleMatch = {
  coordinates: { x: -82.55174903506, y: 35.595180337928 },
  addressComponents: {
    zip: "28801",
    state: "NC",
    city: "ASHEVILLE",
    streetName: "PACK",
  },
  matchedAddress: "1 N PACK SQ, ASHEVILLE, NC, 28801",
};

describe("isBuncombeZip", () => {
  it("accepts Asheville 288xx zips", () => {
    expect(isBuncombeZip("28801")).toBe(true);
    expect(isBuncombeZip("28806")).toBe(true);
  });
  it("accepts surrounding Buncombe County towns", () => {
    expect(isBuncombeZip("28787")).toBe(true); // Weaverville
    expect(isBuncombeZip("28711")).toBe(true); // Black Mountain
    expect(isBuncombeZip("28715")).toBe(true); // Candler
  });
  it("rejects outside zips and garbage", () => {
    expect(isBuncombeZip("28202")).toBe(false); // Charlotte
    expect(isBuncombeZip("27511")).toBe(false); // Cary
    expect(isBuncombeZip(undefined)).toBe(false);
    expect(isBuncombeZip("")).toBe(false);
  });
});

describe("classifyCensusResponse", () => {
  it("classifies a Buncombe County match as in-scope", () => {
    const result = classifyCensusResponse({
      result: { addressMatches: [ashevilleMatch] },
    });
    expect(result.status).toBe("in-scope");
    expect(result.zip).toBe("28801");
    expect(result.latitude).toBeCloseTo(35.59518);
    expect(result.longitude).toBeCloseTo(-82.55175);
  });

  it("classifies a non-Buncombe NC match as outside", () => {
    const result = classifyCensusResponse({
      result: {
        addressMatches: [
          {
            coordinates: { x: -80.842982860474, y: 35.227192862878 },
            addressComponents: { zip: "28202", state: "NC", city: "CHARLOTTE" },
            matchedAddress: "100 N TRYON ST, CHARLOTTE, NC, 28202",
          },
        ],
      },
    });
    expect(result.status).toBe("outside");
    expect(result.city).toBe("CHARLOTTE");
  });

  it("classifies an empty match list as no-match", () => {
    const result = classifyCensusResponse({ result: { addressMatches: [] } });
    expect(result.status).toBe("no-match");
  });

  it("keeps a Buncombe address in-scope even without a city component", () => {
    // Census returns the canonical form; the classifier must keep an in-scope
    // Buncombe ZIP even when the user's bare query lacked a city.
    const result = classifyCensusResponse({
      result: {
        addressMatches: [
          {
            coordinates: { x: -82.42946, y: 35.60318 },
            addressComponents: { zip: "28778", state: "NC" },
            matchedAddress: "287 NEW SALEM RD, SWANNANOA, NC, 28778",
          },
        ],
      },
    });
    expect(result.status).toBe("in-scope");
    expect(result.zip).toBe("28778");
  });
});

describe("streetSuffixConflict", () => {
  it("detects a Census PL→ST rewrite (Woodfin)", () => {
    expect(
      streetSuffixConflict(
        "70 Woodfin Pl, Asheville, NC",
        "70 WOODFIN ST, ASHEVILLE, NC, 28801"
      )
    ).toEqual({ user: "PL", census: "ST" });
  });

  it("returns null when canonicalization keeps the suffix", () => {
    expect(
      streetSuffixConflict("1 N Pack Sq, Asheville", "1 N PACK SQ, ASHEVILLE, NC, 28801")
    ).toBeNull();
  });

  it("returns null when a different road shares the suffix", () => {
    expect(
      streetSuffixConflict("20 Church St, Black Mountain", "20 CHURCH ST, BLACK MOUNTAIN, NC, 28711")
    ).toBeNull();
  });

  it("returns null when the user street has no suffix token", () => {
    expect(streetSuffixConflict("123 Main, Anywhere", "123 MAIN ST, ANYTOWN, NC, 28801")).toBeNull();
  });

  it("returns null for an empty census address", () => {
    expect(streetSuffixConflict("70 Woodfin Pl, Asheville", "")).toBeNull();
  });
});

const woodfinStMatch = {
  coordinates: { x: -82.56, y: 35.6 },
  addressComponents: { zip: "28801", state: "NC", city: "ASHEVILLE", streetName: "WOODFIN" },
  matchedAddress: "70 WOODFIN ST, ASHEVILLE, NC, 28801",
};

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("geocodeAddress", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("prefers the county parcel record when Census rewrote the suffix", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ result: { addressMatches: [woodfinStMatch] } }))
      .mockResolvedValueOnce(
        jsonResponse({
          features: [
            {
              attributes: {
                FullAddress: "70 WOODFIN PL, ASHEVILLE, NC, 28801",
                ParcelNumber: "964962110100000",
                X_Coordinate: 2240000,
                Y_Coordinate: 501500,
              },
            },
          ],
        })
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await geocodeAddress("70 Woodfin Pl, Asheville, NC");
    expect(result.status).toBe("in-scope");
    expect(result.matchedAddress).toContain("70 WOODFIN PL");
    expect(result.message).toMatch(/county parcel record/i);
    // Census (1) + county exact match (1) — the LIKE clause is never reached.
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("keeps the Census result when the county has no record for the user's street", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ result: { addressMatches: [woodfinStMatch] } }))
      .mockResolvedValueOnce(jsonResponse({ features: [] })) // exact clause
      .mockResolvedValueOnce(jsonResponse({ features: [] })); // LIKE clause
    vi.stubGlobal("fetch", fetchMock);

    const result = await geocodeAddress("70 Woodfin Pl, Asheville, NC");
    expect(result.status).toBe("in-scope");
    expect(result.matchedAddress).toBe("70 WOODFIN ST, ASHEVILLE, NC, 28801");
    // Census (1) + county exact (2) + county LIKE (3).
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("does not call the county table on a clean canonicalization", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ result: { addressMatches: [ashevilleMatch] } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await geocodeAddress("1 N Pack Sq, Asheville");
    expect(result.status).toBe("in-scope");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain("geocoding.geo.census.gov");
  });
});
