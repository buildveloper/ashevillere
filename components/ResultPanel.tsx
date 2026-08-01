"use client";

import type { LookupPanelResult } from "@/lib/lookup";

export interface PanelSpec {
  key: "flood" | "str" | "recovery";
  eyebrow: string;
  title: string;
  detail: string;
  source: string;
  sourceUrl: string;
  lastUpdated: string;
  accent: "contour" | "river" | "clay";
}

const ACCENTS = {
  contour: {
    text: "text-contour",
    border: "border-contour/30",
    dot: "bg-contour",
  },
  river: {
    text: "text-river",
    border: "border-river/30",
    dot: "bg-river",
  },
  clay: {
    text: "text-clay",
    border: "border-clay/30",
    dot: "bg-clay",
  },
} as const;

/**
 * One data panel: Flood / STR / Recovery.
 * ALWAYS shows a result (or an honest "unavailable" message) + source +
 * last-updated + disclaimer link — per AGENTS.md hard constraint.
 */
export default function ResultPanel({
  spec,
  status,
  message,
  disclaimerHref = "/methodology",
}: {
  spec: PanelSpec;
  status: LookupPanelResult["status"];
  message?: string;
  disclaimerHref?: string;
}) {
  const accent = ACCENTS[spec.accent];
  const checking = status === "checking";

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border bg-surface p-6 ${accent.border} shadow-soft`}
    >
      <div className="flex items-center justify-between">
        <span className={`font-mono text-[11px] tracking-[0.18em] ${accent.text} uppercase`}>
          {spec.eyebrow}
        </span>
        <span className="flex items-center gap-2 font-mono text-[11px] text-muted">
          <span className={`h-1.5 w-1.5 rounded-full ${checking ? "animate-pulse bg-muted" : accent.dot}`} />
          {checking ? "CHECKING" : status === "result" ? "CHECKED" : "UNAVAILABLE"}
        </span>
      </div>

      <h3 className="font-display text-2xl font-medium text-ink">{spec.title}</h3>

      {status === "checking" && (
        <p className="text-sm leading-relaxed text-secondary">{spec.detail}</p>
      )}

      {status === "result" && message && (
        <p className="text-sm leading-relaxed text-secondary">{message}</p>
      )}

      {status !== "result" && status !== "checking" && (
        <div className="rounded-lg border border-line bg-paper/60 p-4">
          <p className="text-sm leading-relaxed text-secondary">
            {status === "unavailable"
              ? "This data source is temporarily unavailable. We're not showing you guessed data — check the official source below."
              : "We couldn't check this right now. Please try again or use the official source."}
          </p>
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <span className="font-mono text-[11px] text-muted">
          {spec.source} · {spec.lastUpdated}
        </span>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <a
            href={spec.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-river transition-colors hover:text-ink"
          >
            SOURCE ↗
          </a>
          <a href={disclaimerHref} className="text-muted transition-colors hover:text-ink">
            DISCLAIMER
          </a>
        </div>
      </div>
    </div>
  );
}
