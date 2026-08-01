"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ContourBackground from "./ContourBackground";
import SearchPanel from "./SearchPanel";
import ResultCard from "./ResultCard";

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
  const searchingRef = useRef(false);

  useGSAP(
    () => {
      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        gsap.set("[data-hero-rise]", { opacity: 1 });
        gsap.set("[data-card]", { opacity: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        "[data-hero-rise]",
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.12 }
      ).set("[data-card]", { y: 24, opacity: 0 });

      // Contour draw-in is triggered independently by ContourBackground;
      // hero text lands first so the copy is readable immediately.
    },
    { scope: rootRef }
  );

  const handleSearch = (address: string) => {
    if (searchingRef.current || !address.trim()) return;
    searchingRef.current = true;

    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];

    // Reduced motion: snap to end state, no timeline.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((card) => {
        card.dataset.status = "done";
        const statusText = card.querySelector("[data-status-text]");
        if (statusText) statusText.textContent = "CHECKED";
      });
      gsap.set(cards, { opacity: 1, y: 0 });
      searchingRef.current = false;
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
        searchingRef.current = false;
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
            data-hero-rise
            className="font-mono text-xs uppercase tracking-[0.22em] text-stone"
          >
            BUNCOMBE COUNTY · NC
          </p>
          <h1
            data-hero-rise
            className="font-display text-5xl font-medium leading-[1.05] text-ink sm:text-6xl lg:text-7xl"
          >
            Know what the land{" "}
            <span className="text-contour">remembers</span> before you buy.
          </h1>
          <p
            data-hero-rise
            className="max-w-xl text-lg leading-relaxed text-stone"
          >
            One address. Flood risk, short-term rental eligibility, and
            Hurricane Helene recovery context — drawn from free public records,
            not sales pitches.
          </p>
          <div data-hero-rise>
            <SearchPanel onSearch={handleSearch} />
          </div>
        </div>

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
