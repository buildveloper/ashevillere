/**
 * Market Interest — anonymous, aggregate lookup activity for Pro subscribers.
 *
 * Every completed public lookup is logged with only non-identifying
 * dimensions: ZIP area, timestamp, which of the three panels returned a real
 * result, and (when relevant) the flood-zone or STR-jurisdiction category.
 * No street address, no coordinates, no IP, no user identity — see the
 * methodology page's privacy disclosure.
 *
 * This module is the pure, unit-testable aggregation layer. The Pro dashboard
 * queries Drizzle directly and passes plain rows in here; this module never
 * imports the DB, so the public lookup path can't be entangled with it.
 */

import type { LookupContext, LookupResult } from "./lookup";

export type StrJurisdiction = "city" | "county" | "other-town" | "unknown";

/** A single anonymous lookup-event row, exactly as stored and read back. */
export interface LookupEventRow {
  zip: string | null;
  createdAt: Date;
  flood: boolean;
  str: boolean;
  recovery: boolean;
  floodZone: string | null;
  strJurisdiction: StrJurisdiction | null;
}

/**
 * The shape a database query hands back: jurisdiction is `string | null`
 * because the column is free `text`. The rollup treats any value as a
 * category label — only `buildLookupEventRow` validates jurisdiction values
 * at write time.
 */
export type LookupEventRowInput = Omit<LookupEventRow, "strJurisdiction"> & {
  strJurisdiction: string | null;
};

/** Per-ZIP rollup for the current window, with trend vs. the prior window. */
export interface AreaRollup {
  zip: string;
  lookups: number;
  flood: number;
  str: number;
  recovery: number;
  sharePct: number;
  previousLookups: number;
  delta: number;
  trend: "up" | "down" | "flat" | "new";
}

export interface CategoryCount {
  label: string;
  lookups: number;
}

/** The complete aggregate view rendered by the Pro "Market Interest" panel. */
export interface MarketRollup {
  windowDays: number;
  totalLookups: number;
  avgPerDay: number;
  distinctZips: number;
  totalDelta: number;
  areas: AreaRollup[];
  panels: { flood: number; str: number; recovery: number };
  floodZones: CategoryCount[];
  strJurisdictions: CategoryCount[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;

function isStrJurisdiction(v: string | undefined): v is StrJurisdiction {
  return v === "city" || v === "county" || v === "other-town" || v === "unknown";
}

/** Map a completed lookup to the anonymous row we're allowed to keep. */
export function buildLookupEventRow(
  ctx: LookupContext,
  result: LookupResult,
  now: Date = new Date()
): LookupEventRow {
  return {
    zip: ctx.zip?.trim() || null,
    createdAt: now,
    flood: result.flood.status === "result",
    str: result.str.status === "result",
    recovery: result.recovery.status === "result",
    floodZone: result.flood.status === "result" ? result.flood.value ?? null : null,
    strJurisdiction:
      result.str.status === "result" && isStrJurisdiction(result.str.value)
        ? result.str.value
        : null,
  };
}

/**
 * Aggregate `current` rows into the dashboard rollup, comparing ZIP counts
 * against `previous` rows (the prior, equal-length window) for trend.
 */
export function rollupLookupRows(
  current: LookupEventRowInput[],
  previous: LookupEventRowInput[],
  windowDays: number
): MarketRollup {
  const totalLookups = current.length;
  const avgPerDay = round1(totalLookups / Math.max(windowDays, 1));

  const prevByZip = new Map<string, number>();
  for (const r of previous) {
    if (r.zip) prevByZip.set(r.zip, (prevByZip.get(r.zip) ?? 0) + 1);
  }

  const byZip = new Map<string, AreaRollup>();
  for (const r of current) {
    if (!r.zip) continue;
    let a = byZip.get(r.zip);
    if (!a) {
      a = {
        zip: r.zip,
        lookups: 0,
        flood: 0,
        str: 0,
        recovery: 0,
        sharePct: 0,
        previousLookups: prevByZip.get(r.zip) ?? 0,
        delta: 0,
        trend: "flat",
      };
      byZip.set(r.zip, a);
    }
    a.lookups += 1;
    if (r.flood) a.flood += 1;
    if (r.str) a.str += 1;
    if (r.recovery) a.recovery += 1;
  }

  const areas = [...byZip.values()]
    .map((a) => {
      a.sharePct = totalLookups === 0 ? 0 : round1((a.lookups / totalLookups) * 100);
      a.delta = a.lookups - a.previousLookups;
      a.trend =
        a.previousLookups === 0
          ? a.lookups > 0
            ? "new"
            : "flat"
          : a.delta > 0
            ? "up"
            : a.delta < 0
              ? "down"
              : "flat";
      return a;
    })
    .sort((a, b) => b.lookups - a.lookups || a.zip.localeCompare(b.zip));

  const countBy = (
    rows: LookupEventRowInput[],
    pick: (r: LookupEventRowInput) => string | null
  ): CategoryCount[] => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const k = pick(r);
      if (k) m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()]
      .map(([label, lookups]) => ({ label, lookups }))
      .sort((a, b) => b.lookups - a.lookups || a.label.localeCompare(b.label));
  };

  return {
    windowDays,
    totalLookups,
    avgPerDay,
    distinctZips: byZip.size,
    totalDelta: totalLookups - previous.length,
    areas,
    panels: {
      flood: current.filter((r) => r.flood).length,
      str: current.filter((r) => r.str).length,
      recovery: current.filter((r) => r.recovery).length,
    },
    floodZones: countBy(current, (r) => r.floodZone),
    strJurisdictions: countBy(current, (r) => r.strJurisdiction),
  };
}
