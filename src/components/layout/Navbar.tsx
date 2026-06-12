"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  Search,
  Menu,
  X,
  Home,
  TrendingUp,
  Building2,
  Wrench,
  BarChart3,
  BookOpen,
  Mail,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useSearch } from "@/components/search/GlobalSearch";
import { useIsMobile } from "@/hooks/use-media-query";

// Top-level nav links
const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/homes-for-sale", label: "Homes for Sale", icon: Home },
  { href: "/market-reports", label: "Market Reports", icon: TrendingUp },
  { href: "/neighborhoods", label: "Neighborhoods", icon: Building2 },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/talk-to-ai", label: "AI Assistant", icon: Sparkles },
  { href: "/submit-listing", label: "Submit Your Home", icon: Home },
];

// Dropdown links under "Tools"
const TOOLS_DROPDOWN = [
  { href: "/tools", label: "Calculators", icon: Wrench, desc: "Mortgage & home value" },
  { href: "/str-insights", label: "STR Insights", icon: BarChart3, desc: "Rental regulations & revenue" },
  { href: "/resources", label: "Resources", icon: BookOpen, desc: "Tools, services & guides" },
];

// Active check for tools dropdown
function isToolsActive(pathname: string): boolean {
  return pathname === "/tools" || pathname === "/str-insights" || pathname === "/resources";
}

// Stagger animation for nav links
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

// Magnetic hover effect for logo
function MagneticLogo() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });

  return (
    <Link href="/" className="block">
      <motion.div
        className="relative inline-block"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
      >
        <span className="text-xl font-bold tracking-tight">
          <span className="text-emerald-500">Asheville</span>
          <span className="text-cyan-400">RE</span>
        </span>
        <motion.div
          className="absolute -bottom-0.5 left-0 right-0 h-px rounded-full"
          style={{
            background: "linear-gradient(90deg, #10B981, #22D3EE)",
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.7 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>
    </Link>
  );
}

// Animated desktop nav link
function NavLink({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link href={href} className="relative group">
      <motion.span
        className={`relative px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "text-emerald-400"
            : "text-slate-400 hover:text-slate-200 dark:hover:text-slate-300 hover:text-slate-700"
        }`}
        whileHover={{ y: -1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {label}
        {isActive && (
          <motion.div
            layoutId="nav-active"
            className="absolute -bottom-0.5 left-1.5 right-1.5 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <motion.div
          className={`absolute -bottom-0.5 left-1.5 right-1.5 h-0.5 rounded-full bg-gradient-to-r from-emerald-500/40 to-cyan-400/40 ${
            isActive ? "opacity-0" : "opacity-0 group-hover:opacity-100"
          }`}
          initial={false}
          transition={{ duration: 0.2 }}
        />
      </motion.span>
    </Link>
  );
}

// Tools dropdown for desktop
function ToolsDropdown() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = isToolsActive(pathname);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger */}
      <motion.button
        className={`relative flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
          active
            ? "text-emerald-400"
            : "text-slate-400 hover:text-slate-200 dark:hover:text-slate-300"
        }`}
        whileHover={{ y: -1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={() => setOpen(!open)}
      >
        Tools
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />
        </motion.span>
        {active && (
          <motion.div
            layoutId="nav-active"
            className="absolute -bottom-0.5 left-1.5 right-1.5 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 mt-2 w-64 glass-strong rounded-xl overflow-hidden border border-[var(--color-glass-border)] shadow-xl shadow-black/10 origin-top"
          >
            <div className="p-2 space-y-0.5">
              {TOOLS_DROPDOWN.map((item) => {
                const Icon = item.icon;
                const isItemActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isItemActive
                        ? "bg-emerald-500/10"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        isItemActive ? "text-emerald-400" : "text-slate-500"
                      }`}
                      strokeWidth={1.5}
                    />
                    <div>
                      <p className={`text-sm font-medium ${
                        isItemActive ? "text-emerald-400" : "text-gray-900 dark:text-white"
                      }`}>
                        {item.label}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Search trigger button
function SearchTrigger() {
  const { openSearch } = useSearch();

  return (
    <motion.button
      className="relative w-9 h-9 rounded-full flex items-center justify-center glass-hover text-slate-400 hover:text-slate-200 dark:hover:text-white transition-colors"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label="Open search"
      onClick={() => openSearch()}
    >
      <Search className="w-4 h-4" strokeWidth={1.5} />
    </motion.button>
  );
}

// Mobile menu
function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const toolsActive = isToolsActive(pathname);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 80 || info.velocity.x > 300) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-72 glass-strong border-l border-[var(--color-glass-border)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag={isMobile ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {isMobile && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 rounded-r-full bg-emerald-500/20 pointer-events-none" />
            )}

            <div className="flex items-center justify-between p-4 border-b border-[var(--color-glass-border)]">
              <span className="text-lg font-bold">
                <span className="text-emerald-500">Asheville</span>
                <span className="text-cyan-400">RE</span>
              </span>
              <motion.button
                onClick={onClose}
                className="w-11 h-11 rounded-full flex items-center justify-center glass-hover text-slate-400"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </motion.button>
            </div>

            <div className="px-4 pt-5 pb-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Navigate
              </span>
            </div>

            <nav className="px-3 space-y-0.5 overflow-y-auto flex-1">
              {NAV_LINKS.map((link, i) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all relative min-h-[44px] ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "text-slate-400 hover:text-slate-200 dark:hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="mobile-nav-active"
                          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b from-emerald-500 to-cyan-400"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Tools accordion */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.04 }}
              >
                <button
                  onClick={() => setToolsExpanded(!toolsExpanded)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                    toolsActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-slate-400 hover:text-slate-200 dark:hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Wrench className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                    Tools
                  </span>
                  <motion.span
                    animate={{ rotate: toolsExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {toolsExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden ml-4 mt-0.5 space-y-0.5 border-l border-[var(--color-glass-border)]"
                    >
                      {TOOLS_DROPDOWN.map((item) => {
                        const Icon = item.icon;
                        const isItemActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                              isItemActive
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "text-slate-400 hover:text-slate-200 dark:hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                            {item.label}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </nav>

            <div className="mt-auto px-4 pb-8">
              <div className="border-t border-[var(--color-glass-border)] pt-4">
                <a
                  href="mailto:chris@ashevillere.com"
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-all min-h-[44px]"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                  Contact
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass-strong shadow-lg shadow-black/5"
            : "glass"
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <MagneticLogo />

            {/* Desktop Navigation */}
            <motion.nav
              className="hidden lg:flex items-center gap-1"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {NAV_LINKS.map((link) => (
                <motion.div key={link.href} variants={itemVariants}>
                  <NavLink
                    href={link.href}
                    label={link.label}
                    isActive={pathname === link.href}
                  />
                </motion.div>
              ))}
              {/* Tools dropdown */}
              <motion.div variants={itemVariants}>
                <ToolsDropdown />
              </motion.div>
            </motion.nav>

            <div className="flex items-center gap-2">
              <SearchTrigger />
              <ThemeToggle />
              <motion.button
                className="lg:hidden w-11 h-11 rounded-full flex items-center justify-center glass-hover text-slate-400"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-4 h-4" strokeWidth={1.5} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}