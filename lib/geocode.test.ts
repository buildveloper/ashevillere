import { describe, expect, it } from "vitest";
import { classifyCensusResponse, isBuncombeZip } from "./geocode";

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
});
