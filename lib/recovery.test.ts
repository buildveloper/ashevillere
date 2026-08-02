import { describe, expect, it } from "vitest";
import { classifyDamageResponse } from "./recovery";

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
