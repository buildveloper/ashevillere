"use client";

import { motion } from "framer-motion";
import type { BlogCategory } from "@/lib/blog";
import { CATEGORIES, ALL_CATEGORIES } from "@/lib/blog";

export function BlogFilters({
  active,
  onChange,
}: {
  active: BlogCategory | "all";
  onChange: (category: BlogCategory | "all") => void;
}) {
  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pb-2">
      {/* Horizontal scroll on mobile, wrap on desktop */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-center flex-wrap">
        {/* "All" pill */}
        <motion.button
          onClick={() => onChange("all")}
          className={`relative px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-colors whitespace-nowrap ${
            active === "all"
              ? "text-white"
              : "text-slate-500 hover:text-slate-300"
          }`}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          {active === "all" && (
            <motion.div
              layoutId="blog-filter"
              className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">All Articles</span>
        </motion.button>

        {/* Category pills */}
        {ALL_CATEGORIES.map((cat) => {
          const cfg = CATEGORIES[cat];
          return (
            <motion.button
              key={cat}
              onClick={() => onChange(cat)}
              className={`relative px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-colors whitespace-nowrap ${
                active === cat
                  ? "text-white"
                  : `text-slate-500 hover:text-slate-300 ${cfg.color}/80`
              }`}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              {active === cat && (
                <motion.div
                  layoutId="blog-filter"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cfg.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
