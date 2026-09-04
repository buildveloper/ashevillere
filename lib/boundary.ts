/**
 * Buncombe County boundary gate — a genuine point-in-polygon check against
 * the county's own GIS, instead of a ZIP allowlist.
 *
 * Uses the same mechanism as STR jurisdiction (lib/str.ts): query Buncombe's
 * bcmap_vt MapServer with `esriSpatialRelIntersects` and let the county's
 * geometry engine decide. The county is covered by the Cities and Towns
 * layer (27) — municipalities plus the unincorporated remainder — so a
 * feature at the point means in-county; an empty result means outside.
 *
 * Fallback: when the service is unreachable, callers should decide from
 * BUNCOMBE_ZIPS (see lib/geocode.ts) — degraded mode, never a guess.
 */

import { queryPoint } from "./arcgis";

const BUNCOMBE_ROOT =
  "https://gis.buncombecounty.org/arcgis/rest/services/bcmap_vt/MapServer";

/** Layer whose polygons tile Buncombe County (municipalities + county). */
const BOUNDARY_LAYER = 27;

export type BoundaryStatus = "in" | "out" | "unavailable";

/**
 * Is the point inside Buncombe County? Resolved by the county's own GIS:
 * in → the point intersects a Cities-and-Towns polygon (any municipality or
 * the unincorporated county); out → no feature at the point (outside all
 * county polygons); unavailable → the county GIS couldn't be reached.
 */
export async function isBuncombePoint(
  lat: number,
  lon: number
): Promise<BoundaryStatus> {
  const data = await queryPoint(
    BUNCOMBE_ROOT,
    BOUNDARY_LAYER,
    lat,
    lon,
    "OBJECTID",
    5000
  );
  if (!data) return "unavailable";
  const features = data.features ?? [];
  return features.length > 0 ? "in" : "out";
}
