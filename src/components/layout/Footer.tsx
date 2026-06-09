"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Mail, ArrowUpRight } from "lucide-react";

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
        className="group inline-flex items-center gap-1 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <span>{label}</span>
        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
      </Link>
    </motion.li>
  );
}

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="relative border-t border-[var(--color-glass-border)]">
      {/* Subtle top gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Top section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Brand column */}
          <motion.div
            className="col-span-2 md:col-span-1"
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
            }}
          >
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-bold tracking-tight">
                <span className="text-emerald-500">Asheville</span>
                <span className="text-cyan-400">RE</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Premium real estate intelligence for Asheville, NC. Market data, neighborhood guides,
              and tools for informed decisions.
            </p>
            <div className="flex flex-col gap-2 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
                Asheville, North Carolina
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
                hello@ashevillere.com
              </span>
            </div>
          </motion.div>

          {/* Link columns */}
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

        {/* Bottom bar */}
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
  );
}
