"use client";

import { useState, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronRight,
  Building2,
  GraduationCap,
  Truck,
  Scale,
  Camera,
  Shield,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Star,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Heart,
  Info,
  BookOpen,
  Hammer,
  BarChart3,
  TrendingUp,
  Search,
  ClipboardCheck,
  Wrench,
} from "lucide-react";
import { useInView } from "@/hooks/use-animations";
import { AIChatbot } from "@/components/home/AIChatbot";

type CategoryId = "property-management" | "education" | "moving" | "legal-insurance" | "home-services";

interface AffiliateItem {
  name: string;
  tagline: string;
  description: string;
  pros: string[];
  cons: string[];
  rating: number;
  pricing: string;
  link: string;
  linkLabel: string;
  utm: string;
  featured?: boolean;
}

interface CategorySection {
  id: CategoryId;
  title: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color: "emerald" | "cyan" | "amber";
  description: string;
  items: AffiliateItem[];
}

const RESOURCE_CATEGORIES: CategorySection[] = [
  {
    id: "property-management",
    title: "Property Management",
    icon: Building2,
    color: "emerald",
    description: "Tools and services to manage your Asheville rental properties like a pro. From tenant screening to automated rent collection.",
    items: [
      {
        name: "TurboTenant",
        tagline: "Free landlord software",
        description: "All-in-one platform for DIY landlords. Tenant screening, online rent collection, lease agreements, and maintenance tracking — with a generous free tier that covers the essentials.",
        pros: ["Free core features", "Tenant screening included", "Rent collection & reminders", "Mobile app for on-the-go"],
        cons: ["Premium features cost extra", "No built-in accounting", "US tenants only"],
        rating: 4.5,
        pricing: "Free / $8.25/mo Premium",
        link: "#",
        linkLabel: "Try TurboTenant Free",
        utm: "utm_source=ashevillere&utm_medium=resource&utm_campaign=property-management",
        featured: true,
      },
      {
        name: "Buildium",
        tagline: "Professional property management",
        description: "End-to-end property management platform trusted by professional managers. Full accounting, tenant portals, maintenance workflows, and 1099 e-filing for portfolios of all sizes.",
        pros: ["Full accounting suite", "Tenant & owner portals", "1099 e-filing", "Maintenance ticket system"],
        cons: ["Higher learning curve", "Starts at $55/mo", "Minimum 20-unit plan"],
        rating: 4.3,
        pricing: "From $55/mo (Essentials)",
        link: "#",
        linkLabel: "Explore Buildium",
        utm: "utm_source=ashevillere&utm_medium=resource&utm_campaign=property-management",
      },
      {
        name: "Avail",
        tagline: "DIY landlord tools by Zillow",
        description: "Simplified landlord software with syndicated listings to Zillow, Trulia, and HotPads. Great for first-time landlords with 1-3 units looking for an easy, affordable solution.",
        pros: ["Zillow listing syndication", "Built-in tenant screening", "Free for landlords", "Lease templates included"],
        cons: ["Limited automation", "Basic reporting", "Fewer integrations"],
        rating: 4.2,
        pricing: "Free / $7/mo Plus",
        link: "#",
        linkLabel: "Get Started with Avail",
        utm: "utm_source=ashevillere&utm_medium=resource&utm_campaign=property-management",
      },
      {
        name: "PriceLabs",
        tagline: "Dynamic pricing for STRs",
        description: "Revenue management platform specifically for short-term rentals. Uses market data, seasonality, and demand signals to automatically optimize your nightly rates across Airbnb, VRBO, and Booking.com.",
        pros: ["STR-specific pricing", "Multi-platform sync", "Demand-based adjustments", "30-day free trial"],
        cons: ["Subscription cost", "Requires optimization", "Learning curve for rules"],
        rating: 4.6,
        pricing: "From $19.99/mo per listing",
        link: "#",
        linkLabel: "Start Free Trial",
        utm: "utm_source=ashevillere&utm_medium=resource&utm_campaign=property-management",
        featured: true,
      },
    ],
  },
  {
    id: "education",
    title: "Education & Investing",
    icon: GraduationCap,
    color: "cyan",
    description: "Learn real estate investing from the best. Books, courses, and communities to sharpen your skills and build wealth through property.",
    items: [
      {
        name: "BiggerPockets",
        tagline: "The #1 real estate investing community",
        description: "The largest online community for real estate investors. Forums, podcasts, calculators, books, and a marketplace — all dedicated to helping investors at every level build wealth through real estate.",
        pros: ["Huge community & forums", "Investment calculators", "Educational podcasts", "Marketplace for deals"],
        cons: ["Pro membership is $390/yr", "Can be overwhelming for beginners", "US-focused content"],
        rating: 4.7,
        pricing: "Free / Pro $390/yr",
        link: "#",
        linkLabel: "Join BiggerPockets",
        utm: "utm_source=ashevillere&utm_medium=resource&utm_campaign=education",
        featured: true,
      },
      {
        name: "Roofstock",
        tagline: "Buy & sell rental properties online",
        description: "Marketplace for buying and selling single-family rental properties with tenants already in place. Research neighborhoods, analyze deals, and close remotely — ideal for out-of-state investors eyeing Asheville.",
        pros: ["Tenant-occupied properties", "Remote closing", "Market analytics", "Certified properties"],
        cons: ["Limited Asheville inventory", "Premium pricing", "Transaction fees"],
        rating: 4.1,
        pricing: "0.5% marketplace fee",
        link: "#",
        linkLabel: "Browse Properties",
        utm: "utm_source=ashevillere&utm_medium=resource&utm_campaign=education",
      },
      {
        name: "Stessa",
        tagline: "Free rental property accounting",
        description: "Purpose-built accounting and asset management for rental property owners. Track income, expenses, and generate tax-ready reports — all for free. Integrates with banks and property management software.",
        pros: ["Completely free", "Tax-ready reports", "Bank integrations", "Portfolio dashboard"],
        cons: ["No tenant screening", "Limited mobile features", "US residents only"],
        rating: 4.4,
        pricing: "Free",
        link: "#",
        linkLabel: "Sign Up Free",
        utm: "utm_source=ashevillere&utm_medium=resource&utm_campaign=education",
      },
    ],
  },
  {
    id: "moving",
    title: "Moving & Relocation",
    icon: Truck,
    color: "amber",
    description: "Trusted moving services, relocation resources, and Asheville-specific guides to make your transition smooth and stress-free.",
    items: [
      {
        name: "HireAHelper",
        tagline: "Compare & book local movers",
        description: "Marketplace to compare, book, and pay local moving labor. Compare real reviews and prices for Asheville-area movers — whether you need full-service or just loading help for your rental truck.",
        pros: ["Compare multiple movers", "Verified reviews", "Upfront pricing", "Same-day booking"],
        cons: ["Quality varies by crew", "Service fee on top", "Not available everywhere"],
        rating: 4.3,
        pricing: "Varies by job / free quotes",
        link: "#",
        linkLabel: "Get Moving Quotes",
        utm: "utm_source=ashevillere&utm_medium=resource&utm_campaign=moving",
        featured: true,
      },
      {
        name: "PODS",
        tagline: "Flexible moving & storage containers",
        description: "Portable storage containers delivered to your door. Pack at your own pace, store on-site or at a PODS facility, and transport to your new home. Ideal for phased relocations to Asheville.",
        pros: ["Flexible packing timeline", "Storage options included", "Nationwide coverage", "Weather-resistant"],
        cons: ["Requires driveway space", "Premium vs truck rental", "Limited access during storage"],
        rating: 4.0,
        pricing: "Quote-based",
        link: "#",
        linkLabel: "Check Availability",
        utm: "utm_source=ashevillere&utm_medium=resource&utm_campaign=moving",
      },
    ],
  },
  {
    id: "legal-insurance",
    title: "Legal & Insurance",
    icon: Scale,
    color: "emerald",
    description: "Protect your investment with the right legal structure, insurance coverage, and professional guidance for North Carolina real estate.",
    items: [
      {
        name: "Steadily",
        tagline: "Landlord insurance made simple",
        description: "Insurance built specifically for landlords and rental property investors. Get quotes in minutes for property, liability, and loss-of-rent coverage. Compare to traditional homeowners policies that exclude rental activity.",
        pros: ["Landlord-specific coverage", "Fast online quotes", "Loss-of-rent included", "Multi-property discounts"],
        cons: ["Not in all states", "Online-only service", "Claims process varies"],
        rating: 4.4,
        pricing: "From $25/mo",
        link: "#",
        linkLabel: "Get a Quote",
        utm: "utm_source=ashevillere&utm_medium=resource&utm_campaign=legal-insurance",
        featured: true,
      },
      {
        name: "LegalZoom",
        tagline: "LLC formation & legal services",
        description: "Form an LLC, register your business, and access attorney advice for your rental property business. Holding investment properties in an LLC is a common strategy for liability protection in North Carolina.",
        pros: ["LLC formation packages", "Registered agent service", "Attorney consultations", "Compliance calendar"],
        cons: ["Upsells on add-ons", "State fees extra", "Not a substitute for a local attorney"],
        rating: 4.2,
        pricing: "From $0 + state fees",
        link: "#",
        linkLabel: "Form Your LLC",
        utm: "utm_source=ashevillere&utm_medium=resource&utm_campaign=legal-insurance",
      },
    ],
  },
  {
    id: "home-services",
    title: "Home Services",
    icon: Camera,
    color: "cyan",
    description: "Professional services to prepare your property — from listing photography to home inspections. These are the partners that make a difference in your bottom line.",
    items: [
      {
        name: "Angi",
        tagline: "Find vetted local pros",
        description: "Search and hire vetted local professionals for everything from home inspections to renovations to professional real estate photography. Read verified reviews from other Asheville homeowners.",
        pros: ["Vetted professionals", "Verified review system", "Project cost guides", "Service guarantee"],
        cons: ["Lead fees for pros", "Can be sales-heavy", "Mixed contractor quality"],
        rating: 4.0,
        pricing: "Free to search",
        link: "#",
        linkLabel: "Find Local Pros",
        utm: "utm_source=ashevillere&utm_medium=resource&utm_campaign=home-services",
        featured: true,
      },
      {
        name: "HomeAdvisor",
        tagline: "Home service marketplace",
        description: "Another major marketplace to find and book home service professionals. Good for getting multiple quotes for larger projects like pre-listing renovations or post-inspection repairs.",
        pros: ["Large contractor network", "Cost guides available", "Project planning tools", "Instant booking"],
        cons: ["Duplicate listings with Angi", "Paid leads for pros", "Quality varies"],
        rating: 3.8,
        pricing: "Free to search",
        link: "#",
        linkLabel: "Browse Services",
        utm: "utm_source=ashevillere&utm_medium=resource&utm_campaign=home-services",
      },
    ],
  },
];

