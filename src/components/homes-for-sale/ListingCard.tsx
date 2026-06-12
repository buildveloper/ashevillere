"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bed, Bath, Square, MapPin, Clock, TrendingDown, ArrowRight } from "lucide-react";
import { useCountUp } from "@/hooks/use-animations";
import type { Listing } from "@/lib/listings";
import { getPrimaryImage } from "@/lib/listings";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`;
  const thousands = Math.round(price / 1000);
  return `$${thousands.toLocaleString()}K`;
}

export function ListingCard({
  listing,
  index,
  onSelect,
}: {
  listing: Listing;
  index: number;
  onSelect: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const priceDisplay = useCountUp(listing.price, 1500, hovered);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="relative glass rounded-2xl overflow-hidden cursor-pointer h-full flex flex-col"
        whileHover={{ y: -6, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
        onClick={() => onSelect(listing.id)}
      >
        {/* Image area */}
        <div className="relative h-52 sm:h-56 overflow-hidden flex-shrink-0">
          <OptimizedImage
            src={getPrimaryImage(listing)}
            alt={listing.address}
            fill
            objectFit="cover"
            className="transition-all duration-700 group-hover:scale-105"
            overlay
          />
          {listing.images && listing.images.length > 1 && (
            <div className="absolute bottom-3 right-3 z-20 px-2 py-0.5 rounded-full bg-black/50 text-[10px] font-medium text-white">
              +{listing.images.length - 1} photos
            </div>
          )}

          {/* Top-left: property type badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full glass text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
            {listing.propertyType}
          </div>

          {/* Top-right: days on market + price change */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
            {listing.daysOnMarket <= 7 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-[10px] font-bold text-white flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                NEW
              </span>
            )}
            {listing.priceChange < 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/80 text-[10px] font-semibold text-white flex items-center gap-0.5">
                <TrendingDown className="w-2.5 h-2.5" strokeWidth={2} />
                -${Math.abs(listing.priceChange).toLocaleString()}
              </span>
            )}
          </div>

          {/* Bottom-left: neighborhood tag */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-medium text-white border border-white/10">
            <MapPin className="w-2.5 h-2.5 text-emerald-400" strokeWidth={2} />
            {listing.neighborhood}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          {/* Price - large animated */}
          <motion.div
            className="mb-1"
            animate={{ scale: hovered ? 1.02 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="font-display text-2xl sm:text-3xl font-bold text-emerald-500 dark:text-emerald-400">
              {formatPrice(hovered ? priceDisplay : listing.price)}
            </span>
          </motion.div>

          {/* Address */}
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-3 truncate">
            {listing.address}
          </p>

          {/* Key specs row */}
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-emerald-500/70" strokeWidth={1.5} />
              {listing.beds} bd
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-cyan-500/70" strokeWidth={1.5} />
              {listing.baths} ba
            </span>
            <span className="flex items-center gap-1">
              <Square className="w-3.5 h-3.5 text-emerald-500/70" strokeWidth={1.5} />
              {listing.sqft.toLocaleString()} ft²
            </span>
          </div>

          {/* Days on market */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-4">
            <Clock className="w-3 h-3" strokeWidth={1.5} />
            {listing.daysOnMarket} days on market
          </div>

          {/* CTA */}
          <div className="mt-auto">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 dark:text-emerald-400 group-hover:gap-2.5 transition-all">
              View Details
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Hover glow border */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            boxShadow: hovered
              ? "inset 0 0 0 1px rgba(16,185,129,0.25), 0 0 30px rgba(16,185,129,0.08)"
              : "inset 0 0 0 0px rgba(16,185,129,0)",
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Top border glow on hover */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-px rounded-full bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent group-hover:w-full transition-all duration-500" />
      </motion.div>
    </motion.div>
  );
}
