"use client";

import { motion } from "framer-motion";
import { Map, MapPin } from "lucide-react";
import type { Listing } from "@/lib/listings";

export function MapViewPlaceholder({
  listings,
}: {
  listings: Listing[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="glass-strong rounded-2xl border border-[var(--color-glass-border)] min-h-[500px] flex flex-col items-center justify-center p-8 text-center"
    >
      <motion.div
        className="relative mb-6"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Map className="w-20 h-20 text-emerald-500/20" strokeWidth={1} />
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-emerald-500/40" strokeWidth={1.5} />
        </div>
      </motion.div>

      <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2">
        Interactive Map
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">
        A full Leaflet map with {listings.length} property pins is coming soon.
        Switch back to grid view to browse listings.
      </p>

      {/* Decorative pin count */}
      <div className="flex flex-wrap gap-2 justify-center">
        {listings.slice(0, 6).map((l, i) => (
          <motion.span
            key={l.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full glass text-[11px] font-medium text-slate-500"
          >
            <MapPin className="w-3 h-3 text-emerald-400" strokeWidth={1.5} />
            {l.neighborhood}
          </motion.span>
        ))}
        {listings.length > 6 && (
          <span className="px-2.5 py-1 rounded-full glass text-[11px] font-medium text-emerald-400">
            +{listings.length - 6} more
          </span>
        )}
      </div>
    </motion.div>
  );
}
