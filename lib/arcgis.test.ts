import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWithRetry, queryPoint } from "./arcgis";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchWithRetry", () => {
  it("performs exactly one attempt when attempts = 1", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("boom"));
    vi.stubGlobal("fetch", fetchMock);

    const res = await fetchWithRetry("https://example.test/layer?f=json", 10, 1);

    expect(res).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries once by default", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("boom"));
    vi.stubGlobal("fetch", fetchMock);

    const res = await fetchWithRetry("https://example.test/layer?f=json", 10);

    expect(res).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns the first successful response without retrying", async () => {
    const ok = new Response("{}", { status: 200 });
    const fetchMock = vi.fn().mockResolvedValue(ok);
    vi.stubGlobal("fetch", fetchMock);

    const res = await fetchWithRetry("https://example.test/layer?f=json", 10, 1);

    expect(res).toBe(ok);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("queryPoint attempts", () => {
  it("passes a single-attempt budget through to fetch", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("boom"));
    vi.stubGlobal("fetch", fetchMock);

    const res = await queryPoint(
      "https://example.test/FeatureServer",
      8,
      35.5,
      -82.5,
      "elementary,middle,high",
      10,
      1
    );

    expect(res).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
