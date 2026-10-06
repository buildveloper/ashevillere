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

import { queryPoint } from "./arcgis";

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

/**
 * Normalize a zoning district code for comparison.
 *
 * The Buncombe/Asheville GIS (layer 31, DISTRICTS) stores codes WITHOUT
 * hyphens — "RS4", "RM16", "RS8" — while this rule set is written in the
 * ordinance's hyphenated form ("RS-4", "RM-16"). Comparing the raw strings
 * meant every hyphenated code silently never matched. Normalize BOTH sides
 * (uppercase + strip every non-alphanumeric character) so "RS-4", "RS4" and
 * "rs4" all compare equal. Audit result: RS-2/RS-4/RS-8/RM-6/RM-8/RM-16 were
 * all affected, not just RS4.
 */
export function normalizeDistrict(code?: string | null): string {
  return (code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Build a normalized membership set from ordinance-form district codes. */
function districtSet(codes: string[]): Set<string> {
  return new Set(codes.map(normalizeDistrict));
}

/**
 * Asheville zoning districts that are "resort" (where whole-home STR allowed).
 *
 * Updated to the real district codes found in the live City of Asheville
 * zoning layer (ZoningDistricts FeatureServer/11, field `districts`): the two
 * codes that exist are exactly "RESORT" and "RES EXP". The previous list
 * ("RES", "RSC") matched nothing in the live data — a RESORT-zoned parcel
 * was misreported as a prohibited zone. Codes are compared through
 * normalizeDistrict(), so "RES EXP" and any hyphen/space variant all match.
 * Note: the city's published STVR guidance names only the "Resort Zoning
 * District"; RES EXP ("Residential Expansion") is included per the product
 * owner's confirmed decision — verify with the city before relying on it.
 */
const RESORT_DISTRICTS = districtSet(["RESORT", "RES EXP"]);
/**
 * Asheville zoning districts that are residential (where homestay may apply).
 *
 * RMX (residential mixed-use) belongs HERE, not in RESORT_DISTRICTS. It is a
 * residential district, so a whole-home STR is not permitted under the 2018
 * ordinance and only an owner-occupied homestay applies. Listing it in both
 * sets made an RMX parcel report as resort-eligible (whole-home STR "may be
 * permitted") — a policy error — so RESORT_DISTRICTS is the non-authoritative
 * list and RMX is removed from it. RESIDENTIAL_DISTRICTS is authoritative.
 */
const RESIDENTIAL_DISTRICTS = districtSet([
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
  const data = await queryPoint(BUNCOMBE_ROOT, CITIES_LAYER, lat, lon, "DESCRIPTION,DISTCODE");
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
    const data = await queryPoint(BUNCOMBE_ROOT, ASHEVILLE_ZONING_LAYER, lat, lon, "DISTRICTS");
    const code = data?.features?.[0]?.attributes?.DISTRICTS;
    if (code) return { code: String(code).trim(), layerName: "City of Asheville Zoning" };
    return null;
  }
  if (jur.kind === "other-town") {
    // Try the matching town zoning layer.
    for (const [layerId, town] of Object.entries(OTHER_TOWN_ZONING)) {
      const data = await queryPoint(BUNCOMBE_ROOT, Number(layerId), lat, lon, "*");
      const code = data?.features?.[0]?.attributes?.ZONING_CODE;
      if (code) return { code: String(code).trim(), layerName: `${town} Zoning` };
    }
    return null;
  }
  // County.
  const data = await queryPoint(BUNCOMBE_ROOT, COUNTY_ZONING_LAYER, lat, lon, "ZONING_CODE");
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
    const code = normalizeDistrict(z);
    const isResort = RESORT_DISTRICTS.has(code);
    const isResidential = RESIDENTIAL_DISTRICTS.has(code);
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
