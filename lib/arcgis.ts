/**
 * Shared ArcGIS REST helpers — the single mechanism used for every
 * point-in-polygon / point query against Buncombe County GIS (and FEMA's
 * NFHL MapServer). Live-tested pattern: `esriGeometryPoint` + `inSR=4326` +
 * `esriSpatialRelIntersects`; the server does the geometry, so no polygon
 * data ever crosses the wire.
 *
 * Used by: STR jurisdiction/zoning (lib/str.ts), flood zones (lib/flood.ts),
 * and the Buncombe boundary gate (lib/boundary.ts).
 */

/** Fetch with explicit timeout + retry once. Returns Response or null. */
export async function fetchWithRetry(
  url: string,
  timeoutMs = 10000
): Promise<Response | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(timeoutMs),
        headers: { Accept: "application/json" },
      });
      return res;
    } catch {
      if (attempt === 1) return null;
    }
  }
  return null;
}

export interface ArcGisFeature {
  attributes?: Record<string, string | number | null>;
}

export interface ArcGisResponse {
  features?: ArcGisFeature[];
  error?: { message?: string };
}

/**
 * Query an ArcGIS layer for the feature at a point. `base` is the service
 * root (e.g. https://gis.buncombecounty.org/arcgis/rest/services/bcmap_vt/MapServer);
 * `layerId` is the layer index within it.
 */
export async function queryPoint(
  base: string,
  layerId: number,
  lat: number,
  lon: number,
  outFields: string,
  timeoutMs = 10000
): Promise<ArcGisResponse | null> {
  const url = new URL(`${base}/${layerId}/query`);
  url.searchParams.set("geometry", `${lon},${lat}`);
  url.searchParams.set("geometryType", "esriGeometryPoint");
  url.searchParams.set("inSR", "4326");
  url.searchParams.set("spatialRel", "esriSpatialRelIntersects");
  url.searchParams.set("where", "1=1");
  url.searchParams.set("outFields", outFields);
  url.searchParams.set("returnGeometry", "false");
  url.searchParams.set("f", "json");
  const res = await fetchWithRetry(url.toString(), timeoutMs);
  if (!res || !res.ok) return null;
  try {
    return (await res.json()) as ArcGisResponse;
  } catch {
    return null;
  }
}
