import { afterEach, describe, expect, it, vi } from "vitest";
import {
  classifyDamageResponse,
  lookupRecoveryContext,
  matchCountyAddress,
  PARCEL_GAP_MESSAGE,
  streetSignature,
} from "./recovery";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("classifyDamageResponse", () => {
  it("maps a county record to damage-reported with the damage type", () => {
    const r = classifyDamageResponse({
      kind: "record",
      damageType: "NATURAL DISASTER - MAJOR DAMAGE",
    });
    expect(r.status).toBe("result");
    expect(r.value).toBe("damage-reported");
    expect(r.damageType).toBe("NATURAL DISASTER - MAJOR DAMAGE");
    expect(r.message).toContain("in Buncombe County's Helene damage parcels dataset");
    expect(r.message).toContain("NATURAL DISASTER - MAJOR DAMAGE");
    expect(r.message).toContain("verify with Buncombe County");
  });

  it("surfaces no-damage-record only for a successful zero-row query", () => {
    const r = classifyDamageResponse({ kind: "no-record" });
    expect(r.status).toBe("result");
    expect(r.value).toBe("no-damage-record");
    expect(r.message).toContain("No record for this parcel");
    // Honest caveat — never a guarantee.
    expect(r.message).toContain("does not guarantee no damage");
  });

  it("surfaces an upstream failure as unavailable, never no-damage-record", () => {
    const r = classifyDamageResponse({
      kind: "unavailable",
      reason: "error-envelope",
    });
    expect(r.status).toBe("unavailable");
    expect(r.value).toBeUndefined();
    expect(r.sources).toBeUndefined();
    expect(r.message).toContain("temporarily unreachable");
  });

  it("omits damageType when the record has none", () => {
    const r = classifyDamageResponse({ kind: "record" });
    expect(r.status).toBe("result");
    expect(r.value).toBe("damage-reported");
    expect(r.damageType).toBeUndefined();
  });

  it("cites a source only for real fetched data", () => {
    const r = classifyDamageResponse({ kind: "record", damageType: "MINOR" });
    expect(r.sources?.length).toBe(1);
    expect(r.sources?.[0].url).toBe("https://data.buncombenc.gov/");

    const unavailable = classifyDamageResponse({
      kind: "unavailable",
      reason: "network",
    });
    expect(unavailable.sources).toBeUndefined();
  });

  it("never fabricates permit or rebuild activity", () => {
    const damaged = classifyDamageResponse({ kind: "record", damageType: "MAJOR" });
    const none = classifyDamageResponse({ kind: "no-record" });
    const down = classifyDamageResponse({ kind: "unavailable", reason: "timeout" });
    // The county does not publish a queryable per-address permit API; the
    // panel must never claim nearby permit/rebuild activity.
    for (const r of [damaged, none, down]) {
      expect(r.message).not.toMatch(/permit|rebuild/i);
    }
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

describe("lookupRecoveryContext — damage-check failure semantics", () => {
  const ADDRESS_QUERY = "Accela/MapServer/4/query";
  const DAMAGE_QUERY = "Accela/MapServer/7/query";
  const IMAGERY_QUERY = "Images_2024_posthelene";
  const MATCHED_ADDRESS = "48 GRIFFING BLVD, ASHEVILLE, NC, 28804";

  const jsonResponse = (body: unknown) =>
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  const ADDRESS_HIT = {
    features: [
      {
        attributes: {
          ParcelNumber: "974072722100000",
          FullAddress: "48 S GRIFFING BLVD",
        },
      },
    ],
  };
  const DAMAGE_NONE = { features: [] };
  const IMAGERY_OK = { serviceDataType: "esriImageServiceDataTypeGeneric" };

  function stubRoutes(routes: {
    address?: () => Response | Promise<Response>;
    damage?: () => Response | Promise<Response>;
    imagery?: () => Response | Promise<Response>;
  }) {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes(ADDRESS_QUERY)) {
        return routes.address ? routes.address() : jsonResponse(ADDRESS_HIT);
      }
      if (url.includes(DAMAGE_QUERY)) {
        return routes.damage ? routes.damage() : jsonResponse(DAMAGE_NONE);
      }
      if (url.includes(IMAGERY_QUERY)) {
        return routes.imagery ? routes.imagery() : jsonResponse(IMAGERY_OK);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  const calledUrls = (fetchMock: ReturnType<typeof vi.fn>) =>
    fetchMock.mock.calls.map((call) => String(call[0]));

  it("resolves the parcel when Census omitted the directional (48 Griffing Blvd)", async () => {
    const fetchMock = stubRoutes({});

    const r = await lookupRecoveryContext(
      35.627844724318,
      -82.543480145144,
      MATCHED_ADDRESS
    );

    expect(r.status).toBe("result");
    expect(r.value).toBe("no-damage-record");
    // The number+name query actually went to the county address table.
    const firstUrl = String(fetchMock.mock.calls[0][0]);
    expect(firstUrl).toContain(ADDRESS_QUERY);
    expect(
      decodeURIComponent(firstUrl).replace(/\+/g, " ")
    ).toContain("LIKE '48 %GRIFFING%'");
  });

  it("returns unavailable when the damage fetch rejects", async () => {
    const fetchMock = stubRoutes({
      damage: () => Promise.reject(new Error("network down")),
    });

    const r = await lookupRecoveryContext(35.6, -82.5, MATCHED_ADDRESS);

    expect(r.status).toBe("unavailable");
    expect(r.value).toBeUndefined();
    expect(r.message).toContain("temporarily unreachable");
    expect(calledUrls(fetchMock).some((u) => u.includes(IMAGERY_QUERY))).toBe(false);
  });

  it("returns unavailable when the damage query times out", async () => {
    const timeout = Object.assign(new Error("The operation was aborted."), {
      name: "TimeoutError",
    });
    stubRoutes({ damage: () => Promise.reject(timeout) });

    const r = await lookupRecoveryContext(35.6, -82.5, MATCHED_ADDRESS);

    expect(r.status).toBe("unavailable");
    expect(r.value).toBeUndefined();
    expect(r.message).toContain("temporarily unreachable");
  });

  it("returns unavailable on an HTTP 200 ArcGIS error envelope", async () => {
    stubRoutes({
      damage: () => jsonResponse({ error: { message: "invalid query" } }),
    });

    const r = await lookupRecoveryContext(35.6, -82.5, MATCHED_ADDRESS);

    expect(r.status).toBe("unavailable");
    expect(r.value).toBeUndefined();
    expect(r.message).toContain("temporarily unreachable");
  });

  it("returns unavailable on a non-2xx damage response", async () => {
    stubRoutes({
      damage: () => new Response("server error", { status: 500 }),
    });

    const r = await lookupRecoveryContext(35.6, -82.5, MATCHED_ADDRESS);

    expect(r.status).toBe("unavailable");
    expect(r.value).toBeUndefined();
  });

  it("returns unavailable when the damage response has no features array", async () => {
    stubRoutes({ damage: () => jsonResponse({}) });

    const r = await lookupRecoveryContext(35.6, -82.5, MATCHED_ADDRESS);

    expect(r.status).toBe("unavailable");
    expect(r.value).toBeUndefined();
  });

  it("returns unavailable when the address query fails, without checking damage", async () => {
    const fetchMock = stubRoutes({
      address: () => Promise.reject(new Error("county GIS down")),
    });

    const r = await lookupRecoveryContext(35.6, -82.5, MATCHED_ADDRESS);

    expect(r.status).toBe("unavailable");
    expect(r.message).toContain("parcel records are temporarily unreachable");
    expect(calledUrls(fetchMock).some((u) => u.includes(DAMAGE_QUERY))).toBe(false);
  });

  it("returns unavailable on an address-table ArcGIS error envelope", async () => {
    const fetchMock = stubRoutes({
      address: () => jsonResponse({ error: { message: "invalid where" } }),
    });

    const r = await lookupRecoveryContext(35.6, -82.5, MATCHED_ADDRESS);

    expect(r.status).toBe("unavailable");
    expect(r.message).toContain("parcel records are temporarily unreachable");
    expect(calledUrls(fetchMock).some((u) => u.includes(DAMAGE_QUERY))).toBe(false);
  });

  it("uses the gap message only when the address query succeeds with no rows", async () => {
    const fetchMock = stubRoutes({
      address: () => jsonResponse({ features: [] }),
    });

    const r = await lookupRecoveryContext(
      35.6,
      -82.5,
      "99999 NOWHERE RD, ASHEVILLE, NC"
    );

    expect(r.status).toBe("unavailable");
    expect(r.message).toBe(PARCEL_GAP_MESSAGE);
    expect(calledUrls(fetchMock).some((u) => u.includes(DAMAGE_QUERY))).toBe(false);
  });

  it("uses the gap message when no matched address is available", async () => {
    const fetchMock = stubRoutes({});

    const r = await lookupRecoveryContext(35.6, -82.5);

    expect(r.status).toBe("unavailable");
    expect(r.message).toBe(PARCEL_GAP_MESSAGE);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
