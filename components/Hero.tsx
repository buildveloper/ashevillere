"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ContourBackground from "./ContourBackground";
import SearchPanel from "./SearchPanel";
import ResultCard from "./ResultCard";
import type { GeocodeResult } from "@/lib/geocode";

/**
 * Hero — the single "big" motion moment of the site.
 *
 * Load: one orchestrated sequence — contour draw-in runs while the
 * headline, subhead, and search bar rise in staggered. Everything lands
 * by ~2.2s, inside the 2.5s budget.
 *
 * Search: the three result cards stagger up + fade in, each flipping to a
 * simulated lookup state, then settling. This is the product's payoff
 * moment, so it gets the most generous easing.
 *
 * prefers-reduced-motion: everything jumps straight to end states.
 */
export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animatingRef = useRef(false);
  const [lastResult, setLastResult] = useState<GeocodeResult | null>(null);

  useGSAP(
    () => {
      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        gsap.set("[data-hero-fade]", { opacity: 1 });
        gsap.set("[data-card]", { opacity: 1, y: 0 });
        return;
      }

      // Defer the entrance sequence until after the first paint so the LCP
      // element (static headline) renders before GSAP does any work.
      const raf = requestAnimationFrame(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // The headline is never animated (stays painted at opacity 1) — it is
        // the LCP element, and any transform/opacity on it delays the LCP
        // metric. The rise/stagger is carried by the eyebrow, subhead, and
        // search bar instead; the sequence still reads as one orchestrated
        // entrance while the LCP element paints on the first frame.
        tl.fromTo(
          "[data-hero-fade]",
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 }
        ).set("[data-card]", { y: 24, opacity: 0 });
      });

      // Contour draw-in is triggered independently by ContourBackground;
      // hero text lands first so the copy is readable immediately.
      return () => cancelAnimationFrame(raf);
    },
    { scope: rootRef }
  );

  const handleInScope = (result: GeocodeResult) => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    setLastResult(result);

    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];

    // Reset cards to hidden before the reveal.
    gsap.set(cards, { opacity: 0, y: 24 });
    cards.forEach((card) => {
      card.dataset.status = "idle";
      const statusText = card.querySelector("[data-status-text]");
      if (statusText) statusText.textContent = "PENDING LOOKUP";
    });

    // Reduced motion: snap to end state, no timeline.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((card) => {
        card.dataset.status = "done";
        const statusText = card.querySelector("[data-status-text]");
        if (statusText) statusText.textContent = "CHECKED";
      });
      gsap.set(cards, { opacity: 1, y: 0 });
      animatingRef.current = false;
      return;
    }

    gsap
      .timeline()
      .to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: "power2.out",
        stagger: 0.14,
      })
      .to(
        cards,
        {
          y: -6,
          duration: 0.2,
          ease: "power1.out",
          stagger: 0.14,
        },
        "-=0.1"
      )
      .to(
        cards,
        {
          y: 0,
          duration: 0.35,
          ease: "power3.out",
          stagger: 0.14,
        },
        "<"
      )
      .call(() => {
        cards.forEach((card) => {
          card.dataset.status = "done";
          const statusText = card.querySelector("[data-status-text]");
          if (statusText) statusText.textContent = "CHECKED";
        });
        animatingRef.current = false;
      });
  };

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pb-24 pt-28"
    >
      <ContourBackground />
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="flex max-w-3xl flex-col gap-6">
          <p
            data-hero-fade
            className="font-mono text-xs uppercase tracking-[0.22em] text-stone opacity-0"
          >
            BUNCOMBE COUNTY · NC
          </p>
          <h1 className="font-display text-5xl font-medium leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
            Know what the land{" "}
            <span className="text-contour">remembers</span> before you buy.
          </h1>
          <p
            data-hero-fade
            className="max-w-xl text-lg leading-relaxed text-stone opacity-0"
          >
            One address. Flood risk, short-term rental eligibility, and
            Hurricane Helene recovery context — drawn from free public records,
            not sales pitches.
          </p>
          <div data-hero-fade className="opacity-0">
            <SearchPanel onInScope={handleInScope} />
          </div>
        </div>

        {lastResult && (
          <p
            data-lookup-confirm
            className="mt-8 max-w-3xl font-mono text-[11px] leading-relaxed text-stone"
          >
            GECODED → {lastResult.matchedAddress ?? "matched"} ·{" "}
            {lastResult.latitude?.toFixed(5)}, {lastResult.longitude?.toFixed(5)} ·{" "}
            ZIP {lastResult.zip}
          </p>
        )}

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              data-card
              className="opacity-0"
            >
              <ResultCard index={i} className="h-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
