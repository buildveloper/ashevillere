/**
 * Lookup orchestration — runs flood / STR / recovery checks in parallel and
 * returns a typed result per panel. Each source is a server-side proxy with
 * a short timeout; failures degrade to an honest `unavailable` state rather
 * than fabricated data (AGENTS.md: never imply data we didn't fetch).
 */

export interface LookupContext {
  latitude: number;
  longitude: number;
  zip?: string;
  city?: string;
}

export type PanelStatus = "checking" | "result" | "not-connected" | "unavailable" | "error";

export interface LookupPanelResult {
  key: "flood" | "str" | "recovery";
  status: PanelStatus;
  /** Human-readable summary for the panel body. */
  message?: string;
  /** Machine-readable value, when available. */
  value?: string;
  /** LOMA/LOMR status for the flood panel. */
  lomaLomr?: "none" | "loma" | "lomr" | "unknown";
  /** NC FRIS cross-reference note. */
  ncNote?: string;
  /** Source citation — only present when real data was fetched. */
  source?: { label: string; url: string; lastUpdated: string };
  /** Required disclaimer for flood data. */
  disclaimer?: string;
}

export interface LookupResult {
  flood: LookupPanelResult;
  str: LookupPanelResult;
  recovery: LookupPanelResult;
}

/** Zip-code → "inside city limits" hint (Buncombe municipalities). */
const CITY_ZIPS = new Set(["28801", "28802", "28803", "28804", "28805", "28806", "28711"]);

export function classifyCityStatus(ctx: LookupContext): string {
  if (!ctx.zip) return "Outside city limits — county rules apply.";
  if (CITY_ZIPS.has(ctx.zip)) return "Inside Asheville city limits — city STR rules apply.";
  return "Outside city limits — county rules apply.";
}

export async function runLookup(ctx: LookupContext): Promise<LookupResult> {
  const [flood, str, recovery] = await Promise.all([
    fetchFlood(ctx),
    fetchStr(),
    fetchRecovery(),
  ]);
  return { flood, str, recovery };
}

async function fetchFlood(ctx: LookupContext): Promise<LookupPanelResult> {
  try {
    const url = `${getBase()}/api/flood?lat=${ctx.latitude.toFixed(5)}&lon=${ctx.longitude.toFixed(5)}`;
    const res = await fetch(url);
    const data = (await res.json()) as {
      status: PanelStatus;
      message?: string;
      value?: string;
      zone?: string;
      lomaLomr?: "none" | "loma" | "lomr" | "unknown";
      ncNote?: string;
      sources?: Array<{ name: string; url: string; lastUpdated: string }>;
    };
    // Only surface a real result when FEMA actually returned a zone.
    if (data.status === "result" && data.zone) {
      return {
        key: "flood",
        status: "result",
        message: data.message,
        value: data.zone,
        lomaLomr: data.lomaLomr,
        ncNote: data.ncNote,
        source: data.sources?.[0]
          ? {
              label: data.sources[0].name,
              url: data.sources[0].url,
              lastUpdated: data.sources[0].lastUpdated,
            }
          : undefined,
        disclaimer:
          "This is informational and not a substitute for an official flood determination, elevation certificate, or insurance agent's assessment.",
      };
    }
    // FEMA/NC unreachable or returned nothing — honest unavailable state,
    // never a silent fallback to fake data.
    return {
      key: "flood",
      status: "unavailable",
      message:
        data.message ??
        "FEMA's flood map service is temporarily unreachable. We're not showing guessed data — check the official FEMA map.",
    };
  } catch {
    return {
      key: "flood",
      status: "unavailable",
      message:
        "FEMA's flood map service is temporarily unreachable. We're not showing guessed data — check the official FEMA map.",
    };
  }
}

async function fetchStr(): Promise<LookupPanelResult> {
  // STR eligibility is not wired to a real data source yet (Phase 5 of the
  // rebuild spec). Do NOT present canned jurisdiction copy as a checked
  // result — that is exactly the fake-data behavior this product exists to
  // avoid. Return the honest not-connected state until real zoning data
  // exists behind it.
  return {
    key: "str",
    status: "not-connected",
    message:
      "Not yet connected — live Day 6. Parcel-level zoning and STR eligibility are being wired to Buncombe County GIS data.",
  };
}

async function fetchRecovery(): Promise<LookupPanelResult> {
  // Recovery context is not wired to a real data source yet (Phase 6 of the
  // rebuild spec). Same rule: no canned result presented as checked.
  return {
    key: "recovery",
    status: "not-connected",
    message:
      "Not yet connected — live Day 6. Helene recovery and damage context are being wired to county/state data.",
  };
}

/** Absolute base URL for server-side fetches (handles Vercel + localhost). */
function getBase(): string {
  if (typeof window !== "undefined") return "";
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
