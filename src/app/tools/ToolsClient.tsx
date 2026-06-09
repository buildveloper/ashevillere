"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronRight,
  Home,
  Calculator,
  ClipboardCheck,
  Wrench,
  Sparkles,
  ArrowRight,
  BarChart3,
  Truck,
} from "lucide-react";
import { useInView } from "@/hooks/use-animations";
import { HomeValueEstimator } from "@/components/tools/HomeValueEstimator";
import { MortgageCalculator } from "@/components/tools/MortgageCalculator";
import { RelocationChecklist } from "@/components/tools/RelocationChecklist";

type TabId = "home-value" | "mortgage" | "relocation";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; color: string; desc: string }[] = [
  {
    id: "home-value",
    label: "Home Value Estimator",
    icon: Home,
    color: "emerald",
    desc: "AI-powered property valuation",
  },
  {
    id: "mortgage",
    label: "Mortgage Calculator",
    icon: Calculator,
    color: "cyan",
    desc: "Monthly payments & amortization",
  },
  {
    id: "relocation",
    label: "Relocation Checklist",
    icon: ClipboardCheck,
    color: "emerald",
    desc: "Step-by-step moving guide",
  },
];

export default function ToolsClient() {
  const [activeTab, setActiveTab] = useState<TabId>("home-value");
  const { ref: heroRef, inView: heroInView } = useInView(0.1);

  return (
    <>
      <section className="relative pt-24 pb-6 sm:pt-32 sm:pb-8 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/3 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-cyan-400/3 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
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
            <span className="text-emerald-400 font-medium">Tools</span>
          </motion.nav>

          <div className="text-center max-w-3xl mx-auto mb-8">
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/10 bg-cyan-400/5 text-xs font-medium text-cyan-400 mb-5"
              initial={{ opacity: 0, y: 10 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Wrench className="w-3 h-3" />
              FREE TOOLS & CALCULATORS
            </motion.span>

            <motion.h1
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              Smart Tools for{" "}
              <span className="text-gradient">Smart Decisions</span>
            </motion.h1>

            <motion.p
              className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              Free calculators and guides to help you navigate the Asheville real estate market with confidence.
            </motion.p>
          </div>

          <motion.div
            className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center mb-0"
            initial={{ opacity: 0, y: 15 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium transition-all ${
                    isActive
                      ? "glass-strong text-gray-900 dark:text-white shadow-lg"
                      : "glass text-slate-500 hover:text-slate-300"
                  }`}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive
                        ? tab.color === "emerald"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-cyan-400/10 text-cyan-400"
                        : "bg-white/5 text-slate-500"
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-semibold">{tab.label}</span>
                    <span className="block text-[10px] text-slate-500 font-normal">
                      {tab.desc}
                    </span>
                  </div>

                  {isActive && (
                    <motion.div
                      layoutId="tool-tab-active"
                      className="absolute -bottom-px left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent pointer-events-none" />
      </section>

      <section className="relative py-8 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === "home-value" && <HomeValueEstimator />}
              {activeTab === "mortgage" && <MortgageCalculator />}
              {activeTab === "relocation" && <RelocationChecklist />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section className="relative py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            className="text-sm text-slate-500 mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            Ready to take the next step?
          </motion.p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Link
                href="/homes-for-sale"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium shadow-lg shadow-emerald-500/20 group"
              >
                <Home className="w-4 h-4" strokeWidth={1.5} />
                See Homes for Sale
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <Link
                href="/neighborhoods"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-hover text-sm font-medium text-gray-900 dark:text-white border border-[var(--color-glass-border)] group"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                Explore Neighborhoods
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Link
                href="/market-reports"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-hover text-sm font-medium text-gray-900 dark:text-white border border-[var(--color-glass-border)] group"
              >
                See Market Reports
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Link
                href="/str-insights"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-hover text-sm font-medium text-gray-900 dark:text-white border border-[var(--color-glass-border)] group"
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                STR Insights
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Link
                href="/resources?category=moving"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-hover text-sm font-medium text-gray-900 dark:text-white border border-[var(--color-glass-border)] group"
              >
                <Truck className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
                Moving Resources
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
