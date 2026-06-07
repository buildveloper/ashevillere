"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp,
  ChevronRight,
  RefreshCw,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { useInView } from "@/hooks/use-animations";
import { StatsDashboard } from "@/components/market-reports/StatsDashboard";
import { MarketTrendCharts } from "@/components/market-reports/MarketTrendCharts";
import { MarketInsights } from "@/components/market-reports/MarketInsights";
import { DownloadCTA } from "@/components/market-reports/DownloadCTA";
import { useState, useCallback } from "react";

function RefreshButton({
  onRefresh,
  refreshing,
}: {
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <motion.button
      onClick={onRefresh}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 hover:text-emerald-400 glass-hover transition-colors"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
    >
      <motion.div
        animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
        transition={
          refreshing
            ? { duration: 0.8, repeat: Infinity, ease: "linear" }
            : { duration: 0.3 }
        }
      >
        <RefreshCw className="w-3 h-3" strokeWidth={1.5} />
      </motion.div>
      <span>Refresh Data</span>
    </motion.button>
  );
}

export default function MarketReportsPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("June 1, 2026 • 9:30 AM EST");
  const { ref: heroRef, inView: heroInView } = useInView(0.1);

  const handleRefresh = useCallback(() => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdated(
        `June 7, 2026 • ${new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        })}`
      );
    }, 1500);
  }, [refreshing]);

  return (
    <>
      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-16 px-4 sm:px-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/3 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/3 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <motion.nav
            className="flex items-center gap-2 text-xs sm:text-sm mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href="/"
              className="text-slate-500 hover:text-emerald-400 transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" strokeWidth={1.5} />
            <span className="text-emerald-400 font-medium">Market Reports</span>
          </motion.nav>

          {/* Hero content */}
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill badge */}
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 text-xs font-medium text-emerald-400 mb-5"
              initial={{ opacity: 0, y: 10 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Calendar className="w-3 h-3" strokeWidth={1.5} />
              UPDATED {lastUpdated.split("•")[0].trim().toUpperCase()}
            </motion.span>

            {/* Main heading */}
            <motion.h1
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              Asheville{" "}
              <span className="text-gradient">Market Reports</span>
              <br />
              <span className="text-3xl sm:text-4xl md:text-5xl">2026</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              Comprehensive real estate data and expert analysis for Asheville, NC.
              Track prices, inventory, trends, and neighborhood performance.
            </motion.p>

            {/* Timestamp + Refresh */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-500"
              initial={{ opacity: 0, y: 15 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Last updated: {lastUpdated}
              </span>
              <RefreshButton onRefresh={handleRefresh} refreshing={refreshing} />
            </motion.div>
          </div>
        </div>

        {/* Bottom fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent pointer-events-none" />
      </section>

      {/* ============================================ */}
      {/* STATS DASHBOARD */}
      {/* ============================================ */}
      <StatsDashboard />

      {/* ============================================ */}
      {/* MARKET TREND CHARTS */}
      {/* ============================================ */}
      <MarketTrendCharts />

      {/* ============================================ */}
      {/* MARKET INSIGHTS */}
      {/* ============================================ */}
      <MarketInsights />

      {/* ============================================ */}
      {/* DOWNLOAD CTA */}
      {/* ============================================ */}
      <DownloadCTA />

      {/* ============================================ */}
      {/* QUICK LINKS (Next steps after viewing reports) */}
      {/* ============================================ */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            className="text-sm text-slate-500 mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            Ready to dive deeper?
          </motion.p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Link
                href="/neighborhoods"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-hover text-sm font-medium text-gray-900 dark:text-white border border-[var(--color-glass-border)] group"
              >
                Explore Neighborhoods
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <Link
                href="/homes-for-sale"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium shadow-lg shadow-emerald-500/20 group"
              >
                Browse Current Listings
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-hover text-sm font-medium text-gray-900 dark:text-white border border-[var(--color-glass-border)] group"
              >
                Try Our Tools
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
