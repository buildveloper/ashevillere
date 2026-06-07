"use client";

import { motion } from "framer-motion";
import { Scale, Lightbulb, CalendarClock, CloudRain } from "lucide-react";
import { useInView } from "@/hooks/use-animations";

const INSIGHTS = [
  {
    id: "buyer-seller",
    title: "Buyer vs Seller Market",
    summary:
      "Asheville remains a strong seller's market with 2.8 months of inventory — well below the 6-month balanced threshold. Buyers should expect competition on well-priced homes.",
    icon: Scale,
    color: "emerald" as const,
    highlights: ["Seller advantage", "2.8 mo inventory", "Multiple offers common"],
  },
  {
    id: "key-factors",
    title: "Key Market Influences",
    summary:
      "Post-Helene rebuilding, remote worker migration, and limited new construction continue to tighten supply. Interest rate stabilization is bringing buyers back.",
    icon: Lightbulb,
    color: "cyan" as const,
    highlights: ["Rebuilding demand", "Remote migration", "Rate stabilization"],
  },
  {
    id: "quarterly",
    title: "Q2 2026 Outlook",
    summary:
      "Median prices are projected to rise 4-6% through summer. Inventory is expected to grow modestly as rebuilding completes. Strong seasonal demand ahead.",
    icon: CalendarClock,
    color: "emerald" as const,
    highlights: ["4-6% price growth", "Seasonal demand surge", "Inventory uptick"],
  },
  {
    id: "helene-impact",
    title: "Post-Helene Impact",
    summary:
      "Recovery efforts have reshaped the market. Renovated homes command 12% premiums. Some neighborhoods are seeing accelerated appreciation from infrastructure improvements.",
    icon: CloudRain,
    color: "cyan" as const,
    highlights: ["12% renovation premium", "Infrastructure upgrades", "Neighborhood shifts"],
  },
];

function InsightCard({
  insight,
  index,
}: {
  insight: (typeof INSIGHTS)[number];
  index: number;
}) {
  const { ref, inView } = useInView(0.1);
  const Icon = insight.icon;

  return (
    <motion.div
      ref={ref}
      className="relative glass rounded-2xl p-5 sm:p-7 overflow-hidden group"
      initial={{ opacity: 0, y: 25 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -4, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(350px circle at 50% 50%, ${
            insight.color === "emerald"
              ? "rgba(16,185,129,0.06)"
              : "rgba(34,211,238,0.06)"
          }, transparent 60%)`,
        }}
      />

      {/* Top border glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-0 h-px rounded-full bg-gradient-to-r from-transparent ${
        insight.color === "emerald" ? "via-emerald-500/30" : "via-cyan-400/30"
      } to-transparent group-hover:w-full transition-all duration-500`} />

      <div className="relative z-10">
        {/* Icon + Title */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              insight.color === "emerald"
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-cyan-400/10 text-cyan-400"
            }`}
          >
            <Icon className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-lg sm:text-xl font-semibold text-gray-900 dark:text-white leading-tight pt-1">
            {insight.title}
          </h3>
        </div>

        {/* Summary */}
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
          {insight.summary}
        </p>

        {/* Highlight tags */}
        <div className="flex flex-wrap gap-2">
          {insight.highlights.map((h) => (
            <span
              key={h}
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                insight.color === "emerald"
                  ? "bg-emerald-500/5 text-emerald-400 border border-emerald-500/10"
                  : "bg-cyan-400/5 text-cyan-400 border border-cyan-400/10"
              }`}
            >
              {h}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function MarketInsights() {
  const { ref, inView } = useInView(0.05);

  return (
    <section ref={ref} className="relative py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 text-xs font-medium text-emerald-400 mb-4">
            <Lightbulb className="w-3 h-3" />
            EXPERT ANALYSIS
          </motion.span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Market <span className="text-gradient">Insights</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-sm sm:text-base">
            Expert analysis of Asheville&apos;s real estate landscape — what&apos;s driving the market right now.
          </p>
        </motion.div>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {INSIGHTS.map((insight, i) => (
            <InsightCard key={insight.id} insight={insight} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
