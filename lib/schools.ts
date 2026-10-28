/**
 * School attendance-zone lookup — Buncombe County school-district boundaries.
 *
 * Source: "Buncombe County School Districts" (layer 8 of the
 * Boundaries/BuncombeCountySchoolDistricts service), the county dataset
 * mirrored on the City of Asheville's public GIS host:
 *   https://gis.ashevillenc.gov/server/rest/services/Boundaries/BuncombeCountySchoolDistricts/FeatureServer/8
 * Layer fields (verified live against the layer definition 2026-10-08):
 *   objectid | descr | elementary | intermediate | middle | high
 * The panel reads only the four assignment fields — `descr` is the district
 * type ("ASHEVILLE CITY", a county zone label) and is not shown.
 *
 * The layer publishes no `editingInfo` block (verified 2026-10-28), so
 * `getLayerLastEditDate()` returns null today and the citation states that
 * plainly rather than inventing a date.
 *
 * Why the city host: the county's own copy
 * (gis.buncombecounty.org .../opendata_2/FeatureServer/6) returns HTTP 500
 * "featureserver not found" from every network tried (2026-10-08) — the
 * county's on-prem service is down, not renamed. The city-hosted mirror
 * serves the same county dataset (renderer breaks out ASHEVILLE CITY plus
 * every county elementary zone) and answers point queries with real
 * assignments. If the county service recovers, prefer it; until then this
 * is the working public source.
 *
 * Same honesty contract as the flood/STR/recovery panels: a real result only
 * after a successful fetch; an explicit unavailable state otherwise; never a
 * guessed assignment.
 *
 * Attendance zones change and are only informative — the county's School
 * District Mapping page (gis.buncombenc.gov/schools) itself instructs users
 * to obtain official verification directly through Buncombe County Schools.
 */

import { queryPoint } from "./arcgis";

export type SchoolStatus = "result" | "unavailable" | "error";

export interface SchoolResult {
  status: SchoolStatus;
  /** Human-readable summary. */
  message?: string;
  /** Source citation — only present when real data was fetched. */
  source?: { label: string; url: string; lastUpdated: string };
  /** Required disclaimer: zones change, verify with the district. */
  disclaimer?: string;
}

const BUNCOMBE_ROOT =
  "https://gis.ashevillenc.gov/server/rest/services/Boundaries/BuncombeCountySchoolDistricts/FeatureServer";
const SCHOOL_DISTRICTS_LAYER = 8;
/** One 3s attempt, no retry — the schools panel must never hold the lookup. */
const SCHOOL_QUERY_TIMEOUT_MS = 3000;
const OUT_FIELDS = "elementary,intermediate,middle,high";
const LAYER_METADATA_URL = `${BUNCOMBE_ROOT}/${SCHOOL_DISTRICTS_LAYER}?f=json`;
const NO_EDIT_DATE =
  "No edit date published by the City of Asheville mirror";

export const SCHOOL_DISCLAIMER =
  "Attendance zones change — verify with the school district directly before relying on this for a decision. This layer is the City of Asheville's public GIS mirror of Buncombe County's school-district dataset; the county's own School District Mapping page instructs users to obtain official verification through Buncombe County Schools.";

const clean = (v: string | number | null | undefined): string =>
  String(v ?? "").trim();

/**
 * Build the panel message from the county layer's polygon attributes.
 * Pure — unit-testable. Only the four assignment fields are shown, each
 * verbatim from the record. Levels the record leaves blank are shown as
 * blank, never inferred.
 */