const CATEGORY_IDS: CategoryId[] = [
  "property-management",
  "education",
  "moving",
  "legal-insurance",
  "home-services",
];

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>
          {i < fullStars ? (
            <Star className="text-amber-400" fill="#F59E0B" style={{ width: size, height: size }} strokeWidth={1} />
          ) : i === fullStars && hasHalf ? (
            <span className="relative" style={{ width: size, height: size }}>
              <Star className="text-slate-300 dark:text-slate-600 absolute" style={{ width: size, height: size }} strokeWidth={1} />
              <span className="overflow-hidden absolute" style={{ width: size * 0.5 }}>
                <Star className="text-amber-400" fill="#F59E0B" style={{ width: size, height: size }} strokeWidth={1} />
              </span>
            </span>
          ) : (
            <Star className="text-slate-300 dark:text-slate-600" style={{ width: size, height: size }} strokeWidth={1} />
          )}
        </span>
      ))}
    </div>
  );
}

function AffiliateCard({
  item,
  index,
}: {
  item: AffiliateItem;
  index: number;
}) {
  const [clicked, setClicked] = useState(false);
  const { ref, inView } = useInView(0.15);

  const handleClick = useCallback(() => {
    setClicked(true);
    setTimeout(() => setClicked(false), 2500);
  }, []);

  return (
    <motion.div
      ref={ref}
      className={`glass rounded-2xl p-5 sm:p-6 group relative overflow-hidden ${
        item.featured ? "ring-1 ring-emerald-500/20" : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-px rounded-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent group-hover:w-full transition-all duration-500" />

      {item.featured && (
        <div className="absolute top-4 right-4">
          <motion.span
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-[10px] font-medium text-emerald-400 border border-emerald-500/20"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3" strokeWidth={1.5} />
            Top Pick
          </motion.span>
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <AffiliateLogo name={item.name} size={48} />
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white">
            {item.name}
          </h3>
          <p className="text-xs text-cyan-400 font-medium mt-0.5">{item.tagline}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <StarRating rating={item.rating} size={12} />
            <span className="text-[10px] text-slate-500">{item.rating}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
        {item.description}
      </p>

      {/* Pros/Cons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1.5 block">
            Pros
          </span>
          <ul className="space-y-1">
            {item.pros.map((p, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400 mb-1.5 block">
            Cons
          </span>
          <ul className="space-y-1">
            {item.cons.map((c, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <XCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pricing */}
      <div className="flex items-center gap-2 mb-4 text-xs">
        <span className="text-slate-500">Pricing:</span>
        <span className="font-medium text-slate-700 dark:text-slate-200">{item.pricing}</span>
      </div>

      {/* CTA button */}
      <motion.a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 group/btn ${
          clicked
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            : "bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/15 hover:from-emerald-400 hover:to-cyan-500"
        }`}
        whileHover={!clicked ? { scale: 1.02 } : {}}
        whileTap={{ scale: 0.98 }}
      >
        {clicked ? (
          <>
            <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
            Thanks! Check your inbox
          </>
        ) : (
          <>
            {item.linkLabel}
            <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" strokeWidth={1.5} />
          </>
        )}
      </motion.a>

      {/* FTC disclosure */}
      <p className="text-[9px] text-slate-500 mt-3 text-center leading-relaxed">
        <Info className="w-2.5 h-2.5 inline-block mr-0.5 -mt-px" strokeWidth={1.5} />
        We may earn a commission at no extra cost to you. Our ratings are independent.
      </p>
    </motion.div>
  );
}

