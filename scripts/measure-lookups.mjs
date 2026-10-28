/**
 * Measure per-panel lookup latency against a deployed environment.
 *
 * Reads the Server-Timing-style `X-Lookup-Timings` response header that
 * app/api/lookup/route.ts emits (the JSON payload is unchanged), so the
 * numbers are the server's own panel durations, not client wall time.
 *
 * Usage:
 *   node scripts/measure-lookups.mjs https://<preview-host> [--runs=3] [--json=out.json]
 *
 * Probes that hit production MUST set LOOKUP_PROBE_SECRET so their lookups are
 * not written to lookup_events (production-only logging; see
 * lib/lookup-log-gate.ts). Requests are serial — never concurrent — and paced
 * to stay under the route's 30/minute rate limit.
 */

const PROBE_HEADER = "x-ashevillere-probe-secret";

const ADDRESSES = [
  "48 Griffing Blvd, Asheville",
  "290 Macon Ave, Asheville",
  "1 N Pack Sq, Asheville",
  "20 Church St, Black Mountain",
  "287 New Salem Rd, Swannanoa",
  "70 Woodfin Pl, Asheville",
  "199 Apgar Rd, Candler",
];

const args = process.argv.slice(2);
const base = args.find((a) => !a.startsWith("--"))?.replace(/\/$/, "");
const runs = Number(args.find((a) => a.startsWith("--runs="))?.split("=")[1] ?? 3);
const jsonPath = args.find((a) => a.startsWith("--json="))?.slice("--json=".length);

if (!base) {
  console.error(
    "Usage: node scripts/measure-lookups.mjs <baseUrl> [--runs=3] [--json=out.json]"
  );
  process.exit(1);
}
if (!Number.isInteger(runs) || runs < 1) {
  console.error("--runs must be a positive integer.");
  process.exit(1);
}

const secret = process.env.LOOKUP_PROBE_SECRET;
const headers = secret ? { [PROBE_HEADER]: secret } : {};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  const res = await fetch(url, { headers });
  const type = res.headers.get("content-type") ?? "";
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}: ${body.slice(0, 300)}`);
  }
  if (!type.includes("application/json")) {
    throw new Error(
      `Expected JSON from ${url} but got ${type || "no content-type"}: ${body.slice(0, 200)}`
    );
  }
  return JSON.parse(body);
}

function parseTimings(header) {
  if (!header) return null;
  const out = {};
  for (const part of header.split(";")) {
    const [key, value] = part.split("=");
    if (key && value !== undefined) out[key.trim()] = Number(value);
  }
  return out;
}

const median = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

console.log(`Base: ${base}`);
console.log(`Addresses: ${ADDRESSES.length} × ${runs} runs`);
console.log(
  secret
    ? `Probe header: ${PROBE_HEADER} (logging bypass enabled)`
    : `Probe header: none — LOOKUP_PROBE_SECRET is unset`
);

const targets = [];
for (const address of ADDRESSES) {
  const geo = await getJson(`${base}/api/geocode?address=${encodeURIComponent(address)}`);
  if (geo.status !== "in-scope") {
    console.error(`[geocode] ${address}: ${geo.status} — ${geo.message ?? ""}`);
    process.exit(1);
  }
  targets.push({ address, geo });
  console.log(
    `[geocode] ${address} -> ${geo.matchedAddress} (${geo.latitude}, ${geo.longitude})`
  );
  await sleep(1200);
}

const records = [];
for (const { address, geo } of targets) {
  for (let run = 1; run <= runs; run++) {
    const params = new URLSearchParams({
      lat: String(geo.latitude),
      lon: String(geo.longitude),
      zip: geo.zip ?? "",
      city: geo.city ?? "",
      address: geo.matchedAddress ?? address,
    });
    const res = await fetch(`${base}/api/lookup?${params}`, { headers });
    const body = await res.text();
    if (!res.ok) {
      console.error(`[lookup] ${address} run ${run}: HTTP ${res.status} ${body.slice(0, 200)}`);
      process.exit(1);
    }
    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      console.error(
        `[lookup] ${address} run ${run}: non-JSON response (deployment protected?)`
      );
      process.exit(1);
    }
    const timings = parseTimings(res.headers.get("x-lookup-timings"));
    if (!timings) {
      console.error(`[lookup] ${address} run ${run}: missing X-Lookup-Timings header`);
      process.exit(1);
    }
    records.push({
      address,
      run,
      flood: timings.flood,
      str: timings.str,
      recovery: timings.recovery,
      schools: timings.schools,
      total: timings.total,
      floodStatus: payload.flood?.status,
      strStatus: payload.str?.status,
      recoveryStatus: payload.recovery?.status,
      schoolsStatus: payload.schools?.status,
      recoveryMessage: payload.recovery?.message ?? null,
    });
    const r = records[records.length - 1];
    console.log(
      `${String(records.length).padStart(2)}/${targets.length * runs}  ` +
        `${address.padEnd(30)} run ${run}  total=${r.total}ms  ` +
        `flood=${r.flood} str=${r.str} recovery=${r.recovery} schools=${r.schools}  ` +
        `recoveryStatus=${r.recoveryStatus}`
    );
    await sleep(1200);
  }
}

const panels = ["flood", "str", "recovery", "schools", "total"];
const summary = Object.fromEntries(
  panels.map((p) => {
    const values = records.map((r) => r[p]).filter(Number.isFinite);
    return [
      p,
      {
        min: values.length ? Math.min(...values) : null,
        median: median(values),
        max: values.length ? Math.max(...values) : null,
      },
    ];
  })
);

console.log("\nPer-panel (ms, n=%d):", records.length);
console.log("panel     min   median  max");
for (const p of panels) {
  const s = summary[p];
  console.log(
    `${p.padEnd(9)} ${String(s.min).padStart(4)}  ${String(s.median).padStart(6)}  ${String(s.max).padStart(4)}`
  );
}

const recoveryFailures = records.filter((r) => r.recoveryStatus !== "result");
console.log(`\nRecovery non-result runs: ${recoveryFailures.length}/${records.length}`);
for (const f of recoveryFailures) {
  console.log(`  ${f.address} run ${f.run}: ${f.recoveryStatus} — ${f.recoveryMessage}`);
}

if (jsonPath) {
  const { writeFileSync } = await import("node:fs");
  writeFileSync(
    jsonPath,
    JSON.stringify({ base, runs, generatedAt: new Date().toISOString(), summary, records }, null, 2)
  );
  console.log(`\nRaw JSON: ${jsonPath}`);
}
