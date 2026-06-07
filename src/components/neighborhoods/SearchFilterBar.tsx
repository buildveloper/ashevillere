"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { VIBE_FILTERS, type VibeFilter } from "@/lib/neighborhoods";
import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/use-animations";

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  selectedVibe,
  onVibeChange,
}: {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedVibe: VibeFilter;
  onVibeChange: (v: VibeFilter) => void;
}) {
  const { ref, inView } = useInView(0.1);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      ref={ref}
      className="max-w-5xl mx-auto space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Search input */}
      <div className="relative max-w-xl mx-auto">
        <motion.div
          className="relative glass rounded-2xl overflow-hidden group"
          whileHover={{ y: -1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search neighborhoods by name, vibe, or lifestyle..."
            className="w-full bg-transparent py-3.5 pl-11 pr-10 text-sm text-gray-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                onClick={() => onSearchChange("")}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Focus ring animation */}
        <div className="absolute -inset-0.5 rounded-2xl pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
          style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(34,211,238,0.3))",
            filter: "blur(8px)",
          }}
        />
      </div>

      {/* Vibe filter pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        {VIBE_FILTERS.map((vibe, i) => (
          <motion.button
            key={vibe}
            onClick={() => onVibeChange(vibe)}
            className={`relative px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
              selectedVibe === vibe
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5"
                : "text-slate-500 hover:text-slate-300 glass-hover border border-[var(--color-glass-border)]"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.04 }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
          >
            {vibe}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
