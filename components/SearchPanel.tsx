"use client";

import { useState, useRef, type FormEvent } from "react";
import type { GeocodeResult } from "@/lib/geocode";
import SearchShell from "./SearchShell";

type PanelState =
  | { kind: "idle" }
  | { kind: "searching" }
  | { kind: "outside"; message: string; matchedAddress?: string }
  | { kind: "no-match"; message: string }
  | { kind: "error"; message: string };

/**
 * Pure gate for starting a lookup: one may only start when one isn't already
 * in flight AND the address is non-blank. Extracted so the same-tick
 * double-fire guard is unit-testable without a DOM.
 */
export function shouldStartLookup(busy: boolean, value: string): boolean {
  return !busy && value.trim().length > 0;
}

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
  // Synchronous in-flight flag. panel.kind is a state read — stale within the
  // same tick — so a double Enter (or Enter + click before the next render)
  // could otherwise start two lookups. A ref mutation is synchronous, so the
  // second event in the same tick is dropped.
  const busyRef = useRef(false);
  // Monotonic request id. If a newer lookup ever starts while an older one is
  // still in flight, the older one's late response must not clobber the panel,
  // skeleton, or share URL with a stale result.
  const seqRef = useRef(0);

  const lookup = async (address: string) => {
    if (busyRef.current) return; // drop duplicate same-tick submissions
    busyRef.current = true;
    const requestId = ++seqRef.current;
    // A response belongs only to the request that started it.
    const stale = () => requestId !== seqRef.current;

    // Fired synchronously inside the click/submit event so the skeleton
    // mounts within Chrome's 500ms recent-input window.
    onSearchState?.(true);
    setPanel({ kind: "searching" });
    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      if (stale()) return;
      const data = (await res.json()) as GeocodeResult;
      if (stale()) return;
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
      if (stale()) return;
      onSearchState?.(false);
      setPanel({
        kind: "error",
        message:
          "Could not reach the lookup service. Check your connection and try again.",
      });
    } finally {
      // Only the current request owns the busy flag: a superseded request must
      // not clear it while its replacement is still in flight.
      if (requestId === seqRef.current) busyRef.current = false;
    }
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!shouldStartLookup(busyRef.current, value)) return;
    void lookup(value.trim());
  };

  return (
    <SearchShell
      value={value}
      onValueChange={setValue}
      onSubmit={submit}
      onExample={(ex) => {
        setValue(ex);
        // Guarded inside lookup: same-tick and in-flight duplicates are dropped.
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
