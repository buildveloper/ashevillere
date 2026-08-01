"use client";

import { useState, type FormEvent } from "react";
import type { GeocodeResult } from "@/lib/geocode";

type PanelState =
  | { kind: "idle" }
  | { kind: "searching" }
  | { kind: "outside"; message: string; matchedAddress?: string }
  | { kind: "no-match"; message: string }
  | { kind: "error"; message: string };

const EXAMPLES = ["1 N Pack Sq, Asheville", "20 Church St, Black Mountain", "68 Old Leicester Rd, Weaverville"];

/**
 * Address search — entry point of the product.
 * Submits to the Census Geocoder via /api/geocode. On an in-scope geocode it
 * hands the result up to the parent, which triggers the results stage.
 * Every other outcome renders a clear inline message.
 */
export default function SearchPanel({
  onInScope,
  initialValue = "",
}: {
  onInScope: (result: GeocodeResult) => void;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [panel, setPanel] = useState<PanelState>({ kind: "idle" });

  const lookup = async (address: string) => {
    setPanel({ kind: "searching" });
    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      const data = (await res.json()) as GeocodeResult;
      if (data.status === "in-scope") {
        setPanel({ kind: "idle" });
        onInScope(data);
      } else if (data.status === "outside") {
        setPanel({
          kind: "outside",
          message: data.message ?? "That address is outside Buncombe County.",
          matchedAddress: data.matchedAddress,
        });
      } else if (data.status === "no-match") {
        setPanel({
          kind: "no-match",
          message: data.message ?? "We couldn't find that address.",
        });
      } else {
        setPanel({ kind: "error", message: data.message ?? "Something went wrong." });
      }
    } catch {
      setPanel({
        kind: "error",
        message:
          "Could not reach the lookup service. Check your connection and try again.",
      });
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || panel.kind === "searching") return;
    void lookup(value.trim());
  };

  return (
    <div className="w-full max-w-2xl">
      <form
        onSubmit={submit}
        className="group flex items-center gap-2 rounded-2xl border border-line bg-surface p-2 shadow-soft transition-all duration-300 focus-within:border-river/50 focus-within:shadow-float"
      >
        <span aria-hidden="true" className="pl-3 text-muted">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
        <label htmlFor="address-search" className="sr-only">
          Search an address
        </label>
        <input
          id="address-search"
          type="text"
          inputMode="search"
          autoComplete="street-address"
          placeholder="Enter a Buncombe County address…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-transparent py-2.5 text-base text-ink placeholder:text-muted focus:outline-none"
        />
        <button
          type="submit"
          disabled={panel.kind === "searching"}
          className="shrink-0 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-card transition-colors duration-200 hover:bg-brand-hover disabled:cursor-wait disabled:opacity-60"
        >
          {panel.kind === "searching" ? "Looking up…" : "Look up"}
        </button>
      </form>

      <p
        role="status"
        aria-live="polite"
        className="mt-2 font-mono text-[11px] leading-relaxed text-muted"
      >
        {panel.kind === "idle" && "FREE PUBLIC DATA · FEMA · NC FLOODPLAIN · BUNCOMBE CO GIS"}
        {panel.kind === "searching" && `GEOCODING → ${value.toUpperCase()} · CENSUS BUREAU`}
        {panel.kind === "no-match" && (
          <span className="text-clay">NO MATCH — {panel.message}</span>
        )}
        {panel.kind === "outside" && (
          <span className="text-clay">OUTSIDE COVERAGE — {panel.message}</span>
        )}
        {panel.kind === "error" && (
          <span className="text-clay">ERROR — {panel.message}</span>
        )}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] text-muted">TRY</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setValue(ex);
              void lookup(ex);
            }}
            className="rounded-full border border-line bg-surface px-3 py-1 font-mono text-[11px] text-secondary transition-colors duration-200 hover:border-river/40 hover:text-ink"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
