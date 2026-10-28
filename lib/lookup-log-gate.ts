/**
 * Gate for anonymous lookup logging.
 *
 * Rows are written only from a real production deployment. Preview/local
 * lookups (including the measurement and diagnostic runs this project makes
 * constantly) are not user activity and must not pollute the Pro aggregates.
 *
 * Probes that deliberately exercise production send PROBE_HEADER with the
 * shared secret from LOOKUP_PROBE_SECRET; a matching request skips logging.
 * The comparison is constant-time so the header can't be guessed byte by byte.
 */

import { timingSafeEqual } from "node:crypto";

export const PROBE_HEADER = "x-ashevillere-probe-secret";

/**
 * True only when a secret is configured AND the request presented exactly it.
 * A missing/empty secret on either side never authorizes a bypass — otherwise
 * an unset LOOKUP_PROBE_SECRET would let anyone suppress logging.
 */
export function isTrustedProbe(
  provided: string | null,
  expected: string | undefined
): boolean {
  if (!provided || !expected) return false;
  const providedBytes = Buffer.from(provided, "utf8");
  const expectedBytes = Buffer.from(expected, "utf8");
  if (providedBytes.length !== expectedBytes.length) return false;
  return timingSafeEqual(providedBytes, expectedBytes);
}

/** Log only on Vercel's production environment, and never for a trusted probe. */
export function shouldLogLookup(
  vercelEnv: string | undefined,
  trustedProbe: boolean
): boolean {
  return vercelEnv === "production" && !trustedProbe;
}
