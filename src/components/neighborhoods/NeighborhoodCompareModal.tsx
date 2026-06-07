"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, TrendingUp, DollarSign, Clock, Home, ArrowRight } from "lucide-react";
import { getNeighborhood, type NeighborhoodDetail } from "@/lib/neighborhoods";

function CompareRow({
  label,
  neighborhoods,
  render,
}: {
  label: string;
  neighborhoods: NeighborhoodDetail[];
  render: (n: NeighborhoodDetail) => React.ReactNode;
}) {
  return (
    <tr className="border-b border-[var(--color-glass-border)]">
      <td className="py-3 pr-6 text-xs font-medium text-slate-500 whitespace-nowrap">{label}</td>
      {neighborhoods.map((n) => (
        <td key={n.id} className="py-3 px-4 text-sm text-gray-900 dark:text-white text-center">
          {render(n)}
        </td>
      ))}
    </tr>
  );
}

function formatPrice(price: number) {
  if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
  return `$${(price / 1000).toFixed(0)}K`;
}

const getTrendColor = (trend: string) => {
  switch (trend) {
    case "hot": return "text-red-400";
    case "up": return "text-emerald-400";
    default: return "text-slate-400";
  }
};

export function NeighborhoodCompareModal({
  isOpen,
  onClose,
  selectedIds,
  onRemove,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onRemove: (id: string) => void;
}) {
  const neighborhoods = selectedIds.map((id) => getNeighborhood(id)).filter(Boolean) as NeighborhoodDetail[];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative glass-strong rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[var(--color-glass-border)]">
                <div>
                  <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
                    Neighborhood Comparison
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Side-by-side data for {neighborhoods.length} neighborhoods
                  </p>
                </div>
                <motion.button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center glass-hover text-slate-400"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </motion.button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-5 sm:p-6">
                {neighborhoods.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" strokeWidth={1} />
                    <p className="text-sm text-slate-500">Select neighborhoods to compare them.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="border-b border-[var(--color-glass-border)]">
                          <th className="py-3 pr-6" />
                          {neighborhoods.map((n) => (
                            <th key={n.id} className="py-3 px-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-display text-base font-semibold text-gray-900 dark:text-white">
                                  {n.name}
                                </span>
                                <span className={`text-[10px] font-medium uppercase ${getTrendColor(n.marketTrend)}`}>
                                  {n.marketTrend}
                                </span>
                                <button
                                  onClick={() => onRemove(n.id)}
                                  className="text-[10px] text-slate-500 hover:text-red-400 transition-colors mt-0.5"
                                >
                                  Remove
                                </button>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <CompareRow label="Median Price" neighborhoods={neighborhoods} render={(n) => <span className="font-semibold tabular-nums">{formatPrice(n.stats.medianPrice)}</span>} />
                        <CompareRow label="Price/SqFt" neighborhoods={neighborhoods} render={(n) => <span className="tabular-nums">${n.stats.pricePerSqft}</span>} />
                        <CompareRow label="Days on Market" neighborhoods={neighborhoods} render={(n) => <span className="tabular-nums">{n.stats.avgDaysOnMarket}d</span>} />
                        <CompareRow label="Active Listings" neighborhoods={neighborhoods} render={(n) => <span className="tabular-nums">{n.stats.activeListings}</span>} />
                        <CompareRow label="Mo. Inventory" neighborhoods={neighborhoods} render={(n) => <span className="tabular-nums">{n.stats.monthsInventory}</span>} />
                        <CompareRow label="YoY Appreciation" neighborhoods={neighborhoods} render={(n) => <span className="tabular-nums">{n.stats.yoyAppreciation}%</span>} />
                        <CompareRow label="Walk Score" neighborhoods={neighborhoods} render={(n) => <span className="tabular-nums">{n.walkScore}</span>} />
                        <CompareRow label="Schools Rating" neighborhoods={neighborhoods} render={(n) => <span className="tabular-nums">{n.schools.rating}/10</span>} />
                        <CompareRow label="Market Trend" neighborhoods={neighborhoods} render={(n) => <span className={`text-xs font-semibold uppercase ${getTrendColor(n.marketTrend)}`}>{n.marketTrend}</span>} />
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[var(--color-glass-border)] text-center">
                <p className="text-xs text-slate-500">
                  Data updated quarterly from MLS and public records.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