export function buildSchoolMessage(attrs: {
  elementary?: string | number | null;
  intermediate?: string | number | null;
  middle?: string | number | null;
  high?: string | number | null;
}): string {
  const levels: Array<[string, string]> = [
    ["Elementary", clean(attrs.elementary)],
    ["Intermediate", clean(attrs.intermediate)],
    ["Middle", clean(attrs.middle)],
    ["High", clean(attrs.high)],
  ];

  const parts = levels
    .filter(([, v]) => v !== "")
    .map(([k, v]) => `${k} — ${v}`);

  if (parts.length === 0) {
    // Real polygon, but the record carries no school names: say exactly that.
    return (
      "The county's school-district boundary layer has a polygon at this location" +
      " but no school names are filled in for it — a data gap, not an absence of schools. Verify directly with the school district."
    );
  }

  return `Attendance assignment on record for this location (Buncombe Co. GIS school-district boundaries): ${parts.join(" · ")}.`;
}

/**
 * Read the layer's `editingInfo.lastEditDate` — the only edit-tracking date
 * ArcGIS would publish. The live layer has no `editingInfo` block today, so
 * this returns null and the caller shows an explicit non-date. Cached: 1h for
 * a real date, 5min for null so a transient failure doesn't stick.
 */
let editDateCache: { value: string | null; expires: number } | null = null;

export async function getLayerLastEditDate(): Promise<string | null> {
  const now = Date.now();
  if (editDateCache && now < editDateCache.expires) return editDateCache.value;

  let value: string | null = null;
  try {
    const res = await fetch(LAYER_METADATA_URL, {
      signal: AbortSignal.timeout(2000),
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        editingInfo?: { lastEditDate?: number | string | null };
      };
      value = toIsoDate(data.editingInfo?.lastEditDate);
    }
  } catch {
    value = null;
  }

  editDateCache = {
    value,
    expires: now + (value ? 60 * 60 * 1000 : 5 * 60 * 1000),
  };
  return value;
}

/** ArcGIS epoch-ms (or ISO string) → YYYY-MM-DD; null when absent/invalid. */
function toIsoDate(raw: number | string | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;
  const ms =
    typeof raw === "number"
      ? raw
      : /^\d+$/.test(raw)
        ? Number(raw)
        : Date.parse(raw);
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

/**
 * Look up the school attendance-zone assignment for a point via point-in-polygon
 * against the county's public School District Boundaries feature service.
 */
export async function lookupSchoolZone(
  lat: number,
  lon: number
): Promise<SchoolResult> {
  // The citation date is independent of the point query — fetch both in
  // parallel so the metadata read never adds latency to this panel.
  const [data, editDate] = await Promise.all([
    queryPoint(
      BUNCOMBE_ROOT,
      SCHOOL_DISTRICTS_LAYER,
      lat,
      lon,
      OUT_FIELDS,
      SCHOOL_QUERY_TIMEOUT_MS,
      1
    ),
    getLayerLastEditDate(),
  ]);
  const lastUpdated = editDate ?? NO_EDIT_DATE;

  if (!data) {
    return {
      status: "unavailable",
      message:
        "Buncombe County's GIS service is temporarily unreachable. We're not showing guessed data — check the county's School District Mapping page or call the school district.",
    };
  }
  const attrs = data.features?.[0]?.attributes;
  if (!attrs) {
    // The service answered but no polygon covers this point: a real answer
    // ("no zone on record here"), not a failure — state it plainly.
    return {
      status: "result",
      message:
        "The county's school-district boundary layer shows no attendance-zone polygon at this point — a data gap, not an absence of schools. Verify directly with the school district.",
      source: {
        label: "Buncombe Co. School Districts (city-hosted county mirror)",
        url: "https://gis.ashevillenc.gov/server/rest/services/Boundaries/BuncombeCountySchoolDistricts/FeatureServer/8",
        lastUpdated,
      },
      disclaimer: SCHOOL_DISCLAIMER,
    };
  }

  return {
    status: "result",
    message: buildSchoolMessage(attrs),
    source: {
      label: "Buncombe Co. School Districts (city-hosted county mirror)",
      url: "https://gis.ashevillenc.gov/server/rest/services/Boundaries/BuncombeCountySchoolDistricts/FeatureServer/8",
      lastUpdated,
    },
    disclaimer: SCHOOL_DISCLAIMER,
  };
}
