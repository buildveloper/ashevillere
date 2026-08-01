/**
 * U.S. Census Bureau Geocoder — free, no API key.
 * https://geocoding.geo.census.gov/geocoder/
 */

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
 * Query the Census Geocoder for a single-line address and classify the
 * result into the four states the UI needs: in-scope (geocoded inside
 * Buncombe County), outside (geocoded, but not Buncombe), no-match, error.
 */
export async function geocodeAddress(raw: string): Promise<GeocodeResult> {
  const address = raw.trim();
  if (!address) {
    return { status: "no-match", message: "Enter an address to look up." };
  }

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

  if (classified.status === "no-match") {
    return {
      status: "no-match",
      message:
        "We couldn't find that address. Check the street number and spelling, then try again.",
    };
  }

  if (classified.status === "outside") {
    return {
      ...classified,
      message: `That address is in ${classified.city ?? "another area"}, ${
        classified.state ?? "US"
      } — outside Buncombe County. We only cover Buncombe County, NC.`,
    };
  }

  return classified;
}
