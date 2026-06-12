"use client";

import { motion } from "framer-motion";
import { MapPin, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useInView } from "@/hooks/use-animations";

const NEIGHBORHOODS = [
  {
    id: "biltmore-forest",
    name: "Biltmore Forest",
    description: "Prestigious estates nestled among century-old trees near the iconic Biltmore Estate.",
    price: "$1.2M",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: "montford",
    name: "Montford",
    description: "Historic district with beautifully preserved Victorian and Arts &amp; Crafts homes.",
    price: "$685K",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: "downtown",
    name: "Downtown",
    description: "Vibrant urban living with craft breweries, art galleries, and farm-to-table dining.",
    price: "$520K",
    image: "https://images.unsplash.com/photo-1600047509807-ba9ddec7ef9d?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: "river-arts",
    name: "River Arts District",
    description: "Converted warehouses and modern lofts along the French Broad River.",
    price: "$450K",
    image: "https://images.unsplash.com/photo-1595206137885-9ed3b46d87f8?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: "west-asheville",
    name: "West Asheville",
    description: "Eclectic bungalows and a thriving local scene along Haywood Road.",
    price: "$390K",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: "grove-park",
    name: "Grove Park",
    description: "Iconic views, historic charm, and the legendary Omni Grove Park Inn.",
    price: "$850K",
    image: "https://images.unsplash.com/photo-1506905925346-21b36d8f4a19?w=800&q=80&auto=format&fit=crop",
  },
];

function NeighborhoodCard({
  hood,
  index,
}: {
  hood: (typeof NEIGHBORHOODS)[number];
  index: number;
}) {
  const { ref, inView } = useInView(0.15);

  return (
    <motion.div
      ref={ref}
      className="group relative flex-shrink-0 w-[260px] xs:w-[280px] sm:w-[320px]"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/neighborhoods/${hood.id}`} className="block">
        <motion.div
          className="relative glass rounded-2xl overflow-hidden"
          whileHover={{ y: -6, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
        >
          {/* Image area */}
          <div className="relative h-40 xs:h-48 sm:h-56 overflow-hidden">
            <img
              src={hood.image}
              alt={hood.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep-slate-950/70 via-deep-slate-950/20 to-transparent" />

            {/* Price badge */}
            <motion.div
              className="absolute top-4 right-4 px-3 py-1.5 rounded-full glass text-xs font-semibold text-emerald-400"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 + index * 0.08, duration: 0.3 }}
            >
              {hood.price} median
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
              <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white">
                {hood.name}
              </h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
              {hood.description}
            </p>
            <span
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 group-hover:gap-2 transition-all"
            >
              View neighborhood
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          {/* Hover glow border */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(16,185,129,0.2)",
            }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}

export function FeaturedNeighborhoods() {
  const { ref, inView } = useInView(0.1);

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 text-xs font-medium text-emerald-400 mb-4">
            <Sparkles className="w-3 h-3" />
            WHERE TO LIVE
          </motion.span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Featured <span className="text-gradient">Neighborhoods</span>
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base">
            From historic districts to mountain retreats, find your perfect Asheville neighborhood.
          </p>
        </motion.div>

        {/* Horizontal scroll container */}
        <div ref={ref} className="max-w-7xl mx-auto">
          {/* Desktop grid */}
          <div className="hidden lg:grid grid-cols-3 gap-6">
            {NEIGHBORHOODS.map((hood, i) => (
              <NeighborhoodCard key={hood.id} hood={hood} index={i} />
            ))}
          </div>

          {/* Mobile/tablet horizontal scroll */}
          <div className="lg:hidden flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none px-1 -mx-1">
            {NEIGHBORHOODS.map((hood, i) => (
              <div key={hood.id} className="snap-start">
                <NeighborhoodCard hood={hood} index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
