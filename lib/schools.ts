/**
 * School attendance-zone lookup — Buncombe County school-district boundaries.
 *
 * Source: "Buncombe County School Districts" (layer 8 of the
 * Boundaries/BuncombeCountySchoolDistricts service), the county dataset
 * mirrored on the City of Asheville's public GIS host:
 *   https://gis.ashevillenc.gov/server/rest/services/Boundaries/BuncombeCountySchoolDistricts/FeatureServer/8
 * Layer fields (verified live against the layer definition 2026-10-08):
 *   objectid | descr | elementary | intermediate | middle | high
 * (Note: `descr`, not the old county layer's `Description`.)
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
const OUT_FIELDS = "descr,elementary,intermediate,middle,high";

export const SCHOOL_DISCLAIMER =
  "Attendance zones change — verify with the school district directly before relying on this for a decision. The county's own School District Mapping page instructs users to obtain official verification through Buncombe County Schools.";

const clean = (v: string | number | null | undefined): string =>
  String(v ?? "").trim();

/**
 * Build the panel message from the county layer's polygon attributes.
 * Pure — unit-testable. Every level is shown verbatim from the record;
 * levels the record leaves blank are shown as blank, never inferred.
 */
export function buildSchoolMessage(attrs: {
  descr?: string | number | null;
  description?: string | number | null;
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

  const desc = clean(attrs.descr ?? attrs.description);
  if (parts.length === 0) {
    // Real polygon, but the record carries no school names: say exactly that.
    return (
      "The county's school-district boundary layer has a polygon at this location" +
      (desc ? ` (record: ${desc})` : "") +
      " but no school names are filled in for it — a data gap, not an absence of schools. Verify directly with the school district."
    );
  }

  const district = desc ? ` District record: ${desc}.` : "";
  return `Attendance assignment on record for this location (Buncombe Co. GIS school-district boundaries): ${parts.join(" · ")}.${district} This county layer carries both Buncombe County Schools and Asheville City Schools assignments.`;
}

/**
 * Look up the school attendance-zone assignment for a point via point-in-polygon
 * against the county's public School District Boundaries feature service.
 */
export async function lookupSchoolZone(
  lat: number,
  lon: number
): Promise<SchoolResult> {
  const data = await queryPoint(
    BUNCOMBE_ROOT,
    SCHOOL_DISTRICTS_LAYER,
    lat,
    lon,
    OUT_FIELDS
  );
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
        lastUpdated: "County dataset via City of Asheville GIS",
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
      lastUpdated: "County dataset via City of Asheville GIS",
    },
    disclaimer: SCHOOL_DISCLAIMER,
  };
}
