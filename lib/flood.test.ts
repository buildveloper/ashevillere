import { afterEach, describe, expect, it, vi } from "vitest";
import { classifyZone, lookupFloodZone } from "./flood";

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("classifyZone", () => {
  it("labels high-risk AE with insurance note", () => {
    const r = classifyZone("AE");
    expect(r.status).toBe("result");
    expect(r.zone).toBe("AE");
    expect(r.inSfha).toBe(true);
    expect(r.message).toContain("high flood risk");
    expect(r.message).toContain("Insurance required");
  });

  it("labels AO", () => {
    const r = classifyZone("AO");
    expect(r.zone).toBe("AO");
    expect(r.inSfha).toBe(true);
    expect(r.message).toContain("shallow flooding");
  });

  it("labels X as moderate-to-low", () => {
    const r = classifyZone("X");
    expect(r.zone).toBe("X");
    expect(r.inSfha).toBe(false);
    expect(r.message).toContain("moderate to low");
  });

  it("falls back gracefully when zone missing", () => {
    const r = classifyZone(undefined);
    expect(r.status).toBe("result");
    expect(r.zone).toBe("X");
    expect(r.message).toContain("Verify");
  });

  it("labels unknown zones honestly", () => {
    const r = classifyZone("ZZZ");
    expect(r.zone).toBe("ZZZ");
    expect(r.message).toContain("verify");
  });
});

describe("lookupFloodZone — upstream failure vs empty features", () => {
  it("does not turn a LOMA error envelope into 'no LOMA/LOMR on file'", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/NFHL/MapServer/28/query")) {
        return jsonResponse({ features: [{ attributes: { FLD_ZONE: "X" } }] });
      }
      if (url.includes("/bcmap_vt/MapServer/63/query")) {
        return jsonResponse({ error: { message: "LOMA layer down" } });
      }
      if (url.includes("/NFHL/MapServer?f=pjson")) {
        return jsonResponse({ error: { message: "service metadata down" } });
      }
      if (url.includes("/bcmap_vt/MapServer/51/query")) {
        return jsonResponse({ features: [] });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const r = await lookupFloodZone(35.6, -82.5);

    expect(r.status).toBe("result");
    expect(r.lomaLomr).toBe("unknown");
    expect(r.message).toContain("LOMA/LOMR status could not be checked");
    expect(r.message).not.toContain("No LOMA/LOMR on file");
  });

  it("does not turn a partial FEMA LOMA layer failure into 'none'", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/NFHL/MapServer/28/query")) {
        return jsonResponse({ features: [{ attributes: { FLD_ZONE: "X" } }] });
      }
      if (url.includes("/bcmap_vt/MapServer/63/query")) {
        return jsonResponse({ error: { message: "county LOMA layer down" } });
      }
      if (url.includes("/NFHL/MapServer?f=pjson")) {
        return jsonResponse({
          layers: [
            { id: 90, name: "LOMA" },
            { id: 91, name: "LOMR" },
          ],
        });
      }
      if (url.includes("/NFHL/MapServer/90/query")) {
        return jsonResponse({ error: { message: "layer 90 down" } });
      }
      if (url.includes("/NFHL/MapServer/91/query")) {
        return jsonResponse({ features: [] });
      }
      if (url.includes("/bcmap_vt/MapServer/51/query")) {
        return jsonResponse({ features: [] });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const r = await lookupFloodZone(35.6, -82.5);

    expect(r.status).toBe("result");
    expect(r.lomaLomr).toBe("unknown");
    expect(r.message).toContain("LOMA/LOMR status could not be checked");
  });

  it("returns unavailable when both flood-zone sources answer with zero features", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/NFHL/MapServer/28/query")) {
        return jsonResponse({ features: [] });
      }
      if (url.includes("/bcmap_vt/MapServer/51/query")) {
        return jsonResponse({ features: [] });
      }
      if (url.includes("/bcmap_vt/MapServer/24/query")) {
        return jsonResponse({ features: [] });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const r = await lookupFloodZone(35.6, -82.5);

    expect(r.status).toBe("unavailable");
    expect(r.message).toContain("temporarily unreachable");
  });
});
