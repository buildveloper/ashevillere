/**
 * Short-term rental (STR) eligibility — Buncombe County zoning overlay.
 *
 * Phase 5 of the rebuild spec is still placeholder: the county's zoning
 * service endpoint needs confirmation. Until then this module returns an
 * honest "rules-by-location" summary (city vs county) and defers the
 * definitive zoning determination — it never fabricates a permit verdict.
 */

export type StrStatus = "result" | "unavailable" | "error";

export interface StrResult {
  status: StrStatus;
  /** Machine-readable classification. */
  value?: "city" | "county" | "unknown";
  /** Human-readable summary. */
  message?: string;
}

const CITY_ZIPS = new Set([
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

/** Classify city-vs-county from ZIP (pure, unit-testable). */
export function classifyStrJurisdiction(zip?: string): StrResult {
  if (!zip) {
    return {
      status: "result",
      value: "unknown",
      message:
        "We couldn't determine the municipality from this address. City and county STR rules differ — check the official zoning map.",
    };
  }
  if (CITY_ZIPS.has(zip)) {
    return {
      status: "result",
      value: "city",
      message:
        "Inside Asheville city limits: whole-home short-term rentals are generally not allowed in residential districts (2018 ordinance); owner-occupied homestays may qualify. Confirm with the City of Asheville.",
    };
  }
  return {
    status: "result",
    value: "county",
    message:
      "Outside Asheville city limits: Buncombe County regulates STRs differently from the city — registration and taxes still apply. Confirm with Buncombe County.",
  };
}

/**
 * Zoning determination is a Phase 5 placeholder. We return the jurisdiction
 * classification and explicitly flag that the parcel-level zoning overlay is
 * not yet wired, with a path to the official map. No fabricated permit status.
 */
export async function lookupStrEligibility(
  _lat: number,
  _lon: number,
  zip?: string
): Promise<StrResult> {
  const base = classifyStrJurisdiction(zip);
  return {
    ...base,
    message: `${base.message} Parcel-level zoning lookup is still being wired to the county's GIS — verify on the official Buncombe County zoning map before relying on it.`,
  };
}
