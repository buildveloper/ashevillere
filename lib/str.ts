/**
 * Short-term rental (STR) eligibility — Buncombe County / Asheville GIS.
 *
 * Spec (docs/rebuild-spec.md Phase 1):
 * - Determine jurisdiction: City of Asheville vs. unincorporated Buncombe
 *   County (this changes everything).
 * - Pull the zoning district for the parcel from county/city GIS data.
 * - Apply the hardcoded rule set:
 *   - Whole-home STRs (rented entirely, <30 days) are prohibited in Asheville
 *     city limits outside designated resort zoning districts (2018 ordinance).
 *   - "Homestays" (owner-occupied, 1-2 rooms rented) are permitted in
 *     residential zones with a city permit.
 *   - Unincorporated Buncombe County has materially different, generally more
 *     permissive rules — flag this distinction clearly.
 *   - HOA covenants can further restrict STRs independent of city/county
 *     zoning, and the tool can't check those — say so explicitly.
 * - Public homestay permit registry: only surfaced if it exists and is
 *   reliably structured. Otherwise show zoning eligibility and say permit
 *   status must be confirmed directly with the city. Never fabricate it.
 *
 * Same honesty contract as the flood panel: real CHECKED only on a real
 * successful fetch; explicit UNAVAILABLE (retry once, then fail) otherwise.
 *
 * Data sources (Buncombe County GIS, canonical per spec):
 *   Layer 27 — Cities and Towns (jurisdiction)
 *   Layer 31 — City of Asheville Zoning (zoning within city limits)
 *   Layer 19 — Buncombe County Zoning (zoning in unincorporated county)
 *   Layer 59/61/66 — Woodfin / Black Mountain / Montreat zoning (other towns)
 */

export type StrStatus = "result" | "unavailable" | "error";

export interface StrResult {
  status: StrStatus;
  /** Machine-readable classification. */
  value?: "city" | "county" | "other-town" | "unknown";
  /** Human-readable summary. */
  message?: string;
  /** Zoning district code when available. */
  zoning?: string;
  /** Whether a homestay permit registry was checked and found. */
  permitRegistry?: "found" | "not-found" | "unchecked";
  /** Source citation — only present when real data was fetched. */
  source?: { label: string; url: string; lastUpdated: string };
}

const BUNCOMBE_ROOT =
  "https://gis.buncombecounty.org/arcgis/rest/services/bcmap_vt/MapServer";

const CITIES_LAYER = 27;
const COUNTY_ZONING_LAYER = 19;
const ASHEVILLE_ZONING_LAYER = 31;
const OTHER_TOWN_ZONING: Record<number, string> = {
  59: "Woodfin",
  61: "Black Mountain",
  66: "Montreat",
};

/** Asheville zoning districts that are "resort" (where whole-home STR allowed). */
const RESORT_DISTRICTS = new Set(["RES", "RSC", "RMX"]);
/** Asheville zoning districts that are residential (where homestay may apply). */
const RESIDENTIAL_DISTRICTS = new Set([
  "RS-2",
  "RS-4",
  "RS-8",
  "RM-6",
  "RM-8",
  "RM-16",
  "RMX",
  "R-1",
  "R-2",
  "R-3",
  "R-4",
  "R-5",
  "R-6",
]);

const DISCLAIMER =
  "HOA covenants can further restrict short-term rentals independent of city/county zoning — this tool cannot check those.";

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

interface ArcGisFeature {
  attributes?: Record<string, string | number | null>;
}

interface ArcGisResponse {
  features?: ArcGisFeature[];
  error?: { message?: string };
}

