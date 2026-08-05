"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Reveal — ScrollTrigger wrapper: fades + rises children in as they enter
 * the viewport. Reduced motion: content stays visible (no transform).
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // CLS guard: if the element is already inside (or near) the viewport at
      // load, don't hide it and animate it — that would move content after
      // first paint and cause a layout shift. Only below-fold content gets
      // the reveal.
      if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          delay,
          scrollTrigger: { trigger: el, start: "top 85%" },
        }
      );
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
