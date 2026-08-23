"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SearchPanel from "./SearchPanel";
import ResultsStage from "./ResultsStage";
import type { GeocodeResult } from "@/lib/geocode";

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
 * HeroClient — the interactive island inside the server-rendered hero.
 * Owns the two things that genuinely need the client: the GSAP rise-in on
 * eyebrow/subhead/search (H1 excluded — it must stay painted for LCP), and
 * deep-link param restore + results mount.
 *
 * The H1 itself lives in the parent server component, so it ships in the
 * HTML document and paints without waiting for hydration.
 */
export default function HeroClient() {
  const rootRef = useRef<HTMLDivElement>(null);
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
        // Server-rendered fades live outside this island's subtree —
        // query the whole hero section, not just rootRef's children.
        gsap.set("[data-hero-fade]", { opacity: 1 });
        return;
      }
      const raf = requestAnimationFrame(() => {
        const targets = document.querySelectorAll("[data-hero-fade]");
        gsap.fromTo(
          targets,
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
    <div ref={rootRef}>
      <div data-hero-fade className="opacity-0" id="lookup">
        <SearchPanel onInScope={handleInScope} />
      </div>
      {lastResult && (
        <div id="results" className="mt-16 scroll-mt-24">
          <ResultsStage result={lastResult} />
        </div>
      )}
    </div>
  );
}