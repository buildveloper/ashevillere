"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Mail, ArrowUpRight, ChevronDown, ArrowUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-media-query";

const FOOTER_COLUMNS = [
  {
    title: "Navigate",
    links: [
      { href: "/", label: "Home" },
      { href: "/market-reports", label: "Market Reports" },
      { href: "/neighborhoods", label: "Neighborhoods" },
      { href: "/submit-listing", label: "Submit Your Home" },
    ],
  },
  {
    title: "Tools",
    links: [
      { href: "/tools", label: "Calculators" },
      { href: "/str-insights", label: "STR Insights" },
      { href: "/resources", label: "Resources" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/affiliate-disclosure", label: "Affiliate Disclosure" },
      { href: "/admin", label: "Admin" },
    ],
  },
];

const itemReveal = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <motion.li variants={itemReveal}>
      <Link
        href={href}
        className="group inline-flex items-center gap-1 text-sm text-slate-400 hover:text-emerald-400 transition-colors py-1.5"
      >
        <span>{label}</span>
        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
      </Link>
    </motion.li>
  );
}

function MobileFooterSection({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[var(--color-glass-border)] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-left min-h-[44px]"
      >
        <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          {title}
        </h4>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden space-y-1 pb-3"
          >
            {links.map((link) => (
              <FooterLink key={link.href} href={link.href} label={link.label} />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-20 right-6 z-40 w-11 h-11 rounded-full glass-strong flex items-center justify-center text-slate-400 hover:text-emerald-400 border border-[var(--color-glass-border)] shadow-lg lg:hidden"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" strokeWidth={1.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function Footer() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <BackToTop />
      <footer className="relative border-t border-[var(--color-glass-border)]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Branding - always visible */}
          <div className="mb-10">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-bold tracking-tight">
                <span className="text-emerald-500">Asheville</span>
                <span className="text-cyan-400">RE</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-4 max-w-md">
              Premium real estate intelligence for Asheville, NC. Market data, neighborhood guides,
              and tools for informed decisions.
            </p>
            <div className="flex flex-col gap-2 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" strokeWidth={1.5} />
                Asheville, North Carolina
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" strokeWidth={1.5} />
                <a href="mailto:chris@ashevillere.com" className="hover:text-emerald-400 transition-colors">chris@ashevillere.com</a>
              </span>
            </div>
          </div>

          {/* Mobile accordion sections */}
          {isMobile ? (
            <div className="space-y-0">
              {FOOTER_COLUMNS.map((col) => (
                <MobileFooterSection key={col.title} title={col.title} links={col.links} />
              ))}
            </div>
          ) : (
            /* Desktop grid */
            <motion.div
              className="grid grid-cols-3 gap-8"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.08 } },
              }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              {FOOTER_COLUMNS.map((col) => (
                <motion.div
                  key={col.title}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
                  }}
                >
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
                    {col.title}
                  </h4>
                  <motion.ul
                    className="space-y-3"
                    variants={{
                      hidden: {},
                      show: { transition: { staggerChildren: 0.04 } },
                    }}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                  >
                    {col.links.map((link) => (
                      <FooterLink key={link.href} href={link.href} label={link.label} />
                    ))}
                  </motion.ul>
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div
            className="mt-12 pt-6 border-t border-[var(--color-glass-border)] flex flex-col sm:flex-row items-center justify-between gap-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} AshevilleRE. All rights reserved.
            </p>
            <p className="text-xs text-slate-600">
              Data sourced from public records and MLS. Not financial advice.
            </p>
          </motion.div>
        </div>
      </footer>
    </>
  );
}
