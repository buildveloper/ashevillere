/**
 * FEMA NFHL flood zone lookup — server-side proxy to the National Flood
 * Hazard Layer ArcGIS REST service (free, public, no key). Queries the
 * flood hazard zones layer (ID 28) for the zone at a point.
 *
 * If the service is unreachable we return `unavailable` with a link the UI
 * shows to the official MSC — never fabricated zone data.
 */

export type FloodStatus = "result" | "unavailable" | "error";

export interface FloodResult {
  status: FloodStatus;
  /** NFHL flood zone code (AE, AO, X, …) when available. */
  zone?: string;
  /** Human-readable summary. */
  message?: string;
  /** ISO date of the effective FIRM, when known. */
  effectiveDate?: string;
}

const NFHL_URL =
  "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query";

const ZONE_LABELS: Record<string, string> = {
  A: "Zone A — high flood risk. Flood insurance required for federally backed mortgages.",
  AE: "Zone AE — high flood risk with base flood elevation. Insurance required for federally backed mortgages.",
  AH: "Zone AH — high flood risk (ponding). Insurance required for federally backed mortgages.",
  AO: "Zone AO — high flood risk (shallow flooding). Insurance required for federally backed mortgages.",
  AR: "Zone AR — high flood risk behind a restored levee.",
  A99: "Zone A99 — protected by a levee under construction.",
  V: "Zone V — high coastal flood risk.",
  VE: "Zone VE — high coastal flood risk with base flood elevation.",
  X: "Zone X — moderate to low flood risk. Insurance is not federally required.",
  X500: "Zone X (shaded) — moderate flood risk (0.2% annual chance).",
  D: "Zone D — undetermined flood risk.",
};

export function classifyZone(zone?: string): FloodResult {
  if (!zone) {
    return {
      status: "result",
      zone: "X",
      message:
        "No flood hazard zone returned for this point — treated as moderate-to-low risk (Zone X). Verify with the official map.",
    };
  }
  const label = ZONE_LABELS[zone] ?? `Flood zone ${zone} — verify with the official map.`;
  return { status: "result", zone, message: label };
}

export async function lookupFloodZone(lat: number, lon: number): Promise<FloodResult> {
  let res: Response;
  try {
    const url = new URL(NFHL_URL);
    url.searchParams.set("geometry", `${lon},${lat}`);
    url.searchParams.set("geometryType", "esriGeometryPoint");
    url.searchParams.set("inSR", "4326");
    url.searchParams.set("spatialRel", "esriSpatialRelIntersects");
    url.searchParams.set("where", "1=1");
    url.searchParams.set("outFields", "FLD_ZONE,FLZONE,SOURCE_CIT,STATIC_BFE");
    url.searchParams.set("returnGeometry", "false");
    url.searchParams.set("f", "json");
    res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(10000),
      headers: { Accept: "application/json" },
    });
  } catch {
    return {
      status: "unavailable",
      message:
        "FEMA's flood map service is temporarily unavailable. Check the official FEMA map for this address.",
    };
  }

  if (!res.ok) {
    return {
      status: "unavailable",
      message: `FEMA returned an error (${res.status}). Check the official FEMA map.`,
    };
  }

  try {
    const data = (await res.json()) as {
      features?: Array<{
        attributes?: Record<string, string | number | null>;
      }>;
    };
    const attrs = data.features?.[0]?.attributes;
    const zone = (attrs?.FLD_ZONE ?? attrs?.FLZONE) as string | undefined;
    return classifyZone(zone);
  } catch {
    return {
      status: "unavailable",
      message: "FEMA sent an unreadable response. Check the official FEMA map.",
    };
  }
}
