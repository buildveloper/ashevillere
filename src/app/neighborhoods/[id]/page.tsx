"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  MapPin,
  TrendingUp,
  Clock,
  DollarSign,
  Home,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Heart,
  ArrowLeft,
  ArrowRight,
  Footprints,
  Bus,
  Building2,
  Sparkles,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { useInView, useCountUp } from "@/hooks/use-animations";
import {
  NEIGHBORHOODS,
  getNeighborhood,
  type NeighborhoodDetail,
} from "@/lib/neighborhoods";

function formatPrice(price: number, showCents = false): string {
  if (price >= 1000000) {
    const val = price / 1000000;
    return showCents ? `$${val.toFixed(2)}M` : `$${val.toFixed(1)}M`;
  }
  return `$${(price / 1000).toFixed(0)}K`;
}

function StatBlock({
  label,
  value,
  suffix = "",
  prefix = "",
  icon: Icon,
  index,
}: {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  index: number;
}) {
  const { ref, inView } = useInView(0.15);
  const count = useCountUp(value, 1800, inView);

  return (
    <motion.div
      ref={ref}
      className="relative glass rounded-2xl p-5 sm:p-6 group"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
          {label}
        </span>
        <Icon className="w-4 h-4 text-emerald-500/60" strokeWidth={1.5} />
      </div>
      <div className="flex items-baseline gap-1">
        {prefix && (
          <span className="text-lg font-light text-slate-400">{prefix}</span>
        )}
        <span className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
          {inView ? count.toLocaleString() : "0"}
        </span>
        {suffix && (
          <span className="text-sm font-medium text-slate-400 ml-1">{suffix}</span>
        )}
      </div>
      <div className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent" />
    </motion.div>
  );
}

