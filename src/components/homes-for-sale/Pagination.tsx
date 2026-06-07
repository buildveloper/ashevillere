"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function Pagination({
  visibleCount,
  totalCount,
  onLoadMore,
}: {
  visibleCount: number;
  totalCount: number;
  onLoadMore: () => void;
}) {
  if (visibleCount >= totalCount) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-xs text-slate-500 py-6"
      >
        Showing all {totalCount} listings
      </motion.p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-2 py-4"
    >
      <span className="text-xs text-slate-500">
        Showing {visibleCount} of {totalCount} listings
      </span>
      <motion.button
        onClick={onLoadMore}
        className="group flex items-center gap-2 px-6 py-3 rounded-xl glass text-sm font-medium text-emerald-400 hover:text-white hover:bg-emerald-500/10 transition-all border border-emerald-500/20"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        Load More
        <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" strokeWidth={1.5} />
      </motion.button>
    </motion.div>
  );
}
