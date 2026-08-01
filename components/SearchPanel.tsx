"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";

/**
 * Address search — the entry point of the whole product.
 * On submit, signals Hero to stagger the result cards in.
 */
export default function SearchPanel({
  onSearch,
}: {
  onSearch: (address: string) => void;
}) {
  const [value, setValue] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const submit = () => {
    if (!value.trim()) return;
    setHasSearched(true);
    onSearch(value.trim());
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
          className="shrink-0 rounded-xl bg-pine px-5 py-2.5 text-sm font-medium text-card transition-colors duration-200 hover:bg-pine-2"
        >
          Look up
        </button>
      </form>
      <p className="mt-2 font-mono text-[11px] text-stone">
        {hasSearched
          ? `REQUESTED → ${value}`
          : "FREE PUBLIC DATA · FEMA · NC FLOODPLAIN · BUNCOMBE CO GIS"}
      </p>
    </div>
  );
}
