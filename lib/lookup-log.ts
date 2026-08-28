/**
 * Best-effort anonymous logging of completed lookups (Pro "Market Interest").
 *
 * Deliberately isolated from the public path:
 *  - `@/db` is imported lazily and inside try/catch, so a missing or
 *    unreachable database NEVER breaks or slows the free consumer lookup
 *    (AGENTS.md: the public lookup never imports this module eagerly).
 *  - Only non-identifying dimensions are kept — ZIP area, timestamp, which
 *    panels returned a result, and the flood-zone / STR-jurisdiction category.
 *    No street address, no coordinates, no IP, no identity. See the
 *    methodology page's privacy disclosure.
 */

import { buildLookupEventRow } from "./market-intel";
import type { LookupContext, LookupResult } from "./lookup";

export async function logLookupEvent(
  ctx: LookupContext,
  result: LookupResult
): Promise<void> {
  const row = buildLookupEventRow(ctx, result);
  try {
    const [{ db }, { lookupEvents }] = await Promise.all([
      import("@/db"),
      import("@/db/schema"),
    ]);
    await db.insert(lookupEvents).values({
      zip: row.zip,
      createdAt: row.createdAt,
      flood: row.flood,
      str: row.str,
      recovery: row.recovery,
      floodZone: row.floodZone,
      strJurisdiction: row.strJurisdiction,
    });
  } catch (err) {
    // Logging is telemetry, never a dependency: the lookup result was already
    // produced and the response is unaffected.
    console.error(
      "[lookup-log] Skipped anonymous lookup log (free lookup unaffected):",
      err
    );
  }
}
