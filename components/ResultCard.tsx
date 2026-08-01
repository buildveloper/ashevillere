"use client";

import { forwardRef, type HTMLAttributes } from "react";

type CardStatus = "idle" | "loading" | "done";

export interface ResultCardHandle {
  status: CardStatus;
}

const cards = [
  {
    eyebrow: "FLOOD",
    title: "Flood zone",
    detail: "FEMA Flood Insurance Rate Map",
    accent: "text-contour border-contour/40",
    dot: "bg-contour",
    source: "FEMA NFHL · 2024",
  },
  {
    eyebrow: "STR",
    title: "STR eligibility",
    detail: "Buncombe County zoning overlay",
    accent: "text-river border-river/40",
    dot: "bg-river",
    source: "Buncombe Co. GIS · 2025",
  },
  {
    eyebrow: "RECOVERY",
    title: "Helene recovery",
    detail: "Post-storm public-assistance status",
    accent: "text-clay border-clay/40",
    dot: "bg-clay",
    source: "NC DPS Helene Response · 2025",
  },
];

interface ResultCardProps extends HTMLAttributes<HTMLDivElement> {
  index: number;
}

const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(
  ({ index, className = "", ...rest }, ref) => {
    const card = cards[index];
    return (
      <div
        ref={ref}
        data-status="idle"
        className={`flex flex-col gap-3 rounded-2xl border bg-card p-6 ${card.accent} ${className}`}
        {...rest}
      >
        <span className="font-mono text-[11px] tracking-[0.18em] text-stone">
          {card.eyebrow}
        </span>
        <h3 className="font-display text-2xl text-ink">{card.title}</h3>
        <p className="text-sm leading-relaxed text-stone">{card.detail}</p>
        <div className="mt-auto flex items-center justify-between border-t border-pine/10 pt-3">
          <span className="flex items-center gap-2 font-mono text-[11px] text-stone">
            <span className={`h-1.5 w-1.5 rounded-full ${card.dot}`} />
            <span data-status-text>PENDING LOOKUP</span>
          </span>
          <span className="font-mono text-[11px] text-stone">{card.source}</span>
        </div>
      </div>
    );
  }
);
ResultCard.displayName = "ResultCard";

export default ResultCard;
