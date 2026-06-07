"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { DollarSign, Clock, Home, TrendingUp, BarChart3, Thermometer } from "lucide-react";
import { useInView, useCountUp } from "@/hooks/use-animations";

const STATS = [
  {
    label: "Median Home Price",
    value: 525000,
    prefix: "$",
    suffix: "",
    icon: DollarSign,
    change: "+8.2%",
    positive: true,
    color: "emerald",
    linkTo: "/tools/home-value",
  },
  {
    label: "Avg Days on Market",
    value: 28,
    prefix: "",
    suffix: " days",
    icon: Clock,
    change: "-12%",
    positive: true,
    color: "cyan",
  },
  {
    label: "Active Listings",
    value: 1247,
    prefix: "",
    suffix: "",
    icon: Home,
    change: "+3.1%",
    positive: true,
    color: "emerald",
    linkTo: "/neighborhoods",
  },
  {
    label: "Homes Sold",
    value: 342,
    prefix: "",
    suffix: "",
    icon: TrendingUp,
    change: "+6.7%",
    positive: true,
    color: "cyan",
  },
  {
    label: "Months of Inventory",
    value: 2.8,
    prefix: "",
    suffix: " mo",
    icon: BarChart3,
    change: "-0.3",
    positive: true,
    color: "emerald",
  },
  {
    label: "Market Heat Index",
    value: 78,
    prefix: "",
    suffix: "%",
    icon: Thermometer,
    change: "Hot",
    positive: true,
    color: "cyan",
  },
];

function StatCard({
  stat,
  index,
}: {
  stat: (typeof STATS)[number];
  index: number;
}) {
  const { ref, inView } = useInView(0.15);
  const count = useCountUp(
    stat.value,
    2000,
    inView
  );
  const Icon = stat.icon;
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <motion.div
        ref={cardRef}
        className="relative glass rounded-2xl p-5 sm:p-6 overflow-hidden group cursor-default"
        whileHover={{ y: -4, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
        onMouseMove={handleMouseMove}
      >
        {/* Radial hover glow */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(320px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(16,185,129,0.1), transparent 50%)`,
          }}
        />

        {/* Top border glow on hover */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-px rounded-full bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent group-hover:w-full transition-all duration-500" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {stat.label}
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                stat.color === "emerald"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-cyan-400/10 text-cyan-400"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>

          <div className="flex items-baseline gap-1 mb-2">
            {stat.prefix && (
              <span className="text-xl font-light text-slate-400 dark:text-slate-500">
                {stat.prefix}
              </span>
            )}
            <span className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tabular-nums">
              {inView
                ? typeof stat.value === "number" && stat.value % 1 !== 0
                  ? count.toFixed(1)
                  : count.toLocaleString()
                : "0"}
            </span>
            {stat.suffix && (
              <span className="text-sm font-medium text-slate-400 dark:text-slate-500 ml-1">
                {stat.suffix}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold ${
                stat.positive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {stat.change}
            </span>
            <span className="text-xs text-slate-500">
              {typeof stat.change === "string" && stat.change.startsWith("-") ? "MoM" : "YoY"}
            </span>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      </motion.div>
    </motion.div>
  );
}

export function StatsDashboard() {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 text-xs font-medium text-emerald-400 mb-4">
            <BarChart3 className="w-3 h-3" />
            LIVE MARKET DATA
          </motion.span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Market <span className="text-gradient">Dashboard</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-sm sm:text-base">
            Real-time Asheville market statistics. Updated weekly from MLS data.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