// Toast notification
function AffiliateToast({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-xl px-5 py-3 shadow-2xl border border-emerald-500/20"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">
                Thanks for checking it out!
              </p>
              <p className="text-[11px] text-slate-500">
                Want to explore neighborhoods or run some numbers?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Link
              href="/neighborhoods"
              className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Neighborhoods →
            </Link>
            <span className="text-slate-600">·</span>
            <Link
              href="/tools"
              className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Tools →
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ResourcesContent() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") || "property-management") as CategoryId;
  const [activeCategory, setActiveCategory] = useState<CategoryId>(
    CATEGORY_IDS.includes(initialCategory) ? initialCategory : "property-management"
  );
  const [showToast, setShowToast] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const { ref: heroRef, inView: heroInView } = useInView(0.1);

  const activeSection = RESOURCE_CATEGORIES.find((c) => c.id === activeCategory)!;

  const triggerToast = useCallback(() => {
    setToastKey((k) => k + 1);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  }, []);

  return (
    <>
      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="relative pt-24 pb-10 sm:pt-32 sm:pb-16 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-emerald-500/3 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-cyan-400/3 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-emerald-500/2 to-cyan-400/2 rounded-full blur-3xl" />
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
            <span className="text-emerald-400 font-medium">Resources</span>
          </motion.nav>

          {/* Badge */}
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/10 bg-cyan-400/5 text-xs font-medium text-cyan-400 mb-5"
            initial={{ opacity: 0, y: 10 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <BookOpen className="w-3 h-3" />
            CURATED RECOMMENDATIONS
          </motion.span>

          {/* Title */}
          <motion.h1
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-4 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            Resources &{" "}
            <span className="text-gradient">Recommended Tools</span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed mb-3"
            initial={{ opacity: 0, y: 15 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            Curated & honest recommendations for Asheville real estate — from property
            management software to moving services. Every tool we recommend has been
            evaluated for value, usability, and relevance.
          </motion.p>

          <motion.div
            className="flex items-center gap-2 text-xs text-slate-500"
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <Info className="w-3 h-3 text-amber-400" strokeWidth={1.5} />
            <span>
              We may earn affiliate commissions. All ratings are independent and honest.
            </span>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent pointer-events-none" />
      </section>

      {/* ============================================ */}
      {/* CATEGORY TAB NAVIGATION */}
      {/* ============================================ */}
      <section className="relative pb-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Desktop tabs */}
          <motion.div
            className="hidden sm:flex items-center justify-center gap-2 mb-8"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {RESOURCE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-medium transition-all ${
                    isActive
                      ? "glass-strong text-gray-900 dark:text-white shadow-lg"
                      : "glass text-slate-500 hover:text-slate-300"
                  }`}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isActive
                        ? cat.color === "emerald"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : cat.color === "cyan"
                          ? "bg-cyan-400/10 text-cyan-400"
                          : "bg-amber-500/10 text-amber-400"
                        : "bg-white/5 text-slate-500"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </div>
                  <span className="whitespace-nowrap">{cat.title}</span>
                  {isActive && (
                    <motion.div
                      layoutId="resource-tab-active"
                      className="absolute -bottom-px left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Mobile scrollable tabs */}
          <div className="sm:hidden overflow-x-auto scrollbar-none -mx-4 px-4 mb-8">
            <div className="flex gap-2 min-w-max">
              {RESOURCE_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <motion.button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? "glass-strong text-gray-900 dark:text-white shadow-lg"
                        : "glass text-slate-500 hover:text-slate-300"
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {cat.title}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* ACTIVE CATEGORY CONTENT */}
      {/* ============================================ */}
      <AnimatePresence mode="wait">
        <motion.section
          key={activeCategory}
          className="relative py-4 sm:py-10 px-4 sm:px-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-10">
              <motion.h2
                className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <span className="text-gradient">{activeSection.title}</span>
              </motion.h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                {activeSection.description}
              </p>
            </div>

            {/* Comparison overview for property management */}
            {activeCategory === "property-management" && (
              <motion.div
                className="glass-strong rounded-2xl p-5 sm:p-8 mb-10 overflow-x-auto"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-5">
                  Quick Comparison
                </h3>
                <div className="min-w-[600px]">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--color-glass-border)]">
                        <th className="text-left py-3 pr-4 font-medium text-slate-500">Tool</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-500">Best For</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-500">Pricing</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-500">Rating</th>
                        <th className="text-right py-3 pl-3 font-medium text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeSection.items.map((item) => (
                        <tr
                          key={item.name}
                          className="border-b border-[var(--color-glass-border)]/50 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3 pr-4">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {item.name}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500">{item.tagline}</td>
                          <td className="py-3 px-3 text-slate-500">{item.pricing}</td>
                          <td className="py-3 px-3">
                            <StarRating rating={item.rating} size={11} />
                          </td>
                          <td className="py-3 pl-3 text-right">
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium cursor-pointer hover:text-emerald-300 transition-colors">
                              Visit
                              <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Affiliate cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {activeSection.items.map((item, i) => (
                <AffiliateCard key={item.name} item={item} index={i} />
              ))}
            </div>

            {/* Empty state */}
            {activeSection.items.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/5 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-slate-400" strokeWidth={1.5} />
                </div>
                <p className="text-slate-500 text-sm">More recommendations coming soon.</p>
              </div>
            )}
          </div>
        </motion.section>
      </AnimatePresence>

      {/* ============================================ */}
      {/* TRUST SIGNALS */}
      {/* ============================================ */}
      <section className="relative py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="glass rounded-2xl p-6 sm:p-10 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-px rounded-full bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent group-hover:w-full transition-all duration-500" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
                </div>
                <span className="font-display text-lg font-semibold text-gray-900 dark:text-white">
                  Independently Rated
                </span>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
                  We test and evaluate every tool before recommending it. Our ratings reflect real experience.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-cyan-400" strokeWidth={1.5} />
                </div>
                <span className="font-display text-lg font-semibold text-gray-900 dark:text-white">
                  User-First
                </span>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
                  We prioritize tools that deliver genuine value. Affiliate commissions never influence our rankings.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
                </div>
                <span className="font-display text-lg font-semibold text-gray-900 dark:text-white">
                  FTC Compliant
                </span>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
                  All affiliate relationships are clearly disclosed. Transparency is non-negotiable.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* BOTTOM NAVIGATION */}
      {/* ============================================ */}
      <section className="relative py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/str-insights"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-400 transition-colors group"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
              STR Insights
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/neighborhoods"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-hover text-sm font-medium text-gray-900 dark:text-white border border-[var(--color-glass-border)] group"
              >
                <Building2 className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                Neighborhoods
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </Link>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-hover text-sm font-medium text-gray-900 dark:text-white border border-[var(--color-glass-border)] group"
              >
                <Wrench className="w-4 h-4 text-cyan-400" strokeWidth={1.5} />
                Tools & Calculators
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Toast */}
      <AffiliateToast show={showToast} key={toastKey} />
    </>
  );
}

export default function ResourcesClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      }
    >
      <ResourcesContent />
    </Suspense>
  );
}
