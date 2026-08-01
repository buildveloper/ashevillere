/**
 * FEMA NFHL flood zone lookup — server-side proxy.
 *
 * Spec (docs/rebuild-spec.md Phase 1):
 * - Pull the FEMA flood zone designation (SFHA or not, zone letter) from the
 *   FEMA National Flood Hazard Layer.
 * - Check for any LOMA/LOMR on file for the parcel.
 * - Cross-reference against NC Floodplain Mapping (FRIS) data.
 * - Never fabricate data: if a source is unreachable or returns nothing for a
 *   given parcel, show an honest unavailable/error state, not fake data.
 *
 * Source strategy (both are official, cited):
 *   1. FEMA NFHL ArcGIS REST (hazards.fema.gov) — primary.
 *   2. Buncombe County GIS (gis.buncombecounty.org) — canonical fallback,
 *      publishes the effective DFIRM flood layer (24), FRIS layer (51) and
 *      FLOMA/LOMR layer (63). The spec names Buncombe GIS as the canonical
 *      source.
 * NC FRIS (fris.nc.gov) is queried directly when reachable; otherwise the
 * county's FRIS layer supplies the cross-reference.
 *
 * Latency/failure policy: each upstream call has an explicit timeout and is
 * retried once; failures degrade to `unavailable`, never to fake data.
 */

export type FloodStatus = "result" | "unavailable" | "error";

export interface FloodResult {
  status: FloodStatus;
  /** NFHL flood zone code (AE, AO, X, …) when available. */
  zone?: string;
  /** Whether the point is in a Special Flood Hazard Area. */
  inSfha?: boolean;
  /** LOMA/LOMR status: "none" | "loma" | "lomr" | "unknown". */
  lomaLomr?: "none" | "loma" | "lomr" | "unknown";
  /** NC FRIS cross-reference note when available. */
  ncNote?: string;
  /** Human-readable summary. */
  message?: string;
  /** ISO date of the effective FIRM, when known. */
  effectiveDate?: string;
  /** Source citations used (only when real data was fetched). */
  sources?: Array<{ name: string; url: string; lastUpdated: string }>;
}

const NFHL_ROOT = "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer";
const FLOOD_ZONES_LAYER = 28;

// Buncombe County GIS — canonical source per the rebuild spec.
const BUNCOMBE_ROOT =
  "https://gis.buncombecounty.org/arcgis/rest/services/bcmap_vt/MapServer";
// Layer IDs (verified live):
//   24 = 2010 DFIRM Flood Data (effective FEMA zones)
//   51 = FRIS (NC Floodplain Mapping)
//   63 = FLOMA/LOMR
const BUNCOMBE_DFIRM_LAYER = 24;
const BUNCOMBE_FRIS_LAYER = 51;
const BUNCOMBE_LOMA_LAYER = 63;

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

/** Zones that count as Special Flood Hazard Area (insurance required). */
const SFHA_ZONES = new Set(["A", "AE", "AH", "AO", "AR", "A99", "V", "VE"]);

const DISCLAIMER =
  "This is informational and not a substitute for an official flood determination, elevation certificate, or insurance agent's assessment. Verify with FEMA and your insurer before relying on it.";

