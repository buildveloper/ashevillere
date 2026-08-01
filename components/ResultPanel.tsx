"use client";

import type { LookupPanelResult } from "@/lib/lookup";

export interface PanelSpec {
  key: "flood" | "str" | "recovery";
  eyebrow: string;
  title: string;
  detail: string;
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
 *
 * Honesty rule (AGENTS.md): never present a "checked" state or a citation
 * for data that was not actually fetched. States:
 * - checking: the lookup is in flight.
 * - not-connected: the data source is not wired yet — no fake result, no
 *   fake citation. Shows the live date instead.
 * - result: only after real data was fetched; shows source + last-updated.
 * - unavailable/error: upstream failed; links to the official source.
 */
export default function ResultPanel({
  spec,
  status,
  message,
  sourceLabel,
  sourceUrl,
  lastUpdated,
  disclaimer,
  disclaimerHref = "/methodology",
}: {
  spec: PanelSpec;
  status: LookupPanelResult["status"];
  message?: string;
  sourceLabel?: string;
  sourceUrl?: string;
  lastUpdated?: string;
  disclaimer?: string;
  disclaimerHref?: string;
}) {
  const accent = ACCENTS[spec.accent];
  const checking = status === "checking";
  const notConnected = status === "not-connected";
  // Only show a source citation when we actually have data behind it.
  const hasCitation = status === "result" && sourceLabel && sourceUrl;

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border bg-surface p-6 ${accent.border} shadow-soft`}
    >
      <div className="flex items-center justify-between">
        <span className={`font-mono text-[11px] tracking-[0.18em] ${accent.text} uppercase`}>
          {spec.eyebrow}
        </span>
        <span className="flex items-center gap-2 font-mono text-[11px] text-muted">
          <span className={`h-1.5 w-1.5 rounded-full ${checking ? "animate-pulse bg-muted" : notConnected ? "bg-muted" : accent.dot}`} />
          {checking
            ? "CHECKING"
            : notConnected
              ? "NOT YET CONNECTED"
              : status === "result"
                ? "CHECKED"
                : "UNAVAILABLE"}
        </span>
      </div>

      <h3 className="font-display text-2xl font-medium text-ink">{spec.title}</h3>

      {checking && (
        <p className="text-sm leading-relaxed text-secondary">{spec.detail}</p>
      )}

      {notConnected && (
        <div className="rounded-lg border border-dashed border-line bg-paper/60 p-4">
          <p className="text-sm leading-relaxed text-secondary">
            {message ??
              "Not yet connected — live Day 6. This panel is being wired to its public data source."}
          </p>
        </div>
      )}

      {status === "result" && message && (
        <p className="text-sm leading-relaxed text-secondary">{message}</p>
      )}

      {status === "result" && disclaimer && (
        <p className="rounded-lg border border-dashed border-line bg-paper/60 p-3 text-xs leading-relaxed text-muted">
          {disclaimer}
        </p>
      )}

      {status !== "result" && status !== "checking" && status !== "not-connected" && (
        <div className="rounded-lg border border-line bg-paper/60 p-4">
          <p className="text-sm leading-relaxed text-secondary">
            {status === "unavailable"
              ? "This data source is temporarily unavailable. We're not showing you guessed data — check the official source below."
              : "We couldn't check this right now. Please try again or use the official source."}
          </p>
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        {hasCitation ? (
          <>
            <span className="font-mono text-[11px] text-muted">
              {sourceLabel} · {lastUpdated}
            </span>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <a
                href={sourceUrl}
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
          </>
        ) : (
          <div className="flex w-full items-center justify-between gap-2 font-mono text-[11px]">
            <span className="text-muted">
              {notConnected ? "WIRING TO PUBLIC DATA · LIVE DAY 6" : "SOURCE PENDING"}
            </span>
            <a href={disclaimerHref} className="text-muted transition-colors hover:text-ink">
              DISCLAIMER
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
