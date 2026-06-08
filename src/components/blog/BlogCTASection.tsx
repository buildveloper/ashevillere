"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Building2, Wrench, BarChart3, ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/use-animations";

const CTAS = [
  {
    title: "Explore Neighborhoods",
    description: "Compare all 8 Asheville neighborhoods by price, vibe, schools, and walkability.",
    icon: Building2,
    href: "/neighborhoods",
    color: "emerald",
  },
  {
    title: "Smart Tools",
    description: "Home value estimator, mortgage calculator, and relocation checklist — free to use.",
    icon: Wrench,
    href: "/tools",
    color: "cyan",
  },
  {
    title: "STR Insights",
    description: "Understand short-term rental regulations, revenue potential, and investment strategy.",
    icon: BarChart3,
    href: "/str-insights",
    color: "pink",
  },
];

export function BlogCTASection() {
  const { ref, inView } = useInView(0.1);

  return (
    <section className="py-16 border-t border-[var(--color-glass-border)]">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
          Explore <span className="text-gradient">AshevilleRE</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {CTAS.map((cta, i) => {
          const Icon = cta.icon;
          const colorClasses =
            cta.color === "emerald"
              ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20"
              : cta.color === "cyan"
              ? "bg-cyan-400/10 text-cyan-400 group-hover:bg-cyan-400/20"
              : "bg-pink-500/10 text-pink-400 group-hover:bg-pink-500/20";

          return (
            <motion.div
              key={cta.href}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={cta.href} className="block h-full group">
                <motion.div
                  className="relative glass rounded-2xl p-6 h-full"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${colorClasses}`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>

                  <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {cta.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {cta.description}
                  </p>

                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 group-hover:gap-2.5 transition-all">
                    {cta.title === "STR Insights" ? "View insights" : "Get started"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
