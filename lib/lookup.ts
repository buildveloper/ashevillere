/**
 * Lookup orchestration — runs flood / STR / recovery checks in parallel and
 * returns a typed result per panel. Each source is called DIRECTLY (in-process,
 * no HTTP self-fetch — the orchestrator runs server-side), with short
 * timeouts; failures degrade to an honest `unavailable` state rather than
 * fabricated data (AGENTS.md: never imply data we didn't fetch).
 */

import { lookupFloodZone, type FloodResult } from "./flood";
import { lookupStrEligibility, type StrResult } from "./str";
import { lookupRecoveryContext, type RecoveryResult } from "./recovery";
import { lookupSchoolZone, type SchoolResult } from "./schools";

export interface LookupContext {
  latitude: number;
  longitude: number;
  zip?: string;
  city?: string;
  /** Canonical matched address from the geocoder (e.g. "2 ROBERTS ST, ASHEVILLE, NC, 28801"). */
  address?: string;
}

export type PanelStatus = "checking" | "result" | "not-connected" | "unavailable" | "error";

export interface LookupPanelResult {
  key: "flood" | "str" | "recovery" | "schools";
  status: PanelStatus;
  /** Human-readable summary for the panel body. */
  message?: string;
  /** Machine-readable value, when available. */
  value?: string;
  /** LOMA/LOMR status for the flood panel. */
  lomaLomr?: "none" | "loma" | "lomr" | "unknown";
  /** NC FRIS cross-reference note. */
  ncNote?: string;
  /** Recovery damage classification. */
  recoveryValue?: "damage-reported" | "no-damage-record";
  /** Damage type from the county record. */
  damageType?: string;
  /** Source citation — only present when real data was fetched. */
  source?: { label: string; url: string; lastUpdated: string };
  /** Required disclaimer for flood data. */
  disclaimer?: string;
}

export interface LookupResult {
  flood: LookupPanelResult;
  str: LookupPanelResult;
  recovery: LookupPanelResult;
  schools: LookupPanelResult;
}

/**
 * Terminal shape for a lookup that could not be completed at all (network
 * failure, timeout, non-2xx response). Every panel lands on `unavailable`
 * with an honest message so the UI never sits in "checking" forever and never
 * implies data we didn't fetch.
 */
export function lookupFailurePanels(
  message = "We couldn't complete this lookup. The data services are temporarily unreachable — no guessed data is shown below."
): LookupResult {
  return {
    flood: { key: "flood", status: "unavailable", message },
    str: { key: "str", status: "unavailable", message },
    recovery: { key: "recovery", status: "unavailable", message },
    schools: { key: "schools", status: "unavailable", message },
  };
}

/**
 * Per-panel deadlines. The route awaits the anonymous log for up to 2s after
 * these resolve, so 3.5s here keeps the worst-case response under 6s.
 * Schools gets 3s and no retry at the source (lib/schools.ts).
 */
export const PANEL_TIMEOUT_MS = {
  flood: 3500,
  str: 3500,
  recovery: 3500,
  schools: 3000,
} as const;

export type PanelKey = "flood" | "str" | "recovery" | "schools";

/** Honest terminal state for a panel that exceeded its deadline. */
function panelUnavailable(key: PanelKey): LookupPanelResult {
  const message =
    key === "flood"
      ? "FEMA's flood map service is temporarily unreachable. We're not showing guessed data — check the official FEMA map."
      : key === "str"
        ? "Buncombe County's GIS service is temporarily unreachable. We're not showing guessed data — check the official zoning map."
        : key === "recovery"
          ? "Buncombe County's Helene damage records are temporarily unreachable. We're not showing guessed data — check the county's open data portal."
          : "Buncombe County's school-district boundaries service is temporarily unreachable. We're not showing guessed data — verify with the school district directly.";
  return { key, status: "unavailable", message };
}

/**
 * Resolve `fallback` when `promise` hasn't settled within `ms`. The upstream
 * fetch is not cancelled — this releases the response, it doesn't abort work
 * already in flight. Never rejects: a thrown panel also lands on the fallback.
 */
export function withDeadline<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T
): Promise<T> {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise
      .then((value) => resolve(value))
      .catch(() => resolve(fallback))
      .finally(() => clearTimeout(timer));
  });
}

