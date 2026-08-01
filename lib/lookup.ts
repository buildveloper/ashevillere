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

export type PanelStatus = "checking" | "result" | "unavailable" | "error";

export interface LookupPanelResult {
  key: "flood" | "str" | "recovery";
  status: PanelStatus;
  /** Human-readable summary for the panel body. */
  message?: string;
  /** Machine-readable value, when available. */
  value?: string;
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
    fetchStr(ctx),
    fetchRecovery(ctx),
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
    };
    return { key: "flood", ...data };
  } catch {
    return { key: "flood", status: "error", message: "Could not reach the flood check." };
  }
}

async function fetchStr(ctx: LookupContext): Promise<LookupPanelResult> {
  try {
    const url = `${getBase()}/api/str?lat=${ctx.latitude.toFixed(5)}&lon=${ctx.longitude.toFixed(5)}&zip=${encodeURIComponent(ctx.zip ?? "")}`;
    const res = await fetch(url);
    const data = (await res.json()) as {
      status: PanelStatus;
      message?: string;
      value?: string;
    };
    return { key: "str", ...data };
  } catch {
    return { key: "str", status: "error", message: "Could not reach the STR check." };
  }
}

async function fetchRecovery(ctx: LookupContext): Promise<LookupPanelResult> {
  try {
    const url = `${getBase()}/api/recovery?lat=${ctx.latitude.toFixed(5)}&lon=${ctx.longitude.toFixed(5)}`;
    const res = await fetch(url);
    const data = (await res.json()) as {
      status: PanelStatus;
      message?: string;
      value?: string;
    };
    return { key: "recovery", ...data };
  } catch {
    return { key: "recovery", status: "error", message: "Could not reach the recovery check." };
  }
}

/** Absolute base URL for server-side fetches (handles Vercel + localhost). */
function getBase(): string {
  if (typeof window !== "undefined") return "";
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
