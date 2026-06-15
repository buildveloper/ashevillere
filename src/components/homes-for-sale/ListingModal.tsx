"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bed, Bath, Square, MapPin, Clock, TrendingDown, ArrowRight, Calendar, Home, Mail } from "lucide-react";
import Link from "next/link";
import type { Listing } from "@/lib/listings";
import { getPrimaryImage } from "@/lib/listings";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ContactSellerModal } from "@/components/homes-for-sale/ContactSellerModal";

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`;
  return `$${price.toLocaleString()}`;
}

export function ListingModal({
  listing,
  onClose,
}: {
  listing: Listing | null;
  onClose: () => void;
}) {
  const [showContact, setShowContact] = useState(false);

  return (
    <AnimatePresence>
      {listing && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-4 sm:inset-x-auto sm:inset-y-6 sm:left-1/2 sm:-translate-x-1/2 z-[210] glass-strong rounded-2xl sm:w-full sm:max-w-2xl overflow-hidden shadow-2xl border border-emerald-500/10 flex flex-col"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </motion.button>

            {/* Scrollable content */}
            <div className="overflow-y-auto scrollbar-none">
              {/* Image */}
              <div className="relative h-64 sm:h-80 overflow-hidden">
                <OptimizedImage
                  src={listing.image}
                  alt={listing.address}
                  fill
                  objectFit="cover"
                  overlay
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-full glass text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                    {listing.propertyType}
                  </span>
                  {listing.priceChange < 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-red-500/80 text-[11px] font-semibold text-white flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" strokeWidth={2} />
                      Reduced ${Math.abs(listing.priceChange).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Price overlaid */}
                <div className="absolute bottom-6 left-6">
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="font-display text-4xl sm:text-5xl font-bold text-white"
                  >
                    {formatPrice(listing.price)}
                  </motion.p>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-5">
                {/* Header */}
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {listing.address}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass text-xs font-medium text-emerald-400">
                    <MapPin className="w-3 h-3" strokeWidth={1.5} />
                    {listing.neighborhood}
                  </span>
                </div>

                {/* Key stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: Bed, label: "Beds", value: listing.beds, accent: "emerald" },
                    { icon: Bath, label: "Baths", value: listing.baths, accent: "cyan" },
                    { icon: Square, label: "Sq Ft", value: listing.sqft.toLocaleString(), accent: "emerald" },
                    { icon: Calendar, label: "Built", value: listing.yearBuilt, accent: "cyan" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="glass rounded-xl p-3 text-center"
                    >
                      <stat.icon
                        className={`w-4 h-4 mx-auto mb-1 ${
                          stat.accent === "emerald" ? "text-emerald-400" : "text-cyan-400"
                        }`}
                        strokeWidth={1.5}
                      />
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{stat.label}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">About</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {listing.description}
                  </p>
                </div>

                {/* Features */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {listing.features.map((f) => (
                      <span
                        key={f}
                        className="px-3 py-1.5 rounded-full glass text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-[var(--color-glass-border)]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Market info */}
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {listing.daysOnMarket} days on market
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <motion.button
                    onClick={() => setShowContact(true)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Mail className="w-4 h-4" strokeWidth={1.5} />
                    Contact Seller
                  </motion.button>
                  <Link
                    href={`/neighborhoods/${listing.neighborhoodId}`}
                    className="flex-1 py-3 rounded-xl glass text-sm font-medium text-gray-900 dark:text-white text-center flex items-center justify-center gap-2 group"
                  >
                    Explore {listing.neighborhood}
                    <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
      <ContactSellerModal isOpen={showContact} listing={listing} onClose={() => setShowContact(false)} />
    </AnimatePresence>
  );
}
