/**
 * Diagnose recovery-panel failures, read-only.
 *
 * For each address: geocode + lookup on a deployed environment, then query
 * Buncombe County's AccelaParcelAddress table with the SAME clauses
 * lib/recovery.ts builds, and print every candidate row verbatim. Nothing is
 * written anywhere.
 *
 * Usage:
 *   node scripts/diagnose-recovery.mjs https://<preview-host>
 *
 * Classification:
 *   ok                 recovery returned a real result
 *   timeout            panel deadline hit / upstream unreachable
 *   different-locality candidates exist but in another city/ZIP — matching
 *                      would resolve a different property, so do NOT "fix"
 *   normalization-gap  a same-locality candidate exists but the street
 *                      signature differs (the directional-prefix class)
 *   county-absent      no row in the county address table at all
 */

const ACCELA = "https://gis.buncombecounty.org/arcgis/rest/services/Accela/MapServer/4/query";
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

const base = process.argv.slice(2).find((a) => !a.startsWith("--"))?.replace(/\/$/, "");
if (!base) {
  console.error("Usage: node scripts/diagnose-recovery.mjs <baseUrl>");
  process.exit(1);
}
const headers = process.env.LOOKUP_PROBE_SECRET
  ? { [PROBE_HEADER]: process.env.LOOKUP_PROBE_SECRET }
  : {};

const SUFFIX_CANON = {
  STREET: "ST", ST: "ST", AVENUE: "AVE", AVE: "AVE", AV: "AVE",
  BOULEVARD: "BLVD", BLVD: "BLVD", ROAD: "RD", RD: "RD", DRIVE: "DR",
  DR: "DR", LANE: "LN", LN: "LN", COURT: "CT", CT: "CT", CIRCLE: "CIR",
  CIR: "CIR", PLACE: "PL", PL: "PL", HIGHWAY: "HWY", HWY: "HWY",
  TRAIL: "TRL", TRL: "TRL", TERRACE: "TER", TER: "TER", PARKWAY: "PKWY",
  PKWY: "PKWY", SQUARE: "SQ", SQ: "SQ", WAY: "WAY", LOOP: "LOOP",
};
const DIRECTIONALS = new Set(["N", "S", "E", "W", "NE", "NW", "SE", "SW"]);

/** Mirrors streetSignature() in lib/recovery.ts. */
function signature(line) {
  const cleaned = (line.split(",")[0] ?? "")
    .toUpperCase()
    .replace(/#.*$/, "")
    .replace(/\b(APT|UNIT|STE|SUITE)\b.*$/, "")
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const tokens = cleaned.split(" ").filter(Boolean);
  if (!tokens.length || !/^\d/.test(tokens[0])) return null;
  const number = tokens[0];
  const rest = tokens.slice(1);
  if (!rest.length) return null;
  let directional = "";
  if (rest.length > 1 && DIRECTIONALS.has(rest[0])) {
    directional = rest[0];
    rest.shift();
  }
  const suffix = rest.length > 1 ? SUFFIX_CANON[rest[rest.length - 1]] ?? "" : "";
  return {
    number,
    name: (suffix ? rest.slice(0, -1) : rest).join(" "),
    suffix,
    directional,
  };
}

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json", ...headers } });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}: ${text.slice(0, 200)}`);
  return JSON.parse(text);
}

const sqlStr = (v) => v.replace(/'/g, "''");

async function accela(where) {
  const url = new URL(ACCELA);
  url.searchParams.set("where", where);
  url.searchParams.set("returnGeometry", "false");
  url.searchParams.set(
    "outFields",
    "ParcelNumber,FullAddress,SitusCity,SitusZip,X_Coordinate,Y_Coordinate"
  );
  url.searchParams.set("f", "json");
  const data = await getJson(url.toString());
  if (data.error) throw new Error(`ArcGIS error: ${data.error.message ?? JSON.stringify(data.error)}`);
  return (data.features ?? []).map((f) => ({
    FullAddress: String(f.attributes?.FullAddress ?? "").trim(),
    ParcelNumber: String(f.attributes?.ParcelNumber ?? "").trim(),
    SitusCity: f.attributes?.SitusCity ?? null,
    SitusZip: f.attributes?.SitusZip ?? null,
    X: f.attributes?.X_Coordinate ?? null,
    Y: f.attributes?.Y_Coordinate ?? null,
  }));
}

function parseTimings(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const [k, v] = part.split("=");
    if (k && v !== undefined) out[k.trim()] = Number(v);
  }
  return out;
}

function sameLocality(rows, geo) {
  return rows.filter((r) => {
    if (!r.SitusZip || !geo.zip) return false;
    return String(r.SitusZip).slice(0, 5) === String(geo.zip).slice(0, 5);
  });
}

function classify(status, message, timing, attempt1, all, geo) {
  if (status === "result") return "ok";
  if (message?.includes("temporarily unreachable") || timing >= 6000) return "timeout";
  if (all.length && !sameLocality(all, geo).length) return "different-locality";
  if (attempt1.length || all.length) return "normalization-gap";
  return "county-absent";
}

const results = [];

for (const address of ADDRESSES) {
  console.log(`\n${"=".repeat(78)}\n${address}`);

  const geo = await getJson(`${base}/api/geocode?address=${encodeURIComponent(address)}`);
  console.log(`geocode: ${geo.status} -> ${geo.matchedAddress ?? "(none)"} zip=${geo.zip ?? "?"}`);
  if (geo.status !== "in-scope") {
    results.push({ address, classification: "geocode-failed", geo });
    continue;
  }

  const params = new URLSearchParams({
    lat: String(geo.latitude),
    lon: String(geo.longitude),
    zip: geo.zip ?? "",
    city: geo.city ?? "",
    address: geo.matchedAddress,
  });
  const lookupRes = await fetch(`${base}/api/lookup?${params}`, { headers });
  const lookup = await lookupRes.json();
  const timings = parseTimings(lookupRes.headers.get("x-lookup-timings"));
  const rec = lookup.recovery ?? {};
  console.log(
    `lookup: recovery=${rec.status} value=${rec.value ?? "-"} timing=${timings.recovery ?? "?"}ms`
  );
  console.log(`message: ${rec.message ?? "(none)"}`);

  const sig = signature(geo.matchedAddress ?? address);
  const street = (geo.matchedAddress ?? address).split(",")[0].trim().toUpperCase();
  const attempt1 =
    sig && (await accela(`UPPER(FullAddress) LIKE '${sqlStr(`${sig.number} %${sig.name}%`)}'`));
  const exact = await accela(`UPPER(FullAddress) = '${sqlStr(street)}'`);
  const prefix = await accela(`UPPER(FullAddress) LIKE '${sqlStr(`${street}%`)}'`);
  const all = [...new Map([...attempt1, ...exact, ...prefix].map((r) => [r.FullAddress, r])).values()];

  console.log(`signature: ${JSON.stringify(sig)}`);
  console.log("AccelaParcelAddress rows:");
  if (!all.length) {
    console.log("  (none)");
  } else {
    for (const r of all) {
      console.log(
        `  ${r.FullAddress.padEnd(28)} parcel=${r.ParcelNumber} city=${r.SitusCity} zip=${r.SitusZip} xy=${r.X},${r.Y}`
      );
    }
  }

  const classification = classify(rec.status, rec.message, timings.recovery ?? 0, attempt1, all, geo);
  console.log(`classification: ${classification}`);
  results.push({ address, classification, geo, rec, attempt1, all });
}

console.log(`\n${"=".repeat(78)}\nSummary`);
for (const r of results) {
  console.log(`${r.classification.padEnd(20)} ${r.address}`);
}
