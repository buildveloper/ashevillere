/**
 * Read-only report of anonymous lookup events.
 *
 * Lists candidate synthetic rows created by our own preview/production
 * verification runs. This script only issues SELECTs — it never deletes or
 * updates anything. Deletion is a separate, explicitly confirmed action.
 *
 * Usage:
 *   node --env-file=.env.local scripts/report-lookup-events.mjs
 *
 * Requires TURSO_DATABASE_URL (and TURSO_AUTH_TOKEN for cloud). Refuses to
 * fall back to the local file DB, which would report unrelated data.
 */

import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error(
    "TURSO_DATABASE_URL is required. Run with: node --env-file=.env.local scripts/report-lookup-events.mjs"
  );
  process.exit(1);
}

const client = createClient({ url, authToken: authToken || undefined });

const summarize = (rows) =>
  rows.map((r) => Object.fromEntries(Object.entries(r)));

async function query(sql, args = []) {
  const res = await client.execute({ sql, args });
  return summarize(res.rows);
}

const toEpoch = (iso) => Math.floor(new Date(iso).getTime() / 1000);
const fmt = (epoch) =>
  epoch === null || epoch === undefined ? "(none)" : new Date(Number(epoch) * 1000).toISOString();

console.log("READ-ONLY REPORT — no rows will be deleted or modified.\n");

const [overall] = await query(
  "SELECT COUNT(*) AS n, MIN(created_at) AS mn, MAX(created_at) AS mx FROM lookup_events"
);
console.log(`Total rows: ${overall.n}`);
console.log(`Range: ${fmt(overall.mn)} → ${fmt(overall.mx)}\n`);

console.log("Rows per UTC date:");
for (const row of await query(
  "SELECT date(created_at,'unixepoch') AS day, COUNT(*) AS n FROM lookup_events GROUP BY day ORDER BY day"
)) {
  console.log(`  ${row.day}  ${row.n}`);
}

console.log("\nHourly buckets (test ZIPs highlighted):");
const HOURLY = await query(
  `SELECT strftime('%Y-%m-%d %H', created_at,'unixepoch') AS hour,
          COALESCE(zip,'(null)') AS zip,
          COUNT(*) AS n
     FROM lookup_events
    GROUP BY hour, zip
    ORDER BY hour, n DESC`
);
for (const row of HOURLY) {
  const testZip = ["28801", "28804", "28711", "28715", "28778"].includes(row.zip);
  console.log(`  ${row.hour}Z  zip=${String(row.zip).padEnd(7)} n=${row.n}${testZip ? "  <- test ZIP" : ""}`);
}

const windows = [
  ["2026-10-08 preview deploys", "2026-10-08T10:00:00Z", "2026-10-08T11:30:00Z"],
  ["2026-10-28 9b514b0 preview tests", "2026-10-28T10:00:00Z", "2026-10-28T10:30:00Z"],
  ["2026-10-28 session (all today)", "2026-10-28T00:00:00Z", new Date().toISOString()],
];

console.log("\nCandidate synthetic windows:");
for (const [label, start, end] of windows) {
  const rows = await query(
    `SELECT COALESCE(zip,'(null)') AS zip, COUNT(*) AS n,
            MIN(created_at) AS mn, MAX(created_at) AS mx
       FROM lookup_events
      WHERE created_at >= ? AND created_at <= ?
      GROUP BY zip
      ORDER BY n DESC`,
    [toEpoch(start), toEpoch(end)]
  );
  const total = rows.reduce((sum, r) => sum + Number(r.n), 0);
  console.log(`\n  ${label}`);
  console.log(`  range: ${start} → ${end}   rows: ${total}`);
  for (const r of rows) {
    console.log(`    zip=${String(r.zip).padEnd(7)} n=${r.n}  ${fmt(r.mn)} → ${fmt(r.mx)}`);
  }
}

console.log(
  "\nBurst hours with >=3 rows in a test ZIP (review these first):"
);
const bursts = HOURLY.filter(
  (r) => Number(r.n) >= 3 && ["28801", "28804", "28711", "28715", "28778"].includes(r.zip)
);
if (!bursts.length) {
  console.log("  (none)");
} else {
  for (const r of bursts) {
    console.log(`  ${r.hour}Z  zip=${r.zip}  n=${r.n}`);
  }
}

console.log("\nDone. Nothing was deleted.");
