import type { FormEvent, ReactNode } from "react";

export const EXAMPLES = [
  "1 N Pack Sq, Asheville",
  "20 Church St, Black Mountain",
  "68 Old Leicester Rd, Weaverville",
];

/**
 * Static geometry of the address search box, shared by the live SearchPanel
 * and the prerendered Suspense fallback in Hero. Rendering the identical
 * markup in both places means the fallback occupies the final height before
 * hydration, so the swap causes zero layout shift. Without handlers it
 * degrades to a non-interactive skeleton (readOnly input, disabled buttons).
 */
export default function SearchShell({
  value = "",
  onValueChange,
  onSubmit,
  onExample,
  searching = false,
  status,
}: {
  value?: string;
  onValueChange?: (v: string) => void;
  /** Form submit handler; also enables the example chips. */
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  onExample?: (address: string) => void;
  searching?: boolean;
  status?: ReactNode;
}) {
  return (
    <div className="w-full max-w-2xl">
      <form
        onSubmit={onSubmit}
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
          onChange={onValueChange ? (e) => onValueChange(e.target.value) : undefined}
          readOnly={!onValueChange}
          className="w-full bg-transparent py-2.5 text-base text-ink placeholder:text-muted focus:outline-none"
        />
        <button
          type="submit"
          disabled={!onSubmit || searching}
          className="shrink-0 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-card transition-colors duration-200 hover:bg-brand-hover disabled:cursor-wait disabled:opacity-60"
        >
          {searching ? "Looking up…" : "Look up"}
        </button>
      </form>

      <p
        role="status"
        aria-live="polite"
        className="mt-2 font-mono text-[11px] leading-relaxed text-muted"
      >
        {status ?? "FREE PUBLIC DATA · FEMA · NC FLOODPLAIN · BUNCOMBE CO GIS"}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] text-muted">TRY</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            disabled={!onExample}
            onClick={onExample ? () => onExample(ex) : undefined}
            className="rounded-full border border-line bg-surface px-3 py-1 font-mono text-[11px] text-secondary transition-colors duration-200 hover:border-river/40 hover:text-ink"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
