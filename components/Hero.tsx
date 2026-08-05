"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ContourBackground from "./ContourBackground";
import SearchPanel from "./SearchPanel";
import ResultsStage from "./ResultsStage";
import type { GeocodeResult } from "@/lib/geocode";

// Lazy-load WebGL terrain so it never blocks first paint.
const TerrainStage = dynamic(() => import("./TerrainStage"), {
  ssr: false,
  loading: () => null,
});

/** Rebuild a GeocodeResult from shareable URL params. */
function resultFromParams(
  lat: string | null,
  lon: string | null,
  searchParams: URLSearchParams
): GeocodeResult | null {
  if (!lat || !lon) return null;
  const nLat = Number(lat);
  const nLon = Number(lon);
  if (!Number.isFinite(nLat) || !Number.isFinite(nLon)) return null;
  return {
    status: "in-scope",
    matchedAddress: searchParams.get("address") ?? "Address",
    latitude: nLat,
    longitude: nLon,
    zip: searchParams.get("zip") ?? undefined,
  };
}

/**
 * Hero — the single "big" motion moment of the site.
 * Headline paints immediately (LCP); eyebrow, subhead, and search rise
 * staggered. Terrain fades up behind. On a successful geocode the results
 * stage appears below and the terrain flies to the property.
 */
export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const searchParams = useSearchParams();

  // Restore a shared/deep link on first load (lazy init — no effect setState).
  const [deepResult] = useState<GeocodeResult | null>(() =>
    resultFromParams(
      searchParams.get("lat"),
      searchParams.get("lon"),
      new URLSearchParams(searchParams.toString())
    )
  );
  const [lastResult, setLastResult] = useState<GeocodeResult | null>(deepResult);

  // Scroll deep-linked results into view after first paint.
  useEffect(() => {
    if (!deepResult) return;
    const id = requestAnimationFrame(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(id);
  }, [deepResult]);

  useGSAP(
    () => {
      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set("[data-hero-fade]", { opacity: 1 });
        return;
      }
      const raf = requestAnimationFrame(() => {
        gsap.fromTo(
          "[data-hero-fade]",
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.1 }
        );
      });
      return () => cancelAnimationFrame(raf);
    },
    { scope: rootRef }
  );

  const handleInScope = useCallback((result: GeocodeResult) => {
    setLastResult(result);
    // Shareable URL state (back-button safe).
    const params = new URLSearchParams();
    params.set("address", result.matchedAddress ?? "");
    if (result.latitude) params.set("lat", result.latitude.toFixed(5));
    if (result.longitude) params.set("lon", result.longitude.toFixed(5));
    if (result.zip) params.set("zip", result.zip);
    window.history.replaceState(null, "", `/?${params.toString()}`);
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pb-24 pt-28"
    >
      <ContourBackground />
      <TerrainStage />
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="flex max-w-3xl flex-col gap-6">
          <p
            data-hero-fade
            className="font-mono text-xs uppercase tracking-[0.22em] text-secondary opacity-0"
          >
            BUNCOMBE COUNTY · NC
          </p>
          <h1 className="font-display text-5xl font-medium leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
            Know what the land{" "}
            <span className="text-contour">remembers</span> before you buy.
          </h1>
          <p
            data-hero-fade
            className="max-w-xl text-lg leading-relaxed text-secondary opacity-0"
          >
            One address. Flood risk, short-term rental eligibility, and Hurricane
            Helene recovery context — drawn from free public records, not sales
            pitches.
          </p>
          <div data-hero-fade className="opacity-0" id="lookup">
            <SearchPanel onInScope={handleInScope} />
          </div>
        </div>

        {lastResult && (
          <div id="results" className="mt-16 scroll-mt-24">
            <ResultsStage result={lastResult} />
          </div>
        )}
      </div>
    </section>
  );
}
