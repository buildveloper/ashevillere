"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Topographic contour-line motif — the signature element of the brand.
 * A set of hand-built contour paths, drawn in via GSAP strokeDashoffset on
 * page load. Purely decorative: aria-hidden, and reduced-motion users get
 * the end state instantly (contours fully visible, no animation).
 */
export default function ContourBackground() {
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const paths = gsap.utils.toArray<SVGPathElement>(
        svgRef.current?.querySelectorAll("path") ?? []
      );

      gsap.fromTo(
        paths,
        { strokeDashoffset: (i) => -(i % 2 === 0 ? 2600 : 3200) },
        {
          strokeDashoffset: 0,
          duration: 1.8,
          ease: "power2.out",
          stagger: 0.06,
          delay: 0.15,
        }
      );
    },
    { scope: svgRef }
  );

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full select-none"
      viewBox="0 0 1440 900"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        stroke="#B8763A"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      >
        <path d="M-100 220 C 200 120, 380 320, 620 260 S 1040 130, 1540 240" />
        <path d="M-100 300 C 220 190, 410 410, 660 340 S 1080 210, 1540 330" />
        <path d="M-100 390 C 240 270, 440 500, 700 420 S 1120 290, 1540 420" />
        <path d="M-100 490 C 260 360, 470 600, 740 500 S 1160 370, 1540 510" />
        <path d="M-100 600 C 280 460, 500 700, 780 580 S 1200 450, 1540 600" />
        <path d="M-100 720 C 300 560, 530 810, 820 660 S 1240 530, 1540 690" />
        <path d="M-100 850 C 320 670, 560 920, 860 740 S 1280 610, 1540 780" />
        {/* Ridgeline knots */}
        <path d="M 300 180 C 340 140, 380 140, 420 180 S 460 240, 500 220" />
        <path d="M 900 520 C 940 480, 980 480, 1020 520 S 1060 580, 1100 560" />
        <path d="M 80 560 C 120 520, 160 520, 200 560 S 240 620, 280 600" />
        <path d="M 1150 300 C 1190 260, 1230 260, 1270 300 S 1310 360, 1350 340" />
        <path d="M 620 120 C 660 80, 700 80, 740 120 S 780 180, 820 160" />
      </g>
      {/* Elevation labels — mono, data voice */}
      <g
        fontFamily="var(--font-plex-mono), ui-monospace, monospace"
        fontSize="11"
        fill="#6B7268"
        opacity="0.8"
      >
        <text x="300" y="170">2,340′</text>
        <text x="900" y="510">1,120′</text>
        <text x="1150" y="290">3,050′</text>
      </g>
    </svg>
  );
}
