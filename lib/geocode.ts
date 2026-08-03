/**
 * U.S. Census Bureau Geocoder — free, no API key.
 * https://geocoding.geo.census.gov/geocoder/
 *
 * Fallback: Buncombe County's own AccelaParcelAddress table (county GIS),
 * used when Census cannot match a street address that is genuinely in the
 * county (common for rural roads). The county table stores the parcel point
 * in NC state-plane feet; we convert to WGS84 lat/lon with proj4.
 */

import proj4 from "proj4";

/** NC SPCS83 (EPSG:2264, US survey feet) → WGS84. */
const NC_SPCS83_FTUS = "+proj=lcc +lat_1=34.33333333333334 +lat_2=36.16666666666666 +lat_0=33.75 +lon_0=-79 +x_0=609601.2192024384 +y_0=0 +datum=NAD83 +units=us-ft +no_defs";

const COUNTY_ADDRESS_URL =
  "https://gis.buncombecounty.org/arcgis/rest/services/Accela/MapServer/4/query";

export type GeocodeStatus = "in-scope" | "outside" | "no-match" | "error";

export interface GeocodeResult {
  status: GeocodeStatus;
  /** Matched, canonical address as returned by the Census geocoder. */
  matchedAddress?: string;
  /** Longitude / Latitude (Census returns x=lon, y=lat). */
  longitude?: number;
  latitude?: number;
  zip?: string;
  state?: string;
  city?: string;
  /** Human-readable reason, for UI display. */
  message?: string;
}

/**
 * ZIP codes within Buncombe County, NC (county FIPS 37021).
 * 288xx = Asheville; 28704/28709/28711/28715/28716/28778/28787 = the
 * surrounding county towns (Arden, Barnardsville, Black Mountain, Candler,
 * Fairview, Leicester, Swannanoa, Weaverville, …).
 */
export const BUNCOMBE_ZIPS = new Set([
  "28704",
  "28709",
  "28711",
  "28715",
  "28716",
  "28778",
  "28787",
  "28801",
  "28802",
  "28803",
  "28804",
  "28805",
  "28806",
  "28810",
  "28813",
  "28814",
  "28815",
  "28816",
]);

const CENSUS_URL =
  "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress";

interface CensusMatch {
  coordinates: { x: number; y: number };
  addressComponents: {
    zip?: string;
    state?: string;
    city?: string;
  };
  matchedAddress?: string;
}

interface CensusResponse {
  result: {
    addressMatches?: CensusMatch[];
  };
}

export function isBuncombeZip(zip: string | undefined): boolean {
  if (!zip) return false;
  return BUNCOMBE_ZIPS.has(zip.trim().toUpperCase());
}

/** Classify a raw Census geocoder response (pure, unit-testable). */
export function classifyCensusResponse(
  data: CensusResponse
): Omit<GeocodeResult, "message"> {
  const matches = data?.result?.addressMatches ?? [];
  const match = matches[0];
  if (!match) {
    return { status: "no-match" };
  }
  const zip = match.addressComponents?.zip;
  return {
    status: isBuncombeZip(zip) ? "in-scope" : "outside",
    matchedAddress: match.matchedAddress,
    longitude: match.coordinates?.x,
    latitude: match.coordinates?.y,
    zip,
    state: match.addressComponents?.state,
    city: match.addressComponents?.city,
  };
}

/**
 * Look up a street address (house number + street) in Buncombe County's
 * AccelaParcelAddress table — the county's own address→parcel link. Returns a
 * GeocodeResult with parcel-point coordinates when found, or null when the
 * address isn't in the county table or the service is unreachable.
 *
 * We match on the house-number + street line only (not city), because the
 * county table stores situs addresses without a reliable city field for every
 * row, and a street+number is unique within Buncombe.
 */
