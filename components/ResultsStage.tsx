"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { GeocodeResult } from "@/lib/geocode";
import type { LookupResult, PanelStatus } from "@/lib/lookup";
import ResultPanel, { type PanelSpec } from "./ResultPanel";

const SPECS: PanelSpec[] = [
  {
    key: "flood",
    eyebrow: "FLOOD",
    title: "Flood zone",
    detail: "FEMA National Flood Hazard Layer",
    source: "FEMA NFHL",
    sourceUrl: "https://www.fema.gov/flood-maps/national-flood-hazard-layer",
    lastUpdated: "NFHL current effective",
    accent: "contour",
  },
  {
    key: "str",
    eyebrow: "STR",
    title: "STR eligibility",
    detail: "Buncombe County zoning overlay",
    source: "Buncombe Co. GIS",
    sourceUrl: "https://gis.buncombecounty.org",
    lastUpdated: "Zoning overlay",
    accent: "river",
  },
  {
    key: "recovery",
    eyebrow: "RECOVERY",
    title: "Helene recovery",
    detail: "Post-storm recovery context",
    source: "NC DPS · County",
    sourceUrl: "https://www.ncdps.gov",
    lastUpdated: "Recovery programs",
    accent: "clay",
  },
];

const INITIAL: LookupResult = {
  flood: { key: "flood", status: "checking" },
  str: { key: "str", status: "checking" },
  recovery: { key: "recovery", status: "checking" },
};

/**
 * ResultsStage — the product's payoff moment. Shows the geocoded address,
 * runs the three checks in parallel, and staggers the panels in as each
 * resolves. Panels always show a real result or an honest unavailable state.
 */
export default function ResultsStage({
  result,
}: {
  result: GeocodeResult;
}) {
  const [lookup, setLookup] = useState<LookupResult>(INITIAL);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Kick off the three checks when the geocode result arrives.
  useEffect(() => {
    if (!result.latitude || !result.longitude) return;
    let cancelled = false;

    const run = async () => {
      const res = await fetch(
        `/api/lookup?lat=${result.latitude!.toFixed(5)}&lon=${result.longitude!.toFixed(5)}&zip=${result.zip ?? ""}`
      );
      if (cancelled) return;
      const data = (await res.json()) as LookupResult;
      if (cancelled) return;
      setLookup(data);
    };
    void run();

    return () => {
      cancelled = true;
    };
  }, [result]);

  // Stagger the panels in.
  useGSAP(
    () => {
      const cards = panelsRef.current.filter(Boolean) as HTMLDivElement[];
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(cards, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        cards,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power2.out", stagger: 0.14 }
      );
    },
    { scope: rootRef, dependencies: [result] }
  );

  const statusOf = (key: "flood" | "str" | "recovery"): PanelStatus =>
    lookup[key]?.status ?? "checking";

  return (
    <div ref={rootRef} className="w-full">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
            Lookup complete
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

      <div className="grid gap-4 md:grid-cols-3">
        {SPECS.map((spec, i) => (
          <div
            key={spec.key}
            ref={(el) => {
              panelsRef.current[i] = el;
            }}
            className="opacity-0"
          >
            <ResultPanel
              spec={spec}
              status={statusOf(spec.key)}
              message={lookup[spec.key]?.message}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