function ScoreBar({
  label,
  value,
  max = 10,
  color = "emerald",
}: {
  label: string;
  value: number;
  max?: number;
  color?: "emerald" | "cyan";
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-400 font-medium tabular-nums">
          {value}/{max}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            color === "emerald"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
              : "bg-gradient-to-r from-cyan-500 to-cyan-400"
          }`}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

export default function NeighborhoodDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const neighborhood = getNeighborhood(id);

  if (!neighborhood) {
    notFound();
  }

  const n = neighborhood;

  return (
    <>
      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="relative pt-24 pb-10 sm:pt-32 sm:pb-16 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-emerald-500/3 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-400/2 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <motion.nav
            className="flex items-center gap-2 text-xs sm:text-sm mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/" className="text-slate-500 hover:text-emerald-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" strokeWidth={1.5} />
            <Link href="/neighborhoods" className="text-slate-500 hover:text-emerald-400 transition-colors">
              Neighborhoods
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" strokeWidth={1.5} />
            <span className="text-emerald-400 font-medium">{n.name}</span>
          </motion.nav>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left content */}
            <div className="lg:col-span-3">
              <motion.span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 text-xs font-medium text-emerald-400 mb-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <MapPin className="w-3 h-3" />
                NEIGHBORHOOD GUIDE
              </motion.span>

              <motion.h1
                className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                {n.name}
              </motion.h1>

              <motion.p
                className="text-lg text-slate-500 dark:text-slate-400 italic mb-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {n.tagline}
              </motion.p>

              {/* Vibe + trend chips */}
              <motion.div
                className="flex flex-wrap items-center gap-2 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                {n.vibe.map((v) => (
                  <span
                    key={v}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                  >
                    {v}
                  </span>
                ))}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    n.marketTrend === "hot"
                      ? "bg-red-500/10 text-red-400 border border-red-500/10"
                      : n.marketTrend === "up"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                      : "bg-slate-500/10 text-slate-400 border border-slate-500/10"
                  }`}
                >
                  {n.marketTrend === "hot" ? "🔥 Hot Market" : n.marketTrend === "up" ? "↗ Trending Up" : "→ Stable"}
                </span>
              </motion.div>

              {/* Overview */}
              <motion.div
                className="prose prose-slate dark:prose-invert max-w-none mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {n.overview}
                </p>
              </motion.div>
            </div>

            {/* Hero image card */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative glass rounded-3xl overflow-hidden h-72 sm:h-80 lg:h-full min-h-[300px]">
                <img
                  src={n.image}
                  alt={n.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-gray-900/10 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <span className="text-white/60 text-xs uppercase tracking-widest">Median Price</span>
                  <p className="font-display text-3xl font-bold text-white">
                    {formatPrice(n.stats.medianPrice)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent pointer-events-none" />
      </section>

      {/* ============================================ */}
      {/* MARKET STATS DASHBOARD */}
      {/* ============================================ */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 text-xs font-medium text-emerald-400 mb-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <TrendingUp className="w-3 h-3" />
              MARKET STATS
            </motion.span>
            <motion.h2
              className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              {n.name} <span className="text-gradient">by the Numbers</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <StatBlock label="Median Price" value={n.stats.medianPrice} prefix="$" icon={DollarSign} index={0} />
            <StatBlock label="Price/SqFt" value={n.stats.pricePerSqft} prefix="$" icon={Home} index={1} />
            <StatBlock label="Days on Market" value={n.stats.avgDaysOnMarket} suffix="d" icon={Clock} index={2} />
            <StatBlock label="Active Listings" value={n.stats.activeListings} icon={Building2} index={3} />
            <StatBlock label="Mo. Inventory" value={n.stats.monthsInventory} icon={TrendingUp} index={4} />
            <StatBlock label="YoY Apprec." value={n.stats.yoyAppreciation} suffix="%" icon={Sparkles} index={5} />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PROS & CONS + LIFESTYLE */}
      {/* ============================================ */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pros */}
            <motion.div
              className="glass rounded-2xl p-6 sm:p-8 group"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3 }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-px rounded-full bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent group-hover:w-full transition-all duration-500" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white">Pros</h3>
              </div>
              <ul className="space-y-3">
                {n.pros.map((pro, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                    {pro}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Cons */}
            <motion.div
              className="glass rounded-2xl p-6 sm:p-8 group"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3 }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-px rounded-full bg-gradient-to-r from-transparent via-red-400/20 to-transparent group-hover:w-full transition-all duration-500" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-400" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white">Cons</h3>
              </div>
              <ul className="space-y-3">
                {n.cons.map((con, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                    {con}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* LIFESTYLE */}
      {/* ============================================ */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="glass rounded-2xl p-6 sm:p-10 relative overflow-hidden group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-px rounded-full bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent group-hover:w-full transition-all duration-500" />
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-cyan-400" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
                The {n.name} Lifestyle
              </h3>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {n.lifestyle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SCHOOLS + SCORES */}
      {/* ============================================ */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Schools */}
            <motion.div
              className="glass rounded-2xl p-6 sm:p-8 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white">Schools</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Elementary</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{n.schools.elementary}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Middle</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{n.schools.middle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">High</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{n.schools.high}</span>
                </div>
                <div className="pt-3 border-t border-[var(--color-glass-border)]">
                  <ScoreBar label="School Rating" value={n.schools.rating} max={10} color="emerald" />
                </div>
              </div>
            </motion.div>

            {/* Walk + Transit Scores */}
            <motion.div
              className="glass rounded-2xl p-6 sm:p-8 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                  <Footprints className="w-5 h-5 text-cyan-400" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white">Accessibility</h3>
              </div>
              <div className="space-y-5">
                <ScoreBar label="Walk Score" value={n.walkScore} max={100} color="emerald" />
                <ScoreBar label="Transit Score" value={n.transitScore} max={100} color="cyan" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* STR POTENTIAL */}
      {/* ============================================ */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="glass rounded-2xl p-6 sm:p-10 relative overflow-hidden group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/3 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-400/3 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-400/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
                  STR Potential in {n.name}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center mb-2">
                    <div className="relative w-16 h-16">
                      <svg width="64" height="64" className="-rotate-90">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-200 dark:text-slate-700" />
                        <motion.circle
                          cx="32" cy="32" r="28" fill="none" stroke={n.strScore >= 70 ? "#10B981" : n.strScore >= 40 ? "#F59E0B" : "#EF4444"}
                          strokeWidth="4" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 28}
                          initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                          whileInView={{ strokeDashoffset: 2 * Math.PI * 28 - (n.strScore / 100) * 2 * Math.PI * 28 }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </svg>
                      <span className={`absolute inset-0 flex items-center justify-center font-display text-lg font-bold ${
                        n.strScore >= 70 ? "text-emerald-400" : n.strScore >= 40 ? "text-amber-400" : "text-red-400"
                      }`}>{n.strScore}</span>
                    </div>
                  </div>
                  <span className="block text-xs text-slate-500">STR Viability Score</span>
                </div>
                <div className="text-center flex flex-col justify-center">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {n.strRevenue === 0 ? "N/A" : `$${n.strRevenue}K`}
                  </span>
                  <span className="block text-xs text-slate-500">Est. Annual Revenue</span>
                </div>
                <div className="text-center flex flex-col justify-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border mx-auto mb-1.5 ${
                    n.strRegulation === "permitted"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : n.strRegulation === "restricted"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : n.strRegulation === "prohibited"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-cyan-400/10 text-cyan-400 border-cyan-400/20"
                  }`}>
                    {{
                      permitted: "Permitted",
                      restricted: "Restricted",
                      prohibited: "Prohibited",
                      "homestay-only": "Homestay Only",
                    }[n.strRegulation]}
                  </span>
                  <span className="block text-xs text-slate-500">Regulation Status</span>
                </div>
              </div>
              <div className="flex justify-center">
                <Link
                  href={`/str-insights?neighborhood=${n.id}`}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-cyan-500 transition-all duration-300 group"
                >
                  STR Potential in this area
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* BEST FOR + CTA */}
      {/* ============================================ */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Best For
            </h3>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {n.bestFor.map((item, i) => (
              <motion.span
                key={item}
                className="px-5 py-2.5 rounded-full glass-hover text-sm font-medium text-gray-700 dark:text-slate-200 border border-[var(--color-glass-border)]"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i, duration: 0.3 }}
                whileHover={{ y: -2, scale: 1.03 }}
              >
                {item}
              </motion.span>
            ))}
          </div>

          {/* CTA actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link
                href={`/homes-for-sale?neighborhood=${n.id}`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-cyan-500 transition-all duration-300 group"
              >
                <Home className="w-4 h-4" strokeWidth={1.5} />
                Homes for Sale in {n.name}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl glass-hover text-sm font-medium text-gray-900 dark:text-white border border-[var(--color-glass-border)] group"
              >
                Estimate {n.name} Home Value
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href="/market-reports"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl glass-hover text-sm font-medium text-gray-900 dark:text-white border border-[var(--color-glass-border)] group"
              >
                View Market Reports
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* BACK + NAVIGATION */}
      {/* ============================================ */}
      <section className="relative py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/neighborhoods"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
            All Neighborhoods
          </Link>

          <Link
            href="/resources?category=home-services"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-400 transition-colors group"
          >
            <BookOpen className="w-4 h-4" strokeWidth={1.5} />
            Home Services & Resources
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </>
  );
}
