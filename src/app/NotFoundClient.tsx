"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Home,
  Building2,
  Wrench,
  BookOpen,
  Search,
  MapPin,
  AlertCircle,
  Compass,
} from "lucide-react";
import { useSearch } from "@/components/search/GlobalSearch";

const QUICK_LINKS = [
  { href: "/", label: "Home", icon: Home, description: "Start from the homepage" },
  {
    href: "/neighborhoods",
    label: "Neighborhoods",
    icon: Building2,
    description: "Explore Asheville neighborhoods",
  },
  { href: "/tools", label: "Tools", icon: Wrench, description: "Calculators & estimators" },
  { href: "/blog", label: "Blog", icon: BookOpen, description: "Latest insights & guides" },
  {
    href: "/market-reports",
    label: "Market Reports",
    icon: Compass,
    description: "Current market data",
  },
];

function SearchTrigger() {
  const { openSearch } = useSearch();

  return (
    <button
      onClick={() => openSearch()}
      className="w-full max-w-md mx-auto glass-hover glass rounded-xl flex items-center gap-3 px-4 py-3.5 text-left group cursor-pointer transition-all duration-200 hover:border-emerald-500/30"
    >
      <Search className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors flex-shrink-0" strokeWidth={1.5} />
      <span className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors flex-1">
        Search for neighborhoods, tools, articles...
      </span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-glass-border)] text-xs text-slate-500 font-mono">
        <span className="text-[10px]">⌘</span>K
      </kbd>
    </button>
  );
}

export function NotFoundClient() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center relative overflow-hidden px-4 py-16">
      {/* Background ambient elements */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/[0.02] to-cyan-500/[0.02] rounded-full blur-3xl" />

      <div className="relative max-w-2xl w-full mx-auto text-center">
        {/* 404 illustration */}
        <motion.div
          className="relative mb-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Large 404 */}
          <h1
            className="font-display text-[8rem] sm:text-[10rem] lg:text-[12rem] font-bold leading-none select-none"
            style={{
              background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-cyan) 50%, var(--color-accent) 100%)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 3s ease-in-out infinite",
            }}
          >
            404
          </h1>

          {/* Floating compass icon */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{
              rotate: [0, 8, -8, 0],
              y: [0, -6, 6, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full glass-strong flex items-center justify-center">
              <MapPin className="w-7 h-7 sm:w-9 sm:h-9 text-emerald-400" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* Orbit ring */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-emerald-500/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-[var(--color-text-primary)] mb-3">
            Page not found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-8">
            The page you&apos;re looking for has moved or doesn&apos;t exist. It might
            have been removed, renamed, or the URL might be mistyped.
          </p>
        </motion.div>

        {/* Global Search Bar */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <SearchTrigger />
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
            Quick Links
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
            {QUICK_LINKS.map((link, i) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    className="group flex flex-col items-center gap-2 p-4 rounded-xl glass hover:border-emerald-500/20 transition-all duration-200 text-center"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                      <Icon
                        className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors"
                        strokeWidth={1.5}
                      />
                    </div>
                    <span className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-emerald-400 transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Report broken link */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <a
            href="mailto:chris@ashevillere.com?subject=Broken%20Link%20Report&body=I%20encountered%20a%20broken%20link%20while%20trying%20to%20reach%3A%20%0A%0A%5BPlease%20describe%20the%20page%20you%20were%20trying%20to%20reach%5D"
            className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-emerald-400 transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
            Report a broken link
          </a>
        </motion.div>
      </div>
    </div>
  );
}
