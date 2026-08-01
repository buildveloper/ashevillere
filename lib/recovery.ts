/**
 * Hurricane Helene recovery context — NC DPS / county sources.
 *
 * Phase 6 is still placeholder. This module returns an honest, current
 * summary of recovery resources for Buncombe County and explicitly defers
 * parcel-level damage records (which don't exist as public per-address data).
 */

export type RecoveryStatus = "result" | "unavailable" | "error";

export interface RecoveryResult {
  status: RecoveryStatus;
  /** Human-readable summary. */
  message?: string;
}

export async function lookupRecoveryContext(): Promise<RecoveryResult> {
  return {
    status: "result",
    message:
      "Hurricane Helene (Sept 2024) caused widespread flooding in Buncombe County. Recovery funding (FEMA individual assistance, housing repair, buyouts) is administered at the county and state level — check NC DPS and Buncombe County recovery hubs for property-specific programs. Parcel-level damage records are not public per-address data.",
  };
}