async function lookupCountyAddress(
  raw: string
): Promise<GeocodeResult | null> {
  // Normalize: strip the trailing comma-joined locality/state, keep the
  // street line ("287 New Salem Rd" from "287 New Salem Rd, Swannanoa, NC").
  const streetLine = raw.split(",")[0]?.trim().toUpperCase();
  if (!streetLine || !/\d/.test(streetLine)) return null;

  // Try exact "287 NEW SALEM RD" then a contains-match on the street line.
  const clauses = [
    `UPPER(FullAddress) = '${streetLine.replace(/'/g, "''")}'`,
    `UPPER(FullAddress) LIKE '${streetLine.replace(/'/g, "''")}%'`,
  ];

  for (const where of clauses) {
    let res: Response;
    try {
      const url = new URL(COUNTY_ADDRESS_URL);
      url.searchParams.set("where", where);
      url.searchParams.set("returnGeometry", "false");
      url.searchParams.set("outFields", "ParcelNumber,FullAddress,X_Coordinate,Y_Coordinate");
      url.searchParams.set("f", "json");
      res = await fetch(url, {
        signal: AbortSignal.timeout(10000),
        headers: { Accept: "application/json" },
      });
    } catch {
      return null;
    }
    if (!res.ok) return null;
    let data: { features?: Array<{ attributes?: Record<string, unknown> }> };
    try {
      data = (await res.json()) as typeof data;
    } catch {
      return null;
    }
    const attrs = data.features?.[0]?.attributes;
    const x = Number(attrs?.X_Coordinate);
    const y = Number(attrs?.Y_Coordinate);
    if (!attrs || !Number.isFinite(x) || !Number.isFinite(y)) continue;
    const [lon, lat] = proj4(NC_SPCS83_FTUS, "WGS84", [x, y]);
    return {
      status: "in-scope",
      matchedAddress: String(attrs.FullAddress ?? streetLine),
      longitude: lon,
      latitude: lat,
      message:
        "Matched to a Buncombe County parcel record (county GIS address data).",
    };
  }
  return null;
}

/**
 * Query the Census Geocoder for a single-line address and classify the
 * result into the four states the UI needs: in-scope (geocoded inside
 * Buncombe County), outside (geocoded, but not Buncombe), no-match, error.
 *
 * Fallback chain: Census first; if it can't match (common for rural Buncombe
 * roads without city context), fall back to Buncombe County's own
 * AccelaParcelAddress table, which resolves street+number and returns the
 * parcel point. This avoids the wrong-county pitfall of appending a bare
 * state ("287 New Salem Rd, NC" resolves to Statesville) and serves addresses
 * Census simply doesn't know.
 */
export async function geocodeAddress(raw: string): Promise<GeocodeResult> {
  const address = raw.trim();
  if (!address) {
    return { status: "no-match", message: "Enter an address to look up." };
  }

  // Attempt 1: Census with the user's address as-is.
  let res: Response;
  try {
    const url = new URL(CENSUS_URL);
    url.searchParams.set("address", address);
    url.searchParams.set("benchmark", "Public_AR_Current");
    url.searchParams.set("format", "json");
    res = await fetch(url, {
      // Census geocoder is not always fast; give it room.
      signal: AbortSignal.timeout(15000),
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error && err.name === "TimeoutError"
          ? "The geocoder took too long. Try again in a moment."
          : "Could not reach the geocoding service. Try again.",
    };
  }

  if (!res.ok) {
    return {
      status: "error",
      message: `The geocoding service returned an error (${res.status}). Try again.`,
    };
  }

  let data: CensusResponse;
  try {
    data = (await res.json()) as CensusResponse;
  } catch {
    return {
      status: "error",
      message: "The geocoding service sent back an unreadable response. Try again.",
    };
  }

  const classified = classifyCensusResponse(data);

  if (classified.status === "in-scope") {
    return classified;
  }

  if (classified.status === "outside") {
    return {
      ...classified,
      message: `That address is in ${classified.city ?? "another area"}, ${
        classified.state ?? "US"
      } — outside Buncombe County. We only cover Buncombe County, NC.`,
    };
  }

  // Attempt 2: Census no-matched — try Buncombe County's own address table.
  const county = await lookupCountyAddress(address);
  if (county) return county;

  return {
    status: "no-match",
    message:
      "We couldn't find that address. Check the street number and spelling, then try again.",
  };
}
