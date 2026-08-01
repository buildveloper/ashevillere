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

export async function runLookup(ctx: LookupContext): Promise<LookupResult> {
  // Run all three checks in parallel — they are independent.
  const [flood, str, recovery] = await Promise.all([
    runFlood(ctx),
    runStr(ctx),
    runRecovery(),
  ]);
  return { flood, str, recovery };
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

/** Recovery panel: still not-connected (Phase 6). */
async function runRecovery(): Promise<LookupPanelResult> {
  const r: RecoveryResult = await lookupRecoveryContext();
  if (r.status === "result") {
    return { key: "recovery", status: "not-connected", message: r.message };
  }
  return {
    key: "recovery",
    status: "not-connected",
    message:
      "Not yet connected — live Day 6. Helene recovery and damage context are being wired to county/state data.",
  };
}