/** Query an ArcGIS layer for the feature at a point. */
async function queryPoint(
  layerId: number,
  lat: number,
  lon: number,
  outFields: string
): Promise<ArcGisResponse | null> {
  const url = new URL(`${BUNCOMBE_ROOT}/${layerId}/query`);
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
 * Determine jurisdiction via the Cities and Towns layer (27). A feature with
 * a non-empty DESCRIPTION/DISTCODE means inside that municipality; the
 * empty-DESCRIPTION polygon (OBJECTID 1) is unincorporated county.
 */
async function jurisdiction(
  lat: number,
  lon: number
): Promise<
  { kind: "city" | "county" | "other-town"; name: string; distCode?: string } | null
> {
  const data = await queryPoint(CITIES_LAYER, lat, lon, "DESCRIPTION,DISTCODE");
  if (!data) return null;
  const attrs = data.features?.[0]?.attributes;
  if (!attrs) return null;
  const name = String(attrs.DESCRIPTION ?? "").trim();
  const distCode = String(attrs.DISTCODE ?? "").trim();
  if (!name && !distCode) {
    return { kind: "county", name: "Unincorporated Buncombe County" };
  }
  if (/ASHEVILLE/i.test(name) || distCode === "CAS") {
    return { kind: "city", name, distCode };
  }
  return { kind: "other-town", name, distCode };
}

/** Pull the zoning district for the parcel. */
async function zoning(
  lat: number,
  lon: number,
  jur: Awaited<ReturnType<typeof jurisdiction>>
): Promise<{ code: string; layerName: string } | null> {
  if (!jur) return null;
  if (jur.kind === "city") {
    const data = await queryPoint(ASHEVILLE_ZONING_LAYER, lat, lon, "DISTRICTS");
    const code = data?.features?.[0]?.attributes?.DISTRICTS;
    if (code) return { code: String(code).trim(), layerName: "City of Asheville Zoning" };
    return null;
  }
  if (jur.kind === "other-town") {
    // Try the matching town zoning layer.
    for (const [layerId, town] of Object.entries(OTHER_TOWN_ZONING)) {
      const data = await queryPoint(Number(layerId), lat, lon, "*");
      const code = data?.features?.[0]?.attributes?.ZONING_CODE;
      if (code) return { code: String(code).trim(), layerName: `${town} Zoning` };
    }
    return null;
  }
  // County.
  const data = await queryPoint(COUNTY_ZONING_LAYER, lat, lon, "ZONING_CODE");
  const code = data?.features?.[0]?.attributes?.ZONING_CODE;
  if (code) return { code: String(code).trim(), layerName: "Buncombe County Zoning" };
  return null;
}

/**
 * Check the City of Asheville open data portal for a homestay permit registry.
 * Only returns "found" if a real dataset is reachable and structured;
 * otherwise "unchecked" — never fabricated permit status.
 * Single attempt, tight timeout: best-effort only, must not stall the lookup.
 */
async function checkHomestayRegistry(): Promise<"found" | "not-found" | "unchecked"> {
  try {
    const url = new URL("https://data.ashevillenc.gov/api/3/action/package_search");
    url.searchParams.set("q", "homestay");
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(3000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return "unchecked";
    const data = (await res.json()) as { success?: boolean; result?: { count?: number } };
    if (data.success && (data.result?.count ?? 0) > 0) return "found";
    return "not-found";
  } catch {
    return "unchecked";
  }
}

/**
 * Apply the hardcoded STR rule set (docs/rebuild-spec.md) to a
 * jurisdiction + zoning pair. Pure — unit-testable.
 */
export function applyStrRules(input: {
  jurisdiction: "city" | "county" | "other-town";
  jurisdictionName: string;
  zoning?: string;
  permitRegistry: "found" | "not-found" | "unchecked";
}): { value: StrResult["value"]; message: string } {
  const parts: string[] = [];
  const { jurisdiction: jur, jurisdictionName: name, zoning: z, permitRegistry } = input;

  if (jur === "city") {
    const isResort = RESORT_DISTRICTS.has(z ?? "");
    const isResidential = RESIDENTIAL_DISTRICTS.has(z ?? "");
    if (isResort) {
      parts.push(
        `Inside Asheville city limits (${name}), zoning ${z || "unknown"} — a resort district. Whole-home short-term rentals may be permitted here under the 2018 ordinance.`
      );
    } else {
      parts.push(
        `Inside Asheville city limits (${name}), zoning ${
          z || "unknown"
        }. Whole-home short-term rentals are generally prohibited outside resort districts (2018 ordinance).`
      );
    }
    if (isResidential) {
      parts.push(
        "Owner-occupied homestays (1-2 rooms) may be permitted in residential zones with a city permit."
      );
    } else if (!isResort) {
      parts.push(
        "This is not a residential zone, so a homestay permit is unlikely to apply."
      );
    }
    parts.push(
      permitRegistry === "found"
        ? "A homestay permit registry was found on the city's open data portal — permit status can be checked there."
        : "Permit status must be confirmed directly with the City of Asheville."
    );
    // HOA caveat (always — spec requires it on every STR panel).
    parts.push(DISCLAIMER);
    return { value: "city", message: parts.join(" ") };
  }

  if (jur === "county") {
    parts.push(
      `Outside any city/town limits (${name}), zoning ${
        z ?? "unknown"
      }. Buncombe County's STR rules are materially different from Asheville's and generally more permissive — check the current county rules before relying on this.`
    );
    // HOA caveat (always — spec requires it on every STR panel).
    parts.push(DISCLAIMER);
    return { value: "county", message: parts.join(" ") };
  }

  parts.push(
    `Inside ${name} town limits, zoning ${
      z ?? "unknown"
    }. STR rules here may differ from both Asheville and unincorporated county — check with ${name} directly.`
  );
  // HOA caveat (always — spec requires it on every STR panel).
  parts.push(DISCLAIMER);
  return { value: "other-town", message: parts.join(" ") };
}

export async function lookupStrEligibility(
  lat: number,
  lon: number
): Promise<StrResult> {
  // 1) Jurisdiction (point-in-polygon) + homestay registry check run in
  // parallel — they are independent. Zoning depends on jurisdiction, so it
  // runs after (but is fast; ~1s on Vercel's network).
  const [jur, registry] = await Promise.all([
    jurisdiction(lat, lon),
    checkHomestayRegistry(),
  ]);
  if (!jur) {
    return {
      status: "unavailable",
      message:
        "Buncombe County's GIS service is temporarily unreachable. We're not showing guessed data — check the official zoning map for this address.",
    };
  }

  // 2) Zoning district.
  const zone = await zoning(lat, lon, jur);

  // Apply the hardcoded rule set.
  const applied = applyStrRules({
    jurisdiction: jur.kind,
    jurisdictionName: jur.name,
    zoning: zone?.code,
    permitRegistry: registry,
  });

  return {
    status: "result",
    value: applied.value,
    zoning: zone?.code,
    permitRegistry: registry,
    message: applied.message,
    source: {
      label: "Buncombe Co. GIS",
      url: "https://gis.buncombecounty.org",
      lastUpdated: "Current zoning overlay",
    },
  };
}
