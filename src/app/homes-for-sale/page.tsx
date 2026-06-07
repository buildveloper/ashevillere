"use client";

import { useState, useCallback, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, MapPin, ArrowRight, LayoutGrid, Map, ChevronRight, Gem } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useInView } from "@/hooks/use-animations";
import { LISTINGS, type Listing } from "@/lib/listings";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";
import { ListingCard } from "@/components/homes-for-sale/ListingCard";
import {
  FilterBar,
  DEFAULT_FILTERS,
  type ListingFilters,
} from "@/components/homes-for-sale/FilterBar";
import {
  SortControls,
  type SortOption,
} from "@/components/homes-for-sale/SortControls";
import { Pagination } from "@/components/homes-for-sale/Pagination";
import { ListingModal } from "@/components/homes-for-sale/ListingModal";
import { MapViewPlaceholder } from "@/components/homes-for-sale/MapViewPlaceholder";

const PAGE_SIZE = 9;
const LOAD_MORE_SIZE = 6;

function filterAndSortListings(
  listings: Listing[],
  filters: ListingFilters,
  sort: SortOption
): Listing[] {
  let result = listings.filter((l) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        l.address.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.features.some((f) => f.toLowerCase().includes(q)) ||
        l.neighborhood.toLowerCase().includes(q) ||
        l.propertyType.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (filters.neighborhoods.length > 0 && !filters.neighborhoods.includes(l.neighborhoodId)) return false;
    if (filters.priceMin > 0 && l.price < filters.priceMin) return false;
    if (filters.priceMax < 2_000_000 && l.price > filters.priceMax) return false;
    if (filters.beds > 0 && l.beds < filters.beds) return false;
    if (filters.baths > 0 && l.baths < filters.baths) return false;
    if (filters.propertyType && l.propertyType !== filters.propertyType) return false;
    if (filters.minSqft > 0 && l.sqft < filters.minSqft) return false;
    return true;
  });

  switch (sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      result.sort((a, b) => a.daysOnMarket - b.daysOnMarket);
      break;
    case "sqft-desc":
      result.sort((a, b) => b.sqft - a.sqft);
      break;
  }

  return result;
}

function parseSearchParams(sp: URLSearchParams): { filters: ListingFilters; sort: SortOption; view: "grid" | "map" } {
  const filters: ListingFilters = { ...DEFAULT_FILTERS };
  const search = sp.get("search");
  if (search) filters.search = search;
  const neighborhoods = sp.get("neighborhood");
  if (neighborhoods) filters.neighborhoods = neighborhoods.split(",");
  const minPrice = sp.get("minPrice");
  if (minPrice) filters.priceMin = Number(minPrice);
  const maxPrice = sp.get("maxPrice");
  if (maxPrice) filters.priceMax = Number(maxPrice);
  const beds = sp.get("beds");
  if (beds) filters.beds = Number(beds);
  const baths = sp.get("baths");
  if (baths) filters.baths = Number(baths);
  const propertyType = sp.get("propertyType");
  if (propertyType) filters.propertyType = propertyType;
  const minSqft = sp.get("minSqft");
  if (minSqft) filters.minSqft = Number(minSqft);

  const sortParam = sp.get("sort") as SortOption | null;
  const sort: SortOption = sortParam && ["newest", "price-asc", "price-desc", "sqft-desc"].includes(sortParam)
    ? sortParam
    : "newest";

  const viewParam = sp.get("view");
  const view = viewParam === "map" ? "map" : "grid";

  return { filters, sort, view };
}

function HomesForSaleInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { filters: initFilters, sort: initSort, view: initView } = useMemo(
    () => parseSearchParams(searchParams),
    [searchParams]
  );

  const [filters, setFilters] = useState<ListingFilters>(initFilters);
  const [sort, setSort] = useState<SortOption>(initSort);
  const [view, setView] = useState<"grid" | "map">(initView);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const { ref: heroRef, inView: heroInView } = useInView(0.1);

  const filtered = useMemo(
    () => filterAndSortListings(LISTINGS, filters, sort),
    [filters, sort]
  );

  const visibleListings = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );

  const handleLoadMore = useCallback(() => {
    setVisibleCount((p) => Math.min(p + LOAD_MORE_SIZE, filtered.length));
  }, [filtered.length]);

  const handleFilterChange = useCallback(
    (f: ListingFilters) => {
      setFilters(f);
      setVisibleCount(PAGE_SIZE);
    },
    []
  );

  const handleSortChange = useCallback(
    (s: SortOption) => {
      setSort(s);
      setVisibleCount(PAGE_SIZE);
    },
    []
  );

  const handleSelectListing = useCallback((id: string) => {
    const l = LISTINGS.find((x) => x.id === id);
    if (l) setSelectedListing(l);
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="relative pt-24 pb-8 sm:pt-32 sm:pb-12 px-4 sm:px-6 overflow-hidden"
      >
        {/* Ambient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/3 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-cyan-400/3 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <motion.nav
            className="flex items-center gap-2 text-xs sm:text-sm mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/" className="text-slate-500 hover:text-emerald-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" strokeWidth={1.5} />
            <span className="text-emerald-400 font-medium">Homes for Sale</span>
          </motion.nav>

          {/* Hero content */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 text-xs font-medium text-emerald-400 mb-5"
              initial={{ opacity: 0, y: 10 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Gem className="w-3 h-3" />
              PREMIUM LISTINGS
            </motion.span>

            <motion.h1
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              Asheville{" "}
              <span className="text-gradient">Homes for Sale</span>
            </motion.h1>

            <motion.p
              className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              Browse {LISTINGS.length} listings across {NEIGHBORHOODS.length} neighborhoods.
              Find your perfect home in Asheville&apos;s most desirable communities.
            </motion.p>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="relative pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Sticky filter bar wrapper */}
          <div className="sticky top-[72px] z-40 pb-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                totalCount={filtered.length}
              />
            </motion.div>
          </div>

          {/* Sort + View toggle bar */}
          <motion.div
            className="flex items-center justify-between mb-6 gap-4"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <SortControls sort={sort} onSortChange={handleSortChange} totalCount={filtered.length} />

            {/* View toggle */}
            <div className="flex items-center gap-1 glass rounded-xl p-1">
              <button
                onClick={() => setView("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  view === "grid"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setView("map")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  view === "map"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Map className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </motion.div>

          {/* Content area */}
          <AnimatePresence mode="wait">
            {view === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {filtered.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20"
                  >
                    <Search className="w-12 h-12 mx-auto text-slate-500/30 mb-4" strokeWidth={1} />
                    <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No listings found
                    </h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                      Try adjusting your filters or search terms to discover more properties in Asheville.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                      <AnimatePresence mode="popLayout">
                        {visibleListings.map((listing, i) => (
                          <ListingCard
                            key={listing.id}
                            listing={listing}
                            index={i}
                            onSelect={handleSelectListing}
                          />
                        ))}
                      </AnimatePresence>
                    </div>

                    <Pagination
                      visibleCount={visibleListings.length}
                      totalCount={filtered.length}
                      onLoadMore={handleLoadMore}
                    />
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <MapViewPlaceholder listings={filtered} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* CROSS-LINKS FOOTER */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6 border-t border-[var(--color-glass-border)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            className="text-sm text-slate-500 mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            Ready to explore deeper?
          </motion.p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Link
                href="/neighborhoods"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-hover text-sm font-medium text-gray-900 dark:text-white border border-[var(--color-glass-border)] group"
              >
                <MapPin className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                Neighborhood Guides
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Link
                href="/market-reports"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-hover text-sm font-medium text-gray-900 dark:text-white border border-[var(--color-glass-border)] group"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" strokeWidth={1.5} />
                Market Reports
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-hover text-sm font-medium text-gray-900 dark:text-white border border-[var(--color-glass-border)] group"
              >
                <Search className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
                Home Value Estimator
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* LISTING DETAIL MODAL */}
      <ListingModal listing={selectedListing} onClose={() => setSelectedListing(null)} />
    </>
  );
}

// Wrap in Suspense since we use useSearchParams
export default function HomesForSalePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full glass-strong mx-auto flex items-center justify-center">
              <Gem className="w-6 h-6 text-emerald-400 animate-pulse" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-slate-500">Loading listings&hellip;</p>
          </div>
        </div>
      }
    >
      <HomesForSaleInner />
    </Suspense>
  );
}
