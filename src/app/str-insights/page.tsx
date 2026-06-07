"use client";

import { useState, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronRight,
  MapPin,
  TrendingUp,
  DollarSign,
  Home,
  AlertTriangle,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Building2,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Star,
  Clock,
  Umbrella,
  Landmark,
  Hammer,
  BarChart3,
  Send,
  ExternalLink,
  Download,
  Percent,
  Scale,
} from "lucide-react";
import { useInView, useCountUp } from "@/hooks/use-animations";
import { NEIGHBORHOODS, type NeighborhoodDetail } from "@/lib/neighborhoods";
import { AIChatbot } from "@/components/home/AIChatbot";

function formatPrice(price: number): string {
  if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
  return `$${(price / 1000).toFixed(0)}K`;
}

const REGULATION_STATUS = {
  permitted: { label: "Permitted", color: "emerald", icon: CheckCircle2 },
  restricted: { label: "Restricted", color: "amber", icon: AlertCircle },
  prohibited: { label: "Prohibited", color: "red", icon: XCircle },
  "homestay-only": { label: "Homestay Only", color: "cyan", icon: Home },
} as const;

function AnimatedValue({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const { ref, inView } = useInView(0.15);
  const count = useCountUp(value, 1800, inView);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {inView ? count.toLocaleString() : "0"}
      {suffix}
    </span>
  );
}

