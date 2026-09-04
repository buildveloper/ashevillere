import { afterEach, describe, expect, it, vi } from "vitest";
import { isBuncombePoint } from "./boundary";
import { queryPoint } from "./arcgis";

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("isBuncombePoint", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns in when the county GIS returns a feature at the point", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ features: [{ attributes: { OBJECTID: 1 } }] }))
    );
    await expect(isBuncombePoint(35.59518, -82.55175)).resolves.toBe("in");
  });

  it("returns out when the county GIS returns no feature (outside county)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ features: [] })));
    await expect(isBuncombePoint(35.3194, -82.461)).resolves.toBe("out");
  });

  it("returns unavailable when the county GIS fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    await expect(isBuncombePoint(35.59518, -82.55175)).resolves.toBe("unavailable");
  });

  it("returns unavailable when the county GIS responds non-ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("gateway timeout", { status: 504 }))
    );
    await expect(isBuncombePoint(35.59518, -82.55175)).resolves.toBe("unavailable");
  });

  it("builds the point query with the county's boundary layer and SR params", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ features: [{ attributes: { OBJECTID: 1 } }] }));
    vi.stubGlobal("fetch", fetchMock);
    await isBuncombePoint(35.59518, -82.55175);
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("bcmap_vt/MapServer/27/query");
    expect(url).toContain("geometry=-82.55175%2C35.59518");
    expect(url).toContain("esriGeometryPoint");
    expect(url).toContain("esriSpatialRelIntersects");
    expect(url).toContain("inSR=4326");
  });
});

// Keep queryPoint exercised in case its shape changes.
describe("queryPoint", () => {
  it("returns null on a non-json response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("not json", { status: 200 }))
    );
    await expect(
      queryPoint("https://example.com/MapServer", 27, 35, -82, "OBJECTID")
    ).resolves.toBeNull();
  });
});
