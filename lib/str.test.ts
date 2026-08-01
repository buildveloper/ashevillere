import { describe, expect, it } from "vitest";
import { classifyStrJurisdiction } from "./str";

describe("classifyStrJurisdiction", () => {
  it("classifies Asheville city zips as city", () => {
    const r = classifyStrJurisdiction("28801");
    expect(r.status).toBe("result");
    expect(r.value).toBe("city");
    expect(r.message).toContain("city limits");
  });

  it("classifies county zips as county", () => {
    const r = classifyStrJurisdiction("28787"); // Weaverville
    expect(r.status).toBe("result");
    expect(r.value).toBe("county");
    expect(r.message).toContain("Outside Asheville city limits");
  });

  it("handles missing zip honestly", () => {
    const r = classifyStrJurisdiction(undefined);
    expect(r.status).toBe("result");
    expect(r.value).toBe("unknown");
    expect(r.message).toContain("couldn't determine");
  });
});
