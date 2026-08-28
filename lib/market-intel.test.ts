import { describe, expect, it } from "vitest";
import {
  buildLookupEventRow,
  rollupLookupRows,
  type LookupEventRow,
} from "./market-intel";
import type { LookupContext, LookupResult } from "./lookup";

const ctx: LookupContext = {
  latitude: 35.59518,
  longitude: -82.55175,
  zip: " 28801 ",
  address: "1 N PACK SQ, ASHEVILLE, NC, 28801",
};

const result: LookupResult = {
  flood: {
    key: "flood",
    status: "result",
    value: "AE",
    message: "Zone AE.",
  },
  str: { key: "str", status: "result", value: "city", message: "City rules." },
  recovery: {
    key: "recovery",
    status: "result",
    value: "damage-reported",
    message: "Record found.",
  },
};

describe("buildLookupEventRow", () => {
  it("keeps only non-identifying dimensions from a completed lookup", () => {
    const now = new Date("2026-08-01T12:00:00Z");
    const row = buildLookupEventRow(ctx, result, now);
    expect(row).toEqual({
      zip: "28801",
      createdAt: now,
      flood: true,
      str: true,
      recovery: true,
      floodZone: "AE",
      strJurisdiction: "city",
    });
    // No street address, coordinates, city, or identity on the row.
    expect(row).not.toHaveProperty("address");
    expect(row).not.toHaveProperty("latitude");
    expect(row).not.toHaveProperty("longitude");
    expect(row).not.toHaveProperty("city");
  });

  it("records unavailable panels as false and null categories", () => {
    const row = buildLookupEventRow(
      { ...ctx, zip: undefined },
      {
        flood: { key: "flood", status: "unavailable", message: "Down." },
        str: { key: "str", status: "unavailable", message: "Down." },
        recovery: { key: "recovery", status: "unavailable", message: "Down." },
      }
    );
    expect(row.zip).toBeNull();
    expect(row.flood).toBe(false);
    expect(row.str).toBe(false);
    expect(row.recovery).toBe(false);
    expect(row.floodZone).toBeNull();
    expect(row.strJurisdiction).toBeNull();
  });

  it("ignores a non-jurisdiction STR value to keep categories honest", () => {
    const row = buildLookupEventRow(ctx, {
      flood: result.flood,
      str: {
        key: "str",
        status: "result",
        value: "NOT-A-JURISDICTION",
        message: "x",
      },
      recovery: result.recovery,
    });
    expect(row.str).toBe(true);
    expect(row.strJurisdiction).toBeNull();
  });
});

function row(partial: Partial<LookupEventRow>): LookupEventRow {
  return {
    zip: null,
    createdAt: new Date(),
    flood: false,
    str: false,
    recovery: false,
    floodZone: null,
    strJurisdiction: null,
    ...partial,
  };
}

describe("rollupLookupRows", () => {
  it("rolls up per-ZIP totals, shares, and panel counts", () => {
    const current = [
      row({
        zip: "28801",
        flood: true,
        str: true,
        recovery: true,
        floodZone: "AE",
        strJurisdiction: "city",
      }),
      row({ zip: "28801", flood: true, floodZone: "AE" }),
      row({ zip: "28711", str: true, strJurisdiction: "county" }),
      row({ zip: null }),
    ];
    const rollup = rollupLookupRows(current, [], 7);

    expect(rollup.totalLookups).toBe(4);
    expect(rollup.avgPerDay).toBe(0.6);
    expect(rollup.distinctZips).toBe(2);
    expect(rollup.areas).toHaveLength(2);
    expect(rollup.areas[0]).toMatchObject({
      zip: "28801",
      lookups: 2,
      flood: 2,
      str: 1,
      recovery: 1,
      sharePct: 50,
    });
    expect(rollup.areas[1].sharePct).toBe(25);
    expect(rollup.panels).toEqual({ flood: 2, str: 2, recovery: 1 });
    expect(rollup.floodZones).toEqual([{ label: "AE", lookups: 2 }]);
    expect(rollup.strJurisdictions).toEqual([
      { label: "city", lookups: 1 },
      { label: "county", lookups: 1 },
    ]);
  });

  it("computes trend vs the prior window", () => {
    const current = [row({ zip: "28801" }), row({ zip: "28801" }), row({ zip: "28711" })];
    const previous = [row({ zip: "28801" }), row({ zip: "28711" }), row({ zip: "28711" })];
    const rollup = rollupLookupRows(current, previous, 30);
    const byZip = new Map(rollup.areas.map((a) => [a.zip, a]));

    expect(byZip.get("28801")).toMatchObject({ delta: 1, trend: "up" });
    expect(byZip.get("28711")).toMatchObject({ delta: -1, trend: "down" });
    expect(rollup.totalDelta).toBe(0);
  });

  it("marks an area with no prior activity as new", () => {
    const rollup = rollupLookupRows([row({ zip: "28806" })], [], 7);
    expect(rollup.areas[0]).toMatchObject({ previousLookups: 0, trend: "new" });
  });

  it("returns an empty rollup for no rows", () => {
    const rollup = rollupLookupRows([], [], 30);
    expect(rollup.totalLookups).toBe(0);
    expect(rollup.avgPerDay).toBe(0);
    expect(rollup.distinctZips).toBe(0);
    expect(rollup.areas).toEqual([]);
    expect(rollup.panels).toEqual({ flood: 0, str: 0, recovery: 0 });
  });
});
