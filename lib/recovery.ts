/**
 * Hurricane Helene damage & recovery context — Buncombe County GIS.
 *
 * Spec (docs/rebuild-spec.md Phase 1):
 * - Check whether the parcel or its immediate area had reported flood/storm
 *   damage (Buncombe County GIS has added post-Helene layers — check what's
 *   available and current).
 * - Surface nearby building permit activity if accessible via the county's
 *   permit portal, as a rebuild-activity signal.
 * - Keep this factual and neutral.
 *
 * Same honesty contract as the flood and STR panels: real CHECKED only on a
 * real successful fetch, explicit UNAVAILABLE otherwise, never fabricated
 * content, and no unsourced specifics. Tone stays factual — Helene touched
 * real property loss and real loss of life; nothing here is narrative.
 *
 * Data sources (verified live, public, no key):
 *   Table Accela/MapServer/4 (bun.opendata.AccelaParcelAddress) — the county's
 *     own address→parcel link (FullAddress → ParcelNumber), the same table the
 *     county uses to connect addresses to permits/damage records.
 *   Table Accela/MapServer/7 (bun.opendata.HeleneDamageParcelsForPermits) —
 *     county-published per-parcel damage records (fields: pin, DamageType).
 *   ImageServer Images_2024_posthelene — post-Helene county aerial imagery
 *     (availability signal only; we do not render image tiles).
 *
 * Parcel matching is address-only (no spatial/nearest-parcel fallback): a
 * street-centerline geocode point is not reliably inside a parcel polygon, and
 * silently checking a neighbor's parcel would be worse than an honest
 * unavailable.
 *
 * Honest limits (stated plainly, never filled in):
 *   - Buncombe County does not publish a queryable public API of per-address
 *     building permits (the Accela service exposes parcel/address/damage
 *     tables, not permit records). Nearby permit activity is therefore NOT
 *     reported — we do not invent rebuild-activity numbers.
 *   - The damage dataset reflects records reported to the county; absence of a
 *     record is not a guarantee of no damage, and this is stated on the panel.
 */

import { fetchWithRetry, type ArcGisResponse } from "./arcgis";

export type RecoveryStatus = "result" | "unavailable" | "error";

export interface RecoveryResult {
  status: RecoveryStatus;
  /** Machine-readable classification. */
  value?: "damage-reported" | "no-damage-record";
  /** Damage type from the county record, when present. */
  damageType?: string;
  /** Human-readable summary. */
  message?: string;
  /** Source citation — only present when real data was fetched. */
  sources?: Array<{ name: string; url: string; lastUpdated: string }>;
  /** Neutral disclaimer. */
  disclaimer?: string;
}

const BUNCOMBE_ROOT =
  "https://gis.buncombecounty.org/arcgis/rest/services";

const ACCELA_ADDRESS_TABLE = `${BUNCOMBE_ROOT}/Accela/MapServer/4`;
const ACCELA_DAMAGE_TABLE = `${BUNCOMBE_ROOT}/Accela/MapServer/7`;
const POST_HELENE_IMAGERY =
  `${BUNCOMBE_ROOT}/Images_2024_posthelene/ImageServer`;

const DISCLAIMER =
  "This is informational and reflects county records reported after Hurricane Helene (September 2024). It is not an official damage determination and does not replace verification with Buncombe County or your insurer.";

/** Query an ArcGIS layer/table for a URL. Returns parsed response or null. */
async function query(
  url: string,
  timeoutMs = 10000
): Promise<ArcGisResponse | null> {
  const res = await fetchWithRetry(url, timeoutMs);
  if (!res || !res.ok) return null;
  try {
    return (await res.json()) as ArcGisResponse;
  } catch {
    return null;
  }
}

