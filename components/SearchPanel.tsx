"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import type { GeocodeResult } from "@/lib/geocode";

type PanelState =
  | { kind: "idle" }
  | { kind: "searching" }
  | { kind: "outside"; message: string; matchedAddress?: string }
  | { kind: "no-match"; message: string }
  | { kind: "error"; message: string };

/**
 * Address search — entry point of the product.
 * Submits to the Census Geocoder via /api/geocode. On a successful
 * in-scope geocode it hands the result up to Hero, which triggers the
 * result-card stagger-in. Every other outcome renders its own clear
 * message inline (outside coverage / no match / error).
 */
export default function SearchPanel({
  onInScope,
}: {
  onInScope: (result: GeocodeResult) => void;
}) {
  const [value, setValue] = useState("");
  const [panel, setPanel] = useState<PanelState>({ kind: "idle" });

  const lookup = async (address: string) => {
    setPanel({ kind: "searching" });
    try {
      const res = await fetch(
        `/api/geocode?address=${encodeURIComponent(address)}`
      );
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
        message: "Could not reach the lookup service. Check your connection and try again.",
      });
    }
  };

  const submit = () => {
    if (!value.trim() || panel.kind === "searching") return;
    void lookup(value.trim());
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="w-full max-w-2xl">
      <form
        onSubmit={handleSubmit}
        className="group flex items-center gap-2 rounded-2xl border border-pine/15 bg-card p-2 shadow-[0_12px_40px_-12px_rgba(23,36,28,0.25)] transition-all duration-300 focus-within:border-river/50 focus-within:shadow-[0_16px_48px_-12px_rgba(62,124,140,0.35)]"
      >
        <span aria-hidden="true" className="pl-3 text-stone">
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
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent py-2.5 text-base text-ink placeholder:text-stone focus:outline-none"
        />
        <button
          type="submit"
          disabled={panel.kind === "searching"}
          className="shrink-0 rounded-xl bg-pine px-5 py-2.5 text-sm font-medium text-card transition-colors duration-200 hover:bg-pine-2 disabled:cursor-wait disabled:opacity-60"
        >
          {panel.kind === "searching" ? "Looking up…" : "Look up"}
        </button>
      </form>

      <p
        role="status"
        aria-live="polite"
        className="mt-2 font-mono text-[11px] leading-relaxed text-stone"
      >
        {panel.kind === "idle" &&
          "FREE PUBLIC DATA · FEMA · NC FLOODPLAIN · BUNCOMBE CO GIS"}
        {panel.kind === "searching" &&
          `GEOCODING → ${value.toUpperCase()} · CENSUS BUREAU`}
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
    </div>
  );
}
