"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  MapPin,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useInView } from "@/hooks/use-animations";
import {
  NEIGHBORHOODS,
  VIBE_FILTERS,
  type VibeFilter,
  searchNeighborhoods,
  getNeighborhoodsByVibe,
} from "@/lib/neighborhoods";
import { NeighborhoodCard } from "@/components/neighborhoods/NeighborhoodCard";
import { SearchFilterBar } from "@/components/neighborhoods/SearchFilterBar";
import { NeighborhoodCompareModal } from "@/components/neighborhoods/NeighborhoodCompareModal";
import { AIChatbot } from "@/components/home/AIChatbot";

export default function NeighborhoodsPage() {
  const { ref: heroRef, inView: heroInView } = useInView(0.1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVibe, setSelectedVibe] = useState<VibeFilter>("All");
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const filteredNeighborhoods = useMemo(() => {
    if (searchQuery.trim()) {
      return searchNeighborhoods(searchQuery);
    }
    return getNeighborhoodsByVibe(selectedVibe);
  }, [searchQuery, selectedVibe]);

  const toggleCompare = (id: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative pt-24 pb-8 sm:pt-32 sm:pb-12 px-4 sm:px-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-emerald-500/3 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-400/3 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <motion.nav
            className="flex items-center gap-2 text-xs sm:text-sm mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/" className="text-slate-500 hover:text-emerald-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" strokeWidth={1.5} />
            <span className="text-emerald-400 font-medium">Neighborhoods</span>
          </motion.nav>

          {/* Hero content */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 text-xs font-medium text-emerald-400 mb-5"
              initial={{ opacity: 0, y: 10 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Sparkles className="w-3 h-3" />
              ASHEVILLE NEIGHBORHOOD GUIDES
            </motion.span>

            <motion.h1
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              Find Your <span className="text-gradient">Perfect</span>
              <br />
              Asheville Neighborhood
            </motion.h1>

            <motion.p
              className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              From historic districts to emerging creative hubs — explore every corner of Asheville
              with detailed guides, market stats, and lifestyle breakdowns.
            </motion.p>

            {/* Compare button */}
            {selectedForCompare.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-400/10 border border-emerald-500/20 text-sm font-medium text-emerald-400"
                onClick={() => setCompareOpen(true)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Compare {selectedForCompare.length} selected
              </motion.button>
            )}
          </div>

          {/* Search & Filter */}
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedVibe={selectedVibe}
            onVibeChange={setSelectedVibe}
          />
        </div>
      </section>

      {/* NEIGHBORHOOD GRID */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {filteredNeighborhoods.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" strokeWidth={1} />
              <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No neighborhoods found
              </h3>
              <p className="text-sm text-slate-500">
                Try adjusting your search or filter.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredNeighborhoods.map((neighborhood, i) => (
                <div key={neighborhood.id} className="relative">
                  <NeighborhoodCard neighborhood={neighborhood} index={i} />

                  {/* Compare checkbox */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleCompare(neighborhood.id);
                    }}
                    className={`absolute top-4 left-4 z-10 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                      selectedForCompare.includes(neighborhood.id)
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-white/30 bg-black/20 text-transparent hover:border-white/60"
                    }`}
                  >
                    {selectedForCompare.includes(neighborhood.id) && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6L5 9L10 3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            className="text-sm text-slate-500 mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Need help deciding?
          </motion.p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/market-reports"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-hover text-sm font-medium text-gray-900 dark:text-white border border-[var(--color-glass-border)]"
            >
              View Market Reports
            </Link>
            <Link
              href="/tools/home-value"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-hover text-sm font-medium text-gray-900 dark:text-white border border-[var(--color-glass-border)]"
            >
              Home Value Estimator
            </Link>
          </div>
        </div>
      </section>

      {/* COMPARE MODAL */}
      <NeighborhoodCompareModal
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        selectedIds={selectedForCompare}
        onRemove={toggleCompare}
      />
    </>
  );
}
