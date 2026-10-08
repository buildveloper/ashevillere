"use client";

import { useEffect, useRef, useState } from "react";
import type { GeocodeResult } from "@/lib/geocode";
import { lookupFailurePanels, type LookupResult, type PanelStatus } from "@/lib/lookup";
import ResultPanel, { type PanelSpec } from "./ResultPanel";
import LeadForm from "./LeadForm";

const SPECS: PanelSpec[] = [
  {
    key: "flood",
    eyebrow: "FLOOD",
    title: "Flood zone",
    detail: "FEMA National Flood Hazard Layer",
    accent: "contour",
    officialSourceUrl: "https://www.fema.gov/flood-maps/national-flood-hazard-layer",
  },
  {
    key: "str",
    eyebrow: "STR",
    title: "STR eligibility",
    detail: "Buncombe County zoning overlay",
    accent: "river",
    officialSourceUrl: "https://gis.buncombecounty.org",
  },
  {
    key: "recovery",
    eyebrow: "RECOVERY",
    title: "Helene recovery",
    detail: "Post-storm recovery context",
    accent: "clay",
    officialSourceUrl: "https://data.buncombenc.gov/",
  },
  {
    key: "schools",
    eyebrow: "SCHOOLS",
    title: "School assignment",
    detail: "Buncombe County school-district boundaries",
    accent: "river",
    officialSourceUrl: "https://gis.buncombenc.gov/schools/",
  },
];

// Citations come from the lookup payload and are only present when real data
// was fetched for that panel (all four panels are wired).
const INITIAL: LookupResult = {
  flood: { key: "flood", status: "checking" },
  str: { key: "str", status: "checking" },
  recovery: { key: "recovery", status: "checking" },
  schools: { key: "schools", status: "checking" },
};

/**
 * ResultsStage — the product's payoff moment. Shows the geocoded address,
 * runs the four checks in parallel, and staggers the panels in as each
 * resolves. Panels always show a real result or an honest state. All four
 * panels are wired to real data (FEMA NFHL / Buncombe zoning / Helene damage
 * records / school-district boundaries); each shows its own source citation
 * when a real fetch succeeded.
 */
export default function ResultsStage({
  result,
}: {
  result: GeocodeResult;
}) {
  const [lookup, setLookup] = useState<LookupResult>(INITIAL);
  const rootRef = useRef<HTMLDivElement>(null);

  // Kick off the four checks when the geocode result arrives.
  useEffect(() => {
    if (!result.latitude || !result.longitude) return;
    let cancelled = false;

    const run = async () => {
      const params = new URLSearchParams({
        lat: result.latitude!.toFixed(5),
        lon: result.longitude!.toFixed(5),
      });
      if (result.zip) params.set("zip", result.zip);
      if (result.matchedAddress) params.set("address", result.matchedAddress);
      // A new address starts fresh: panels go back to CHECKING instead of
      // showing the previous address's outcome while the next lookup runs.
      setLookup(INITIAL);
      try {
        const res = await fetch(`/api/lookup?${params.toString()}`, {
          // Bound the whole lookup so a hung upstream can't leave the panels
          // spinning forever. Server-side calls each allow ~20s worst case;
          // give the client the same order of magnitude plus network slack.
          signal: AbortSignal.timeout(30000),
        });
        if (cancelled) return;
        if (!res.ok) {
          // A non-2xx response (429 rate limit, 5xx) has no panel data — parse
          // the server's error message when present, then land on an honest
          // failure state instead of "checking" forever.
          let message = `The lookup service returned an error (${res.status}). Try again in a moment.`;
          try {
            const errBody = (await res.json()) as { error?: string };
            if (errBody.error) message = errBody.error;
          } catch {
            // Non-JSON error body — keep the status-based message.
          }
          if (cancelled) return;
          setLookup(lookupFailurePanels(message));
          return;
        }
        const data = (await res.json()) as LookupResult;
        if (cancelled) return;
        setLookup(data);
      } catch {
        // Network failure, timeout, or unreadable body — the one case that
        // previously left the panels spinning forever.
        if (cancelled) return;
        setLookup(
          lookupFailurePanels(
            "The lookup could not be completed — check your connection and try again. No guessed data is shown below."
          )
        );
      }
    };
    void run();

    return () => {
      cancelled = true;
    };
  }, [result]);

  const statusOf = (key: "flood" | "str" | "recovery" | "schools"): PanelStatus =>
    lookup[key]?.status ?? "checking";

  // Site-wide outage banner: only show once the lookup has finished settling
  // (no panel still in "checking") AND at least one panel landed on
  // "unavailable" or "error" — i.e. a real upstream failure, not a spinner.
  const allResolved = (["flood", "str", "recovery", "schools"] as const).every(
    (k) => statusOf(k) !== "checking",
  );
  const anyOutage = (["flood", "str", "recovery", "schools"] as const).some(
    (k) => statusOf(k) === "unavailable" || statusOf(k) === "error",
  );
  const showOutageBanner = allResolved && anyOutage;

  return (
    <div ref={rootRef} className="w-full">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
            Address located
          </p>
          <h2 className="mt-1 font-display text-3xl font-medium text-ink sm:text-4xl">
            {result.matchedAddress ?? "Your address"}
          </h2>
        </div>
        <p className="font-mono text-[11px] leading-relaxed text-muted">
          GECODED {result.latitude?.toFixed(5)}, {result.longitude?.toFixed(5)} · ZIP{" "}
          {result.zip} · CENSUS BUREAU
        </p>
      </div>

      {showOutageBanner && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-clay/30 bg-paper/60 p-4"
        >
          <p className="font-mono text-[11px] tracking-[0.18em] text-clay uppercase">
            Some data sources unreachable
          </p>
          <p className="mt-1 text-sm leading-relaxed text-secondary">
            The affected panels below show official-source links instead of
            guessed data — nothing here is fabricated. Try again in a moment.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {SPECS.map((spec) => {
          const panel = lookup[spec.key];
          const citation = panel?.source;
          return (
            <div key={spec.key}>
              <ResultPanel
                spec={spec}
                status={statusOf(spec.key)}
                message={panel?.message}
                sourceLabel={citation?.label}
                sourceUrl={citation?.url}
                lastUpdated={citation?.lastUpdated}
                disclaimer={panel?.disclaimer}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-10 md:max-w-2xl">
        <LeadForm variant="track" address={result.matchedAddress} />
      </div>
    </div>
  );
}
