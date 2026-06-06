"use client";

import { motion } from "framer-motion";
import { TrendingUp, Clock, Home, DollarSign } from "lucide-react";
import { useInView, useCountUp } from "@/hooks/use-animations";

const STATS = [
  {
    label: "Median Price",
    value: 525000,
    prefix: "$",
    suffix: "",
    icon: DollarSign,
    change: "+8.2%",
    positive: true,
  },
  {
    label: "Days on Market",
    value: 28,
    prefix: "",
    suffix: "",
    icon: Clock,
    change: "-12%",
    positive: true,
  },
  {
    label: "Active Listings",
    value: 1247,
    prefix: "",
    suffix: "",
    icon: Home,
    change: "+3.1%",
    positive: true,
  },
  {
    label: "Avg Price/SqFt",
    value: 312,
    prefix: "$",
    suffix: "",
    icon: TrendingUp,
    change: "+5.4%",
    positive: true,
  },
];

function formatValue(value: number, prefix: string, suffix: string): string {
  let formatted = value.toLocaleString();
  return `${prefix}${formatted}${suffix}`;
}

function StatCard({
  stat,
  index,
}: {
  stat: (typeof STATS)[number];
  index: number;
}) {
  const { ref, inView } = useInView(0.2);
  const count = useCountUp(stat.value, 2000, inView);
  const Icon = stat.icon;

  return (
    <motion.div
      ref={ref}
      className="relative glass rounded-2xl p-6 sm:p-8 overflow-hidden group"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
    >
      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(16,185,129,0.08), transparent 50%)",
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
            {stat.label}
          </span>
          <Icon className="w-5 h-5 text-emerald-500/60" strokeWidth={1.5} />
        </div>

        <div className="flex items-baseline gap-1 mb-2">
          {stat.prefix && (
            <span className="text-2xl font-light text-slate-400">
              {stat.prefix}
            </span>
          )}
          <span className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tabular-nums">
            {inView ? count.toLocaleString() : "0"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold ${
              stat.positive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {stat.change}
          </span>
          <span className="text-xs text-slate-500">YoY</span>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
    </motion.div>
  );
}

export function MarketStatsTeaser() {
  const { ref, inView } = useInView(0.1);

  return (
    <section ref={ref} className="relative py-20 sm:py-28 px-4 sm:px-6">
      {/* Section header */}
      <motion.div
        className="text-center mb-12 sm:mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 text-xs font-medium text-emerald-400 mb-4">
          <TrendingUp className="w-3 h-3" />
          LIVE MARKET DATA
        </motion.span>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Asheville Market <span className="text-gradient">at a Glance</span>
        </h2>
        <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base">
          Real-time market statistics powered by MLS data. Updated weekly to keep
          you informed.
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>
    </section>
  );
}
