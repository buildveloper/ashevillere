"use client";

import { useState, type FormEvent } from "react";
import type { GeocodeResult } from "@/lib/geocode";
import SearchShell from "./SearchShell";

type PanelState =
  | { kind: "idle" }
  | { kind: "searching" }
  | { kind: "outside"; message: string; matchedAddress?: string }
  | { kind: "no-match"; message: string }
  | { kind: "error"; message: string };

/**
 * Address search — entry point of the product.
 * Renders through SearchShell (identical markup to the prerendered Suspense
 * fallback, so the hydration swap causes zero layout shift). Submits to the
 * Census Geocoder via /api/geocode; on an in-scope geocode it hands the
 * result up to the parent, which swaps the results skeleton for the real
 * stage. Every other outcome renders a clear inline message.
 */
export default function SearchPanel({
  onInScope,
  onSearchState,
  initialValue = "",
}: {
  onInScope: (result: GeocodeResult) => void;
  /** Sync signal so the parent can mount/clear the reserved-height skeleton. */
  onSearchState?: (searching: boolean) => void;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [panel, setPanel] = useState<PanelState>({ kind: "idle" });

  const lookup = async (address: string) => {
    // Fired synchronously inside the click/submit event so the skeleton
    // mounts within Chrome's 500ms recent-input window.
    onSearchState?.(true);
    setPanel({ kind: "searching" });
    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      const data = (await res.json()) as GeocodeResult;
      if (data.status === "in-scope") {
        setPanel({ kind: "idle" });
        onInScope(data);
      } else if (data.status === "outside") {
        onSearchState?.(false);
        setPanel({
          kind: "outside",
          message: data.message ?? "That address is outside Buncombe County.",
          matchedAddress: data.matchedAddress,
        });
      } else if (data.status === "no-match") {
        onSearchState?.(false);
        setPanel({
          kind: "no-match",
          message: data.message ?? "We couldn't find that address.",
        });
      } else {
        onSearchState?.(false);
        setPanel({ kind: "error", message: data.message ?? "Something went wrong." });
      }
    } catch {
      onSearchState?.(false);
      setPanel({
        kind: "error",
        message:
          "Could not reach the lookup service. Check your connection and try again.",
      });
    }
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value.trim() || panel.kind === "searching") return;
    void lookup(value.trim());
  };

  return (
    <SearchShell
      value={value}
      onValueChange={setValue}
      onSubmit={submit}
      onExample={(ex) => {
        setValue(ex);
        void lookup(ex);
      }}
      searching={panel.kind === "searching"}
      status={
        panel.kind === "idle" ? undefined : (
          <>
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
          </>
        )
      }
    />
  );
}