function PulseBadge({
  status,
  className = "",
}: {
  status: "permitted" | "restricted" | "prohibited" | "homestay-only";
  className?: string;
}) {
  const rs = REGULATION_STATUS[status];
  const Icon = rs.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${className} ${
        status === "permitted"
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : status === "restricted"
          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
          : status === "prohibited"
          ? "bg-red-500/10 text-red-400 border-red-500/20"
          : "bg-cyan-400/10 text-cyan-400 border-cyan-400/20"
      }`}
    >
      <motion.span
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon className="w-3 h-3" strokeWidth={2} />
      </motion.span>
      {rs.label}
    </span>
  );
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 70
      ? "#10B981"
      : score >= 40
      ? "#F59E0B"
      : "#EF4444";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display text-xl font-bold"
          style={{ color }}
        >
          {score}
        </span>
      </div>
    </div>
  );
}

const REGULATION_CARDS = [
  {
    title: "Homestay Rules",
    icon: Home,
    color: "cyan" as const,
    content:
      "Homestays allow you to rent up to two bedrooms in your primary residence while you're present. This is the most common permitted use in residential zones. You must live on-site during guest stays and the rental cannot exceed 180 days per year.",
    highlights: ["Must be primary residence", "Max 2 bedrooms", "Owner must be present"],
  },
  {
    title: "Full STR (Whole-Home)",
    icon: Building2,
    color: "emerald" as const,
    content:
      "Full whole-home short-term rentals are only permitted in specific zoning districts — primarily Resort, Commercial, and select mixed-use areas. Downtown and parts of the River Arts District have the most permissive zoning. Most residential neighborhoods restrict or prohibit whole-home STRs entirely.",
    highlights: ["Resort & Commercial zones only", "Requires annual permit", "$250 application fee"],
  },
  {
    title: "Resort Zoning",
    icon: Sparkles,
    color: "emerald" as const,
    content:
      "Resort-zoned properties have the most flexibility for STR operations. These districts are designed for tourism and hospitality use. Properties in Resort zones can operate as full STRs with proper permitting, but must comply with safety inspections and occupancy limits.",
    highlights: ["Full STR permitted", "Safety inspection required", "Occupancy caps apply"],
  },
  {
    title: "Permit Requirements",
    icon: FileText,
    color: "amber" as const,
    content:
      "All STR operators must obtain an annual permit from the City of Asheville Development Services. The permit process includes a zoning compliance review, safety inspection, and proof of liability insurance. Permits must be renewed yearly and are non-transferable.",
    highlights: ["Annual renewal required", "Zoning compliance check", "Insurance proof needed"],
  },
  {
    title: "Fines & Penalties",
    icon: Scale,
    color: "red" as const,
    content:
      "Operating without a permit carries fines starting at $500 per day for a first offense. Repeat violations can result in fines up to $1,000/day and potential legal action. The City actively monitors STR listings and responds to neighbor complaints.",
    highlights: ["$500/day first offense", "$1,000/day for repeats", "Active city enforcement"],
  },
];

const RISKS = [
  {
    title: "Post-Helene Considerations",
    icon: AlertTriangle,
    color: "amber" as const,
    content:
      "Hurricane Helene's impact on Western North Carolina has affected tourism patterns, insurance availability, and infrastructure in some areas. Check flood zone maps carefully — some previously desirable areas now carry elevated risk. Recovery efforts are ongoing, and market dynamics continue to evolve.",
  },
  {
    title: "Insurance Requirements",
    icon: Umbrella,
    color: "cyan" as const,
    content:
      "Standard homeowners insurance does not cover STR activity. You'll need a specialized landlord or business policy. Key coverage: liability ($1M+ recommended), property damage, loss of income, and flood insurance if in a flood zone.",
  },
  {
    title: "Tax Implications",
    icon: Landmark,
    color: "emerald" as const,
    content:
      "STR income is taxable at federal and state levels. Buncombe County charges occupancy tax (6%) on top of state sales tax (4.75%). You're responsible for collecting and remitting these taxes. Keep meticulous records — the IRS treats STRs as a business activity.",
  },
  {
    title: "Market Saturation Risk",
    icon: TrendingUp,
    color: "amber" as const,
    content:
      "Asheville's STR market has grown significantly. Increased supply in popular neighborhoods means more competition for bookings. Revenue projections should factor in occupancy rate declines during off-peak seasons (January–March). Differentiate your property to stand out.",
  },
];

const PRO_TIPS = [
  {
    title: "Dynamic Pricing Tools",
    icon: DollarSign,
    content:
      "Use pricing automation like PriceLabs or Beyond to adjust rates based on demand, events, and seasonality. Properties using dynamic pricing see 15-25% higher annual revenue.",
    link: "#",
    linkLabel: "Compare tools",
  },
  {
    title: "Professional Photography",
    icon: Star,
    content:
      "Listings with professional photos earn 40% more revenue. Invest in twilight shots of mountain views and highlight proximity to Asheville's top attractions.",
    link: "#",
    linkLabel: "Find photographers",
  },
  {
    title: "Property Management Partners",
    icon: Building2,
    content:
      "Consider partnering with a local property manager for 15-25% of revenue. They handle cleaning, guest communication, and maintenance — essential if you're not local.",
    link: "#",
    linkLabel: "View partners",
  },
  {
    title: "Seasonal Strategy",
    icon: Clock,
    content:
      "Asheville peaks in October (leaf season) and summer. Build a 3-night minimum for peak periods and offer midweek discounts January–March to maintain occupancy.",
    link: "#",
    linkLabel: "Seasonality guide",
  },
];

function STRInsightsContent() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("neighborhood") || "";
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodDetail | null>(
    () => NEIGHBORHOODS.find((n) => n.id === preselectedId) || null
  );
  const [showReportModal, setShowReportModal] = useState(false);
  const { ref: heroRef, inView: heroInView } = useInView(0.1);

  const sortedByStr = useMemo(
    () => [...NEIGHBORHOODS].sort((a, b) => b.strScore - a.strScore),
    []
  );

  const permittedCount = NEIGHBORHOODS.filter((n) => n.strRegulation === "permitted").length;
  const restrictedCount = NEIGHBORHOODS.filter((n) => n.strRegulation === "restricted" || n.strRegulation === "homestay-only").length;

  const selectedData = selectedNeighborhood || sortedByStr[0];

  return (
    <>
      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[700px] h-[700px] bg-emerald-500/4 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-cyan-400/3 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-br from-emerald-500/2 to-cyan-400/2 rounded-full blur-3xl" />
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
            <span className="text-emerald-400 font-medium">STR Insights</span>
          </motion.nav>

          {/* Badge + Status */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 text-xs font-medium text-emerald-400 w-fit"
              initial={{ opacity: 0, y: 10 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <BarChart3 className="w-3 h-3" />
              2026 GUIDE
            </motion.span>
            <motion.div
              className="flex flex-wrap items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {permittedCount} zones permit STRs
              </span>
              <span className="text-slate-600">·</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {restrictedCount} zones restrict STRs
              </span>
            </motion.div>
          </div>

          {/* Title */}
          <motion.h1
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight mb-6 max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Asheville{" "}
            <span className="text-gradient">Short-Term Rental</span>{" "}
            Guide 2026
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed mb-8"
            initial={{ opacity: 0, y: 15 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            Everything you need to know about Asheville&apos;s STR regulations, top-earning
            neighborhoods, and how to maximize your investment in 2026 — all in one place.
          </motion.p>

          {/* Quick action buttons */}
          <motion.div
            className="flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 15 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <button
              onClick={() => {
                const el = document.getElementById("earnings-dashboard");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-cyan-500 transition-all duration-300 group"
            >
              <DollarSign className="w-4 h-4" strokeWidth={1.5} />
              Check Earnings Potential
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("regulations");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl glass-hover text-sm font-medium text-gray-900 dark:text-white border border-[var(--color-glass-border)] group"
            >
              <Scale className="w-4 h-4 text-cyan-400" strokeWidth={1.5} />
              View Regulations
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
            </button>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent pointer-events-none" />
      </section>

      {/* ============================================ */}
      {/* CURRENT REGULATIONS */}
      {/* ============================================ */}
      <section id="regulations" className="relative py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/10 bg-cyan-400/5 text-xs font-medium text-cyan-400 mb-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Scale className="w-3 h-3" />
              ASHEVILLE STR RULES
            </motion.span>
            <motion.h2
              className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Current{" "}
              <span className="text-gradient">Regulations</span>
            </motion.h2>
            <motion.p
              className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              Updated for 2026. Always verify with the City of Asheville Development Services before operating.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {REGULATION_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  className="glass rounded-2xl p-5 sm:p-6 group relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -3 }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-px rounded-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent group-hover:w-full transition-all duration-500" />
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                      card.color === "emerald"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : card.color === "cyan"
                        ? "bg-cyan-400/10 text-cyan-400"
                        : card.color === "amber"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {card.content}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {card.highlights.map((h, j) => (
                      <span
                        key={j}
                        className="text-[10px] font-medium px-2 py-1 rounded-md bg-white/5 text-slate-400 border border-[var(--color-glass-border)]"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* EARNINGS POTENTIAL DASHBOARD */}
      {/* ============================================ */}
      <section id="earnings-dashboard" className="relative py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 text-xs font-medium text-emerald-400 mb-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <DollarSign className="w-3 h-3" />
              EARNINGS DASHBOARD
            </motion.span>
            <motion.h2
              className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              STR Earnings{" "}
              <span className="text-gradient">Potential</span>
            </motion.h2>
            <motion.p
              className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              Estimated annual revenue based on neighborhood data, occupancy rates, and market trends.
              Select a neighborhood to explore.
            </motion.p>
          </div>

          {/* Neighborhood selector chips */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 mb-10"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {sortedByStr.map((n) => {
              const isSelected = selectedNeighborhood?.id === n.id;
              return (
                <motion.button
                  key={n.id}
                  onClick={() => setSelectedNeighborhood(n)}
                  className={`relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isSelected
                      ? "glass-strong text-gray-900 dark:text-white shadow-lg border-emerald-500/20"
                      : "glass text-slate-500 hover:text-slate-300"
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {n.name}
                  {isSelected && (
                    <motion.div
                      layoutId="str-neighborhood-active"
                      className="absolute -bottom-px left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Selected neighborhood detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedData.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score + Revenue card */}
                <div className="glass rounded-2xl p-6 sm:p-8 group relative overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-px rounded-full bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent group-hover:w-full transition-all duration-500" />
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedData.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{selectedData.tagline}</p>
                    </div>
                    <PulseBadge status={selectedData.strRegulation} />
                  </div>

                  <div className="flex items-center justify-center mb-6">
                    <ScoreRing score={selectedData.strScore} size={120} />
                  </div>

                  <div className="text-center mb-4">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">
                      Estimated Annual Revenue
                    </span>
                    <p className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-1">
                      <AnimatedValue value={selectedData.strRevenue} prefix="$" suffix="K" />
                    </p>
                  </div>

                  <Link
                    href={`/neighborhoods/${selectedData.id}`}
                    className="flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-emerald-400 transition-colors group/link mt-2"
                  >
                    View full neighborhood profile
                    <ArrowUpRight className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" strokeWidth={1.5} />
                  </Link>
                </div>

                {/* Revenue comparison bar chart */}
                <div className="lg:col-span-2 glass rounded-2xl p-6 sm:p-8">
                  <h4 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Revenue Comparison
                  </h4>
                  <div className="space-y-4">
                    {sortedByStr.map((n, i) => {
                      const maxRevenue = sortedByStr[0].strRevenue;
                      const pct = (n.strRevenue / maxRevenue) * 100;
                      const isCurrent = n.id === selectedData.id;

                      return (
                        <div key={n.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span
                              className={`font-medium ${
                                isCurrent
                                  ? "text-emerald-400"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              {n.name}
                            </span>
                            <span className="text-slate-500 tabular-nums">
                              ${n.strRevenue}K/yr
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${
                                isCurrent
                                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                                  : "bg-gradient-to-r from-emerald-500/40 to-cyan-400/40"
                              }`}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${pct}%` }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 1,
                                delay: i * 0.08,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ============================================ */}
      {/* BEST NEIGHBORHOODS FOR STR */}
      {/* ============================================ */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/10 bg-cyan-400/5 text-xs font-medium text-cyan-400 mb-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Star className="w-3 h-3" />
              TOP PERFORMERS
            </motion.span>
            <motion.h2
              className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Best Neighborhoods{" "}
              <span className="text-gradient">for STR</span>
            </motion.h2>
            <motion.p
              className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              Ranked by STR viability score. Scores consider zoning, demand, walkability, and revenue data.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {sortedByStr.map((n, i) => (
              <motion.div
                key={n.id}
                className="glass rounded-2xl p-5 sm:p-6 group relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-px rounded-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent group-hover:w-full transition-all duration-500" />
                {/* Rank badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-400/10 flex items-center justify-center">
                    <span className="font-display text-sm font-bold text-emerald-400">
                      #{i + 1}
                    </span>
                  </div>
                  <PulseBadge status={n.strRegulation} className="text-[10px]" />
                </div>

                <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {n.name}
                </h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">{n.tagline}</p>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">STR Score</span>
                    <span className="font-bold text-emerald-400">{n.strScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Est. Revenue</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {n.strRevenue === 0 ? "N/A" : `$${n.strRevenue}K/yr`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Median Price</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatPrice(n.stats.medianPrice)}
                    </span>
                  </div>
                  {n.strRevenue > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Cap Rate</span>
                      <span className="font-semibold text-cyan-400">
                        {((n.strRevenue * 1000 / n.stats.medianPrice) * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/neighborhoods/${n.id}?from=str`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl glass-hover text-xs font-medium text-slate-500 hover:text-emerald-400 transition-colors group/link"
                >
                  View Details
                  <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" strokeWidth={1.5} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* RISKS & CONSIDERATIONS */}
      {/* ============================================ */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/10 bg-amber-500/5 text-xs font-medium text-amber-400 mb-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <AlertTriangle className="w-3 h-3" />
              KNOW THE RISKS
            </motion.span>
            <motion.h2
              className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Risks & Important{" "}
              <span className="text-gradient">Considerations</span>
            </motion.h2>
            <motion.p
              className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              Smart investors understand the downsides. Here&apos;s what to watch for.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {RISKS.map((risk, i) => {
              const Icon = risk.icon;
              return (
                <motion.div
                  key={risk.title}
                  className="glass rounded-2xl p-5 sm:p-6 group relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -3 }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        risk.color === "emerald"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : risk.color === "cyan"
                          ? "bg-cyan-400/10 text-cyan-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {risk.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {risk.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PRO TIPS & RESOURCES */}
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
              <Sparkles className="w-3 h-3" />
              PRO TIPS
            </motion.span>
            <motion.h2
              className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Pro Tips &{" "}
              <span className="text-gradient">Resources</span>
            </motion.h2>
            <motion.p
              className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              Tools, partners, and strategies from experienced Asheville STR operators.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-12">
            {PRO_TIPS.map((tip, i) => {
              const Icon = tip.icon;
              return (
                <motion.div
                  key={tip.title}
                  className="glass rounded-2xl p-5 sm:p-6 group relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -3 }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-px rounded-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent group-hover:w-full transition-all duration-500" />
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-cyan-400" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {tip.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                        {tip.content}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer group/link">
                        {tip.linkLabel}
                        <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" strokeWidth={1.5} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Affiliate resource highlight */}
          <motion.div
            className="glass-strong rounded-2xl p-6 sm:p-10 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-400/3 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-400/20 flex items-center justify-center mx-auto mb-5">
                <Building2 className="w-7 h-7 text-emerald-400" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Need Property Management?
              </h3>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-6">
                We&apos;ve partnered with Asheville&apos;s top property management companies.
                Get a free consultation and see how much you could earn with professional management.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-cyan-500 transition-all duration-300 group">
                  Get Free Consultation
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={1.5} />
                </button>
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl glass-hover text-sm font-medium text-gray-900 dark:text-white border border-[var(--color-glass-border)] group">
                  Compare Partners
                  <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* GENERATE STR REPORT CTA */}
      {/* ============================================ */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="glass-strong rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500/5 to-cyan-400/5 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <motion.div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-400/20 flex items-center justify-center mx-auto mb-6"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Download className="w-8 h-8 text-emerald-400" strokeWidth={1.5} />
              </motion.div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                Generate Your{" "}
                <span className="text-gradient">STR Report</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-8">
                Get a personalized short-term rental analysis for any Asheville neighborhood.
                Includes revenue projections, regulation summary, and investment metrics.
              </p>
              <motion.button
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold shadow-xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-cyan-500 transition-all duration-300 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FileText className="w-5 h-5" strokeWidth={1.5} />
                Generate My STR Report
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </motion.button>
              <p className="text-xs text-slate-500 mt-4">Free — no sign-up required</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Report generation modal */}
      <AnimatePresence>
        {showReportModal && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReportModal(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md glass-strong rounded-2xl p-8 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="text-center">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-400/20 flex items-center justify-center mx-auto mb-5"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FileText className="w-8 h-8 text-emerald-400" strokeWidth={1.5} />
                </motion.div>
                <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2">
                  STR Report Coming Soon
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  We&apos;re building a comprehensive PDF report generator. Enter your email and we&apos;ll
                  notify you when it&apos;s ready — plus send you a free Asheville STR market overview.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setShowReportModal(false);
                  }}
                  className="space-y-3"
                >
                  <input
                    type="email"
                    placeholder="you@email.com"
                    className="w-full px-4 py-3 rounded-xl glass text-sm text-gray-900 dark:text-white placeholder:text-slate-400 border border-[var(--color-glass-border)] focus:outline-none focus:border-emerald-500/30"
                  />
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-cyan-500 transition-all duration-300 group"
                  >
                    <Send className="w-4 h-4" strokeWidth={1.5} />
                    Notify Me
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                  </button>
                </form>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="mt-3 text-xs text-slate-500 hover:text-slate-400 transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* BOTTOM NAVIGATION */}
      {/* ============================================ */}
      <section className="relative py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/neighborhoods"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-400 transition-colors group"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
              Explore All Neighborhoods
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-hover text-sm font-medium text-gray-900 dark:text-white border border-[var(--color-glass-border)] group"
              >
                <Hammer className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                Tools & Calculators
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </Link>
              <Link
                href="/resources?category=property-management"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-hover text-sm font-medium text-gray-900 dark:text-white border border-[var(--color-glass-border)] group"
              >
                <ExternalLink className="w-4 h-4 text-cyan-400" strokeWidth={1.5} />
                Property Management Tools
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function STRInsightsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      }
    >
      <STRInsightsContent />
    </Suspense>
  );
}