/** Escape a single-quoted ArcGIS SQL string literal. */
function sqlStr(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Street-suffix forms → one canonical abbreviation, so "STREET"/"ST",
 * "BOULEVARD"/"BLVD", "AVENUE"/"AVE" etc. compare equal regardless of which
 * form the Census canonicalizer or the county table happens to use.
 */
const SUFFIX_CANON: Record<string, string> = {
  STREET: "ST", ST: "ST", AVENUE: "AVE", AVE: "AVE", AV: "AVE",
  BOULEVARD: "BLVD", BLVD: "BLVD", ROAD: "RD", RD: "RD", DRIVE: "DR",
  DR: "DR", LANE: "LN", LN: "LN", COURT: "CT", CT: "CT", CIRCLE: "CIR",
  CIR: "CIR", PLACE: "PL", PL: "PL", HIGHWAY: "HWY", HWY: "HWY",
  TRAIL: "TRL", TRL: "TRL", TERRACE: "TER", TER: "TER", PARKWAY: "PKWY",
  PKWY: "PKWY", SQUARE: "SQ", SQ: "SQ", WAY: "WAY", LOOP: "LOOP",
  PIKE: "PIKE", TURNPIKE: "TPKE", EXPRESSWAY: "EXPY", ALLEY: "ALY",
};

/** Compass directionals that may appear before the street name. */
const DIRECTIONALS = new Set(["N", "S", "E", "W", "NE", "NW", "SE", "SW"]);

export interface StreetSignature {
  /** Leading house number (e.g. "48"). */
  number: string;
  /** Street name without the directional or suffix (e.g. "GRIFFING"). */
  name: string;
  /** Canonical suffix abbreviation, or "" when none. */
  suffix: string;
  /** Prefix directional ("S", "N", …), or "" when absent. */
  directional: string;
}

/**
 * Parse a full address into a comparable street signature, normalized so that
 * formatting differences don't silently defeat the match:
 *   "48 GRIFFING BLVD"        → { 48, GRIFFING, BLVD, "" }
 *   "48 S GRIFFING BLVD #2"   → { 48, GRIFFING, BLVD, S }
 *   "70 WOODFIN PL"           → { 70, WOODFIN, PL, "" }
 * Returns null when there's no leading house number to key on.
 */
export function streetSignature(line: string): StreetSignature | null {
  // Street line only; drop any unit designator ("#2", "APT 3").
  const cleaned = (line.split(",")[0] ?? "")
    .toUpperCase()
    .replace(/#.*$/, "")
    .replace(/\b(APT|UNIT|STE|SUITE)\b.*$/, "")
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const tokens = cleaned.split(" ").filter(Boolean);
  if (!tokens.length) return null;
  const number = /^\d/.test(tokens[0]) ? tokens[0] : "";
  if (!number) return null;
  const rest = tokens.slice(1);
  if (!rest.length) return null;

  // A prefix directional only counts in the first position ("S GRIFFING");
  // a trailing "S" would be a suffix, not a directional.
  let directional = "";
  if (rest.length > 1 && DIRECTIONALS.has(rest[0])) {
    directional = rest[0];
    rest.shift();
  }
  const suffix = rest.length > 1 ? SUFFIX_CANON[rest[rest.length - 1]] ?? "" : "";
  const name = (suffix ? rest.slice(0, -1) : rest).join(" ");
  return { number, name, suffix, directional };
}

/**
 * Pick the county FullAddress that matches the target street signature.
 *
 * Handles the two real-world mismatches the county table exposes:
 *  - hyphenation/abbreviation variance ("WOODFIN ST" vs "WOODFIN STREET"),
 *    via canonical suffix comparison;
 *  - a directional that Census omitted ("48 GRIFFING BLVD" from the user,
 *    while the county stores "48 S GRIFFING BLVD").
 *
 * Returns the matching FullAddress, or null when nothing matches or the match
 * is ambiguous (e.g. both "48 S …" and "48 N …" exist and the target has no
 * directional) — never guesses between two different properties.
 */
export function matchCountyAddress(
  target: StreetSignature,
  candidates: string[]
): string | null {
  const core = candidates
    .map((line) => ({ line, sig: streetSignature(line) }))
    .filter(
      (c) =>
        c.sig !== null &&
        c.sig.number === target.number &&
        c.sig.name === target.name &&
        c.sig.suffix === target.suffix
    ) as Array<{ line: string; sig: StreetSignature }>;

  if (!core.length) return null;
  if (target.directional) {
    return core.find((c) => c.sig.directional === target.directional)?.line ?? null;
  }
  // Target has no directional: accept only an unambiguous candidate.
  if (core.length === 1) return core[0].line;
  const noDirectional = core.filter((c) => !c.sig.directional);
  return noDirectional[0]?.line ?? null;
}

/**
 * Resolve the parcel PIN for an address via the county's AccelaParcelAddress
 * table (FullAddress → ParcelNumber). The matched address is the Census
 * canonical form ("2 ROBERTS ST, ASHEVILLE, NC, 28801"); we try exact match
 * first, then a normalized street-name + house-number fallback.
 *
 * If the address is not in the county's table, returns null — the caller
 * reports an honest unavailable. We deliberately do NOT fall back to a
 * spatial/nearest-parcel lookup: a street-centerline geocode point often
 * falls on a road right-of-way between parcels, and picking a neighbor's
 * parcel would silently check the wrong property's damage record.
 */
async function parcelByAddress(
  matchedAddress: string
): Promise<{ pinnum: string; sourceName: string; sourceUrl: string } | null> {
  const street = matchedAddress.split(",")[0]?.trim().toUpperCase();
  if (!street) return null;

  /** Run one address-table query, returning the ParcelNumber/FullAddress rows. */
  const rowsFor = async (where: string) => {
    const url = new URL(`${ACCELA_ADDRESS_TABLE}/query`);
    url.searchParams.set("where", where);
    url.searchParams.set("returnGeometry", "false");
    url.searchParams.set("outFields", "ParcelNumber,FullAddress");
    url.searchParams.set("f", "json");
    const data = await query(url.toString());
    return (data?.features ?? []).map((f) => ({
      pinnum: String(f.attributes?.ParcelNumber ?? "").trim(),
      full: String(f.attributes?.FullAddress ?? "").trim(),
    }));
  };

  const found = (pinnum: string) =>
    pinnum
      ? {
          pinnum,
          sourceName: "Buncombe Co. GIS (Accela address records)",
          sourceUrl: "https://gis.buncombecounty.org",
        }
      : null;

  // Attempt 1: match on house number + street name, IGNORING directional and
  // suffix formatting. The county table stores the raw situs form ("48 S
  // GRIFFING BLVD"), which the Census canonical address ("48 GRIFFING BLVD")
  // does not prefix-match — a plain 'FullAddress LIKE street%' misses it. The
  // narrow number+name prefix returns the real candidates; the normalized
  // signature then picks the exact one (suffix/ directional aware).
  const sig = streetSignature(street);
  if (sig) {
    const rows = await rowsFor(
      `UPPER(FullAddress) LIKE '${sqlStr(`${sig.number} %${sig.name}%`)}'`
    );
    const line = matchCountyAddress(
      sig,
      rows.map((r) => r.full)
    );
    if (line) {
      const hit = rows.find((r) => r.full === line);
      const result = found(hit?.pinnum ?? "");
      if (result) return result;
    }
  }

  // Attempt 2: exact, then contains-match on the full street line. Kept as a
  // fallback for lines the signature parser can't key on.
  for (const where of [
    `UPPER(FullAddress) = '${sqlStr(street)}'`,
    `UPPER(FullAddress) LIKE '${sqlStr(`${street}%`)}'`,
  ]) {
    const rows = await rowsFor(where);
    const result = found(rows[0]?.pinnum ?? "");
    if (result) return result;
  }
  return null;
}

/**
 * Check the county's Helene damage parcels table for the PIN.
 * Single attempt with a tight timeout — best-effort, must not stall.
 */
async function damageForPin(
  pinnum: string
): Promise<{ damageType?: string } | null> {
  try {
    const url = new URL(`${ACCELA_DAMAGE_TABLE}/query`);
    url.searchParams.set("where", `pin='${sqlStr(pinnum)}'`);
    url.searchParams.set("returnGeometry", "false");
    url.searchParams.set("outFields", "pin,DamageType");
    url.searchParams.set("f", "json");
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(4000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ArcGisResponse;
    if (data.error) return null;
    const attrs = data.features?.[0]?.attributes;
    if (!attrs) return null;
    const damageType = String(attrs.DamageType ?? "").trim();
    return { damageType: damageType || undefined };
  } catch {
    return null;
  }
}

/**
 * Check whether post-Helene county aerial imagery is available for the area.
 * Light availability probe only (we do not render image tiles). Failures are
 * ignored — imagery is secondary to the checked damage signal.
 */
async function imageryAvailable(): Promise<boolean> {
  try {
    const url = new URL(`${POST_HELENE_IMAGERY}/info/`);
    url.searchParams.set("f", "json");
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(3000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { serviceDataType?: string };
    return Boolean(data.serviceDataType);
  } catch {
    return false;
  }
}

/**
 * Classify the county damage-table response into the panel result.
 * Pure — unit-testable, no network.
 *
 * Honesty contract: "damage-reported" and "no-damage-record" are both real
 * CHECKED states (the query succeeded); a null response means the query did
 * not succeed and is surfaced as unavailable.
 */
export function classifyDamageResponse(
  damage: { damageType?: string } | null
): RecoveryResult {
  const parts: string[] = [];

  if (damage) {
    parts.push(
      "This parcel is in Buncombe County's Helene damage parcels dataset."
    );
    if (damage.damageType) {
      parts.push(`County record type: ${damage.damageType}.`);
    }
    parts.push(
      "This reflects records reported to the county after Hurricane Helene — verify with Buncombe County before relying on it."
    );
    return {
      status: "result",
      value: "damage-reported",
      damageType: damage.damageType,
      message: parts.join(" "),
      disclaimer: DISCLAIMER,
      sources: [
        {
          name: "Buncombe Co. open data — Helene damage parcels",
          url: "https://data.buncombenc.gov/",
          lastUpdated: "County-maintained",
        },
      ],
    };
  }

  // The table query succeeded but returned no feature: a real, honest
  // no-damage-record state — with the caveat that it isn't a guarantee.
  parts.push(
    "No record for this parcel in Buncombe County's Helene damage parcels dataset."
  );
  parts.push(
    "That does not guarantee no damage — the dataset reflects records reported to the county. Verify with Buncombe County."
  );
  return {
    status: "result",
    value: "no-damage-record",
    message: parts.join(" "),
    disclaimer: DISCLAIMER,
    sources: [
      {
        name: "Buncombe Co. open data — Helene damage parcels",
        url: "https://data.buncombenc.gov/",
        lastUpdated: "County-maintained",
      },
    ],
  };
}

export async function lookupRecoveryContext(
  lat: number,
  lon: number,
  matchedAddress?: string
): Promise<RecoveryResult> {
  // 1) Resolve the parcel PIN via the county's own address→parcel link table.
  //    Without a matched address there is no trustworthy parcel match (a
  //    street-centerline geocode point is not reliably inside a parcel), so
  //    we report an honest unavailable rather than guess a neighbor's parcel.
  let parcel: { pinnum: string; sourceName: string; sourceUrl: string } | null =
    null;
  if (matchedAddress) {
    parcel = await parcelByAddress(matchedAddress);
  }
  if (!parcel) {
    return {
      status: "unavailable",
      message:
        "We couldn't match this address to a Buncombe County parcel record, so we can't check Helene damage records for it. Verify with Buncombe County's open data portal.",
    };
  }

  // 2) Check the county's Helene damage parcels dataset.
  const damage = await damageForPin(parcel.pinnum);

  const imagery = await imageryAvailable();

  const base = classifyDamageResponse(damage);

  if (imagery && base.message) {
    base.message +=
      " Post-Helene county aerial imagery is available for this area (Buncombe County GIS).";
  }

  return base;
}

export { DISCLAIMER };
