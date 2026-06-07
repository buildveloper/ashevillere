"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronDown, SlidersHorizontal, MapPin } from "lucide-react";
import { NEIGHBORHOODS, type NeighborhoodDetail } from "@/lib/neighborhoods";

export interface ListingFilters {
  search: string;
  neighborhoods: string[];
  priceMin: number;
  priceMax: number;
  beds: number;
  baths: number;
  propertyType: string;
  minSqft: number;
}

export const DEFAULT_FILTERS: ListingFilters = {
  search: "",
  neighborhoods: [],
  priceMin: 0,
  priceMax: 2_000_000,
  beds: 0,
  baths: 0,
  propertyType: "",
  minSqft: 0,
};

const PROPERTY_TYPES = ["Single Family", "Condo", "Townhouse", "Multi-Family", "Land"];
const BED_OPTIONS = [0, 1, 2, 3, 4];
const BATH_OPTIONS = [0, 1, 2, 3];

function formatPriceLabel(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  return `$${(val / 1000).toFixed(0)}K`;
}

export function FilterBar({
  filters,
  onFilterChange,
  totalCount,
}: {
  filters: ListingFilters;
  onFilterChange: (f: ListingFilters) => void;
  totalCount: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [neighborDropdown, setNeighborDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNeighborDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const set = (key: keyof ListingFilters, value: unknown) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleNeighborhood = (id: string) => {
    const next = filters.neighborhoods.includes(id)
      ? filters.neighborhoods.filter((n) => n !== id)
      : [...filters.neighborhoods, id];
    set("neighborhoods", next);
  };

  const activeFilterCount = [
    filters.neighborhoods.length > 0,
    filters.priceMin > 0,
    filters.priceMax < 2_000_000,
    filters.beds > 0,
    filters.baths > 0,
    filters.propertyType !== "",
    filters.minSqft > 0,
  ].filter(Boolean).length;

  const selectedNeighborhoods = NEIGHBORHOODS.filter((n) =>
    filters.neighborhoods.includes(n.id)
  );

  const filterContent = (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
        </div>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          placeholder="Search by address, description, or features..."
          className="w-full bg-transparent py-3 pl-11 pr-10 text-sm text-gray-900 dark:text-white placeholder:text-slate-400 focus:outline-none glass rounded-2xl"
        />
        {filters.search && (
          <button
            onClick={() => set("search", "")}
            className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Quick filter row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Neighborhood multi-select */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setNeighborDropdown(!neighborDropdown)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              filters.neighborhoods.length > 0
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "glass text-slate-500 hover:text-slate-300"
            }`}
          >
            <MapPin className="w-3 h-3" strokeWidth={1.5} />
            {filters.neighborhoods.length > 0
              ? `${filters.neighborhoods.length} selected`
              : "Neighborhood"}
            <ChevronDown className={`w-3 h-3 transition-transform ${neighborDropdown ? "rotate-180" : ""}`} strokeWidth={1.5} />
          </button>

          <AnimatePresence>
            {neighborDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-2 left-0 z-50 w-64 glass-strong rounded-2xl p-3 shadow-xl border border-[var(--color-glass-border)]"
              >
                <div className="space-y-1 max-h-56 overflow-y-auto scrollbar-none">
                  {NEIGHBORHOODS.map((n) => {
                    const checked = filters.neighborhoods.includes(n.id);
                    return (
                      <button
                        key={n.id}
                        onClick={() => toggleNeighborhood(n.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                          checked
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                        }`}
                      >
                        <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                          checked ? "bg-emerald-500 border-emerald-500" : "border-slate-600"
                        }`}>
                          {checked && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-3 h-3 text-white"
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </motion.svg>
                          )}
                        </span>
                        <span className="flex-1">{n.name}</span>
                        <span className="text-[10px] text-slate-500">{n.priceLabel}</span>
                      </button>
                    );
                  })}
                </div>
                {filters.neighborhoods.length > 0 && (
                  <button
                    onClick={() => set("neighborhoods", [])}
                    className="mt-2 w-full text-center text-[11px] text-slate-500 hover:text-emerald-400 transition-colors py-1"
                  >
                    Clear all
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Beds quick filter */}
        {BED_OPTIONS.map((b) => (
          <button
            key={`bed-${b}`}
            onClick={() => set("beds", b)}
            className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
              filters.beds === b
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "glass text-slate-500 hover:text-slate-300"
            }`}
          >
            {b === 0 ? "Beds" : `${b}+ bd`}
          </button>
        ))}

        {/* Baths quick filter */}
        {BATH_OPTIONS.map((b) => (
          <button
            key={`bath-${b}`}
            onClick={() => set("baths", b)}
            className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
              filters.baths === b
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                : "glass text-slate-500 hover:text-slate-300"
            }`}
          >
            {b === 0 ? "Baths" : `${b}+ ba`}
          </button>
        ))}

        {/* More filters toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all ${
            expanded || activeFilterCount > 2
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "glass text-slate-500 hover:text-slate-300"
          }`}
        >
          <SlidersHorizontal className="w-3 h-3" strokeWidth={1.5} />
          More Filters
          {activeFilterCount > 2 && (
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount - 2}
            </span>
          )}
        </button>
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-5 border-t border-[var(--color-glass-border)]">
              {/* Price range */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
                  Price Range: {formatPriceLabel(filters.priceMin)} – {formatPriceLabel(filters.priceMax)}
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="range"
                      min={0}
                      max={2_000_000}
                      step={25000}
                      value={filters.priceMin}
                      onChange={(e) => set("priceMin", Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="range"
                      min={0}
                      max={2_000_000}
                      step={25000}
                      value={filters.priceMax}
                      onChange={(e) => set("priceMax", Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>$0</span>
                  <span>$2M+</span>
                </div>
              </div>

              {/* Property type pills */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
                  Property Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => set("propertyType", filters.propertyType === t ? "" : t)}
                      className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                        filters.propertyType === t
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "glass text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min sqft */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
                  Min Square Feet: {filters.minSqft > 0 ? `${filters.minSqft.toLocaleString()} ft²` : "Any"}
                </label>
                <input
                  type="range"
                  min={0}
                  max={5000}
                  step={250}
                  value={filters.minSqft}
                  onChange={(e) => set("minSqft", Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filter chips */}
      <AnimatePresence>
        {(selectedNeighborhoods.length > 0 || filters.propertyType || filters.beds > 0 || filters.baths > 0 || filters.minSqft > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-wrap items-center gap-2"
          >
            {selectedNeighborhoods.map((n) => (
              <motion.span
                key={n.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-medium border border-emerald-500/20"
              >
                <MapPin className="w-3 h-3" strokeWidth={1.5} />
                {n.name}
                <button onClick={() => toggleNeighborhood(n.id)}>
                  <X className="w-3 h-3 hover:text-white transition-colors" strokeWidth={1.5} />
                </button>
              </motion.span>
            ))}
            {filters.propertyType && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
                {filters.propertyType}
                <button onClick={() => set("propertyType", "")}>
                  <X className="w-3 h-3 hover:text-white transition-colors" strokeWidth={1.5} />
                </button>
              </span>
            )}
            {(filters.beds > 0 || filters.baths > 0 || filters.minSqft > 0) && (
              <button
                onClick={() => onFilterChange({ ...DEFAULT_FILTERS, search: filters.search })}
                className="text-[11px] text-slate-500 hover:text-emerald-400 transition-colors underline"
              >
                Reset filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Desktop filter bar */}
      <div className="hidden lg:block">{filterContent}</div>

      {/* Mobile filter trigger + sheet */}
      <div className="lg:hidden">
        <div className="flex items-center gap-3">
          {/* Mobile search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => set("search", e.target.value)}
              placeholder="Search listings..."
              className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-slate-400 focus:outline-none glass rounded-xl"
            />
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile filter sheet */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-50 glass-strong rounded-t-2xl max-h-[85vh] overflow-y-auto p-5"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Filters ({totalCount} listings)
                  </span>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="w-8 h-8 rounded-full glass-hover flex items-center justify-center text-slate-400"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
                {filterContent}
                <button
                  onClick={() => setMobileOpen(false)}
                  className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold"
                >
                  Show {totalCount} Listings
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