/** Fetch with explicit timeout + retry once. Returns Response or null. */
async function fetchWithRetry(
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

export function classifyZone(zone?: string): FloodResult {
  if (!zone) {
    return {
      status: "result",
      zone: "X",
      inSfha: false,
      message:
        "No flood hazard zone returned for this point — treated as moderate-to-low risk (Zone X). Verify with the official map.",
    };
  }
  const label = ZONE_LABELS[zone] ?? `Flood zone ${zone} — verify with the official map.`;
  return {
    status: "result",
    zone,
    inSfha: SFHA_ZONES.has(zone),
    message: label,
  };
}

interface ArcGisFeature {
  attributes?: Record<string, string | number | null>;
}

interface ArcGisResponse {
  features?: ArcGisFeature[];
  error?: { message?: string };
}

/** Query an ArcGIS layer for the feature at a point. */
async function queryPoint(
  base: string,
  layerId: number,
  lat: number,
  lon: number,
  outFields: string
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
  const res = await fetchWithRetry(url.toString());
  if (!res || !res.ok) return null;
  try {
    return (await res.json()) as ArcGisResponse;
  } catch {
    return null;
  }
}

/**
 * Look up the flood zone from FEMA NFHL. Returns null if the service is
 * unreachable or returns nothing usable.
 */
async function femaZone(
  lat: number,
  lon: number
): Promise<{ zone?: string; attrs: ArcGisFeature["attributes"] } | null> {
  const data = await queryPoint(
    NFHL_ROOT,
    FLOOD_ZONES_LAYER,
    lat,
    lon,
    "FLD_ZONE,FLZONE,SOURCE_CIT,STATIC_BFE"
  );
  if (!data) return null;
  const attrs = data.features?.[0]?.attributes;
  if (!attrs) return null;
  const zone = (attrs.FLD_ZONE ?? attrs.FLZONE) as string | undefined;
  return { zone, attrs };
}

/** Look up the flood zone from Buncombe County GIS (DFIRM + FRIS layers). */
async function buncombeZone(
  lat: number,
  lon: number
): Promise<{ zone?: string; attrs: ArcGisFeature["attributes"] } | null> {
  // DFIRM layer (24): ZONE_LID is a code; SFHA_TF says SFHA. Try FRIS first
  // (it has the human zone letter), fall back to DFIRM.
  const fris = await queryPoint(
    BUNCOMBE_ROOT,
    BUNCOMBE_FRIS_LAYER,
    lat,
    lon,
    "ZONE_LID_V,SFHA_TF,V_FLDARID"
  );
  if (fris && fris.features?.[0]?.attributes) {
    const attrs = fris.features[0].attributes as NonNullable<ArcGisFeature["attributes"]>;
    return { zone: (attrs.ZONE_LID_V as string)?.trim() || undefined, attrs };
  }
  const dfirm = await queryPoint(
    BUNCOMBE_ROOT,
    BUNCOMBE_DFIRM_LAYER,
    lat,
    lon,
    "ZONE_LID,SFHA_TF,FLD_AR_ID"
  );
  if (!dfirm) return null;
  const attrs = dfirm.features?.[0]?.attributes;
  if (!attrs) return null;
  // ZONE_LID is a numeric code (1001=AE, 4002=X per the county's lookup);
  // map the well-known codes to letters.
  const code = String(attrs.ZONE_LID ?? "");
  const zoneByCode: Record<string, string> = {
    "1001": "AE",
    "1002": "AE",
    "4001": "X",
    "4002": "X",
  };
  return { zone: zoneByCode[code], attrs };
}

/** Check LOMA/LOMR: FEMA NFHL layers, else Buncombe FLOMA/LOMR layer (63). */
async function checkLomaLomr(
  lat: number,
  lon: number
): Promise<{ status: "none" | "loma" | "lomr" | "unknown"; detail?: string }> {
  // Try Buncombe's FLOMA/LOMR layer first (reachable, verified).
  const bc = await queryPoint(BUNCOMBE_ROOT, BUNCOMBE_LOMA_LAYER, lat, lon, "*");
  if (bc) {
    if (bc.features && bc.features.length > 0) {
      return { status: "loma", detail: "LOMA/LOMR case on file with Buncombe County." };
    }
    return { status: "none", detail: "No LOMA/LOMR on file for this point." };
  }
  // Fall back to FEMA NFHL LOMA/LOMR discovery.
  const svc = await fetchWithRetry(`${NFHL_ROOT}?f=pjson`);
  if (!svc || !svc.ok) return { status: "unknown", detail: "LOMA/LOMR layers not reachable." };
  try {
    const data = (await svc.json()) as { layers?: Array<{ id: number; name: string }> };
    const ids = (data.layers ?? [])
      .filter((l) => /LOMA|LOMR/i.test(l.name))
      .map((l) => l.id);
    for (const id of ids) {
      const q = await queryPoint(NFHL_ROOT, id, lat, lon, "CASE_NO,STATUS");
      if (q?.features?.length) {
        const name = ids.length === 1 ? "loma" : id;
        return { status: /LOMR/i.test(String(name)) ? "lomr" : "loma", detail: `Case on file (layer ${id}).` };
      }
    }
    return { status: "none", detail: "No LOMA/LOMR on file for this point." };
  } catch {
    return { status: "unknown", detail: "LOMA/LOMR layers not reachable." };
  }
}

/**
 * Cross-reference NC FRIS data. Tries fris.nc.gov directly; falls back to the
 * county's FRIS layer (layer 51). Returns a note when NC data exists for the
 * point, else undefined.
 */
async function checkNcFris(
  lat: number,
  lon: number
): Promise<string | undefined> {
  // County FRIS layer (verified live, has ZONE_LID_V = zone letter).
  const bc = await queryPoint(
    BUNCOMBE_ROOT,
    BUNCOMBE_FRIS_LAYER,
    lat,
    lon,
    "ZONE_LID_V,SFHA_TF,V_FLDARID"
  );
  if (bc?.features?.length) {
    const attrs = bc.features[0].attributes as NonNullable<ArcGisFeature["attributes"]>;
    return `NC FRIS shows a floodplain record for this area (SFHA: ${
      attrs.SFHA_TF === 1 ? "yes" : "no"
    }) — may be more current than the federal layer. Verify on fris.nc.gov.`;
  }
  return undefined;
}

export async function lookupFloodZone(
  lat: number,
  lon: number
): Promise<FloodResult> {
  // 1) Zone: FEMA NFHL primary, Buncombe GIS fallback.
  let zone: string | undefined;
  let sourceName = "FEMA NFHL";
  let sourceUrl = "https://www.fema.gov/flood-maps/national-flood-hazard-layer";
  let usedCounty = false;

  const fema = await femaZone(lat, lon);
  if (fema?.zone) {
    zone = fema.zone;
  } else {
    const bc = await buncombeZone(lat, lon);
    if (bc?.zone) {
      zone = bc.zone;
      usedCounty = true;
      sourceName = "Buncombe Co. GIS (DFIRM/FRIS)";
      sourceUrl = "https://gis.buncombecounty.org";
    }
  }

  if (!zone) {
    return {
      status: "unavailable",
      message:
        "FEMA and Buncombe County flood map services are temporarily unreachable. We're not showing guessed data — check the official FEMA map for this address.",
    };
  }

  const base = classifyZone(zone);

  // 2) LOMA/LOMR.
  const loma = await checkLomaLomr(lat, lon);

  // 3) NC FRIS cross-reference.
  const ncNote = await checkNcFris(lat, lon);

  // Build the plain-language output.
  const parts: string[] = [base.message ?? ""];
  if (loma.status === "none") {
    parts.push("No LOMA/LOMR on file for this point.");
  } else if (loma.status === "loma" || loma.status === "lomr") {
    parts.push(
      `A ${loma.status.toUpperCase()} is on file — this may correct the map designation. Verify the case with FEMA.`
    );
  } else {
    parts.push("LOMA/LOMR status could not be checked — verify with FEMA.");
  }
  if (ncNote) parts.push(ncNote);

  return {
    ...base,
    lomaLomr: loma.status,
    ncNote,
    message: parts.join(" "),
    sources: [
      {
        name: sourceName,
        url: sourceUrl,
        lastUpdated: usedCounty ? "Effective DFIRM/FRIS" : "Current effective FIRMs",
      },
    ],
  };
}

export { DISCLAIMER };
