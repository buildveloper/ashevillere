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

/**
 * Fetch with explicit timeout and a caller-controlled attempt count.
 * Returns the Response (even non-ok) or null once every attempt has failed.
 * `attempts = 1` disables the retry — used by the schools panel, which is
 * capped at a single 3s call.
 */
export async function fetchWithRetry(
  url: string,
  timeoutMs = 10000,
  attempts = 2
): Promise<Response | null> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(timeoutMs),
        headers: { Accept: "application/json" },
      });
      return res;
    } catch {
      if (attempt === attempts - 1) return null;
    }
  }
  return null;
}

export interface ArcGisFeature {
  attributes?: Record<string, string | number | null>;
}

export interface ArcGisResponse {
  features?: ArcGisFeature[];
  error?: { code?: number; message?: string; details?: string[] };
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
  timeoutMs = 10000,
  attempts = 2
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
  const res = await fetchWithRetry(url.toString(), timeoutMs, attempts);
  if (!res || !res.ok) return null;
  try {
    const data = (await res.json()) as ArcGisResponse;
    // ArcGIS reports many query failures as HTTP 200 with an error envelope.
    // That is a failed query, not an empty result — callers must not turn it
    // into a normal negative ("no feature at this point").
    if (data?.error) return null;
    // A successful layer query always returns a features array (possibly
    // empty). A response without one is malformed, not a zero-row answer.
    if (!Array.isArray(data?.features)) return null;
    return data;
  } catch {
    return null;
  }
}
