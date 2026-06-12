"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { useIsMobile } from '@/hooks/use-media-query';
import { useInView } from "@/hooks/use-animations";
import type { NeighborhoodDetail } from "@/lib/neighborhoods";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

export function NeighborhoodCard({
  neighborhood,
  index,
}: {
  neighborhood: NeighborhoodDetail;
  index: number;
}) {
  const { ref, inView } = useInView(0.1);
  const cardRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    return `$${(price / 1000).toFixed(0)}K`;
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/neighborhoods/${neighborhood.id}`} className="block h-full">
        <motion.div
          ref={cardRef}
          className="relative glass rounded-2xl overflow-hidden h-full group"
          whileHover={isMobile ? {} : { y: -5, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
        >
          {/* Image */}
          <div className="relative h-52 sm:h-56 overflow-hidden">
            <OptimizedImage
              src={neighborhood.image}
              alt={neighborhood.name}
              fill
              objectFit="cover"
              className="transition-all duration-700 group-hover:scale-105"
              overlay
            />

            {/* Price badge */}
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full glass text-xs font-semibold text-emerald-400">
              {formatPrice(neighborhood.stats.medianPrice)} median
            </div>

            {/* Vibe tags */}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
              {neighborhood.vibe.slice(0, 2).map((v) => (
                <span
                  key={v}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 backdrop-blur-md text-white border border-white/10"
                >
                  {v}
                </span>
              ))}
            </div>

            {/* Trend badge */}
            {neighborhood.marketTrend === "hot" && (
              <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-red-500/90 text-[10px] font-bold text-white flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                HOT
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" strokeWidth={1.5} />
              <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white truncate">
                {neighborhood.name}
              </h3>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
              {neighborhood.tagline}
            </p>

            {/* Quick stats */}
            <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" strokeWidth={1.5} />
                {neighborhood.stats.yoyAppreciation}% YoY
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" strokeWidth={1.5} />
                {neighborhood.stats.avgDaysOnMarket}d DOM
              </span>
            </div>

            {/* CTA */}
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 group-hover:gap-2.5 transition-all">
              Explore neighborhood
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Hover glow border */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ boxShadow: "inset 0 0 0 1px rgba(16,185,129,0.2)" }}
          />

          {/* Top border glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-px rounded-full bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent group-hover:w-full transition-all duration-500" />
        </motion.div>
      </Link>
    </motion.div>
  );
}