export async function runLookup(ctx: LookupContext): Promise<LookupResult> {
  const started = performance.now();
  const timings: Record<PanelKey, number> = {
    flood: 0,
    str: 0,
    recovery: 0,
    schools: 0,
  };

  const runPanel = async (
    key: PanelKey,
    run: () => Promise<LookupPanelResult>
  ): Promise<LookupPanelResult> => {
    const panelStarted = performance.now();
    const panel = await withDeadline(
      Promise.resolve().then(run),
      PANEL_TIMEOUT_MS[key],
      panelUnavailable(key)
    );
    timings[key] = Math.round(performance.now() - panelStarted);
    return panel;
  };

  // Run all four checks in parallel — they are independent. Each is bounded:
  // a slow source resolves to an honest "unavailable" instead of holding the
  // whole response.
  const [flood, str, recovery, schools] = await Promise.all([
    runPanel("flood", () => runFlood(ctx)),
    runPanel("str", () => runStr(ctx)),
    runPanel("recovery", () => runRecovery(ctx)),
    runPanel("schools", () => runSchools(ctx)),
  ]);

  const result = { flood, str, recovery, schools };

  // Server-side measurement only — nothing is added to the public payload.
  console.info(
    "[lookup-timing]",
    JSON.stringify({
      ...timings,
      total: Math.round(performance.now() - started),
      statuses: {
        flood: flood.status,
        str: str.status,
        recovery: recovery.status,
        schools: schools.status,
      },
    })
  );

  return result;
}

/** Flood panel: call the flood module directly, map to the panel shape. */
async function runFlood(ctx: LookupContext): Promise<LookupPanelResult> {
  try {
    const r: FloodResult = await lookupFloodZone(ctx.latitude, ctx.longitude);
    if (r.status === "result" && r.zone) {
      return {
        key: "flood",
        status: "result",
        message: r.message,
        value: r.zone,
        lomaLomr: r.lomaLomr,
        ncNote: r.ncNote,
        source: r.sources?.[0]
          ? {
              label: r.sources[0].name,
              url: r.sources[0].url,
              lastUpdated: r.sources[0].lastUpdated,
            }
          : undefined,
        disclaimer:
          "This is informational and not a substitute for an official flood determination, elevation certificate, or insurance agent's assessment. Verify with FEMA and your insurer before relying on it.",
      };
    }
    return {
      key: "flood",
      status: "unavailable",
      message:
        r.message ??
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

/** STR panel: call the STR module directly, map to the panel shape. */
async function runStr(ctx: LookupContext): Promise<LookupPanelResult> {
  try {
    const r: StrResult = await lookupStrEligibility(ctx.latitude, ctx.longitude);
    if (r.status === "result") {
      return {
        key: "str",
        status: "result",
        message: r.message,
        value: r.value,
        source: r.source
          ? {
              label: r.source.label,
              url: r.source.url,
              lastUpdated: r.source.lastUpdated,
            }
          : undefined,
      };
    }
    return {
      key: "str",
      status: "unavailable",
      message:
        r.message ??
        "Buncombe County's GIS service is temporarily unreachable. We're not showing guessed data — check the official zoning map.",
    };
  } catch {
    return {
      key: "str",
      status: "unavailable",
      message:
        "Buncombe County's GIS service is temporarily unreachable. We're not showing guessed data — check the official zoning map.",
    };
  }
}

/** Recovery panel: call the recovery module directly (in-process, parallel). */
async function runRecovery(ctx: LookupContext): Promise<LookupPanelResult> {
  try {
    const r: RecoveryResult = await lookupRecoveryContext(
      ctx.latitude,
      ctx.longitude,
      ctx.address
    );
    if (r.status === "result" && r.value) {
      return {
        key: "recovery",
        status: "result",
        message: r.message,
        value: r.value,
        recoveryValue: r.value,
        damageType: r.damageType,
        source: r.sources?.[0]
          ? {
              label: r.sources[0].name,
              url: r.sources[0].url,
              lastUpdated: r.sources[0].lastUpdated,
            }
          : undefined,
        disclaimer: r.disclaimer,
      };
    }
    return {
      key: "recovery",
      status: "unavailable",
      message:
        r.message ??
        "Buncombe County's Helene damage records are temporarily unreachable. We're not showing guessed data — check the county's open data portal.",
    };
  } catch {
    return {
      key: "recovery",
      status: "unavailable",
      message:
        "Buncombe County's Helene damage records are temporarily unreachable. We're not showing guessed data — check the county's open data portal.",
    };
  }
}

/** Schools panel: call the schools module directly (in-process, parallel). */
async function runSchools(ctx: LookupContext): Promise<LookupPanelResult> {
  try {
    const r: SchoolResult = await lookupSchoolZone(ctx.latitude, ctx.longitude);
    if (r.status === "result" && r.message) {
      return {
        key: "schools",
        status: "result",
        message: r.message,
        source: r.source,
        disclaimer: r.disclaimer,
      };
    }
    return {
      key: "schools",
      status: "unavailable",
      message:
        r.message ??
        "Buncombe County's school-district boundaries service is temporarily unreachable. We're not showing guessed data — verify with the school district directly.",
    };
  } catch {
    return {
      key: "schools",
      status: "unavailable",
      message:
        "Buncombe County's school-district boundaries service is temporarily unreachable. We're not showing guessed data — verify with the school district directly.",
    };
  }
}
