"use client";

import { motion } from "framer-motion";
import { Calculator, Home, ClipboardCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useInView } from "@/hooks/use-animations";

const TOOLS = [
  {
    id: "home-value",
    title: "Home Value Estimator",
    description: "Get an instant AI-powered estimate of any Asheville property's market value.",
    icon: Home,
    href: "/tools/home-value",
    color: "emerald",
  },
  {
    id: "mortgage",
    title: "Mortgage Calculator",
    description: "Calculate monthly payments, compare rates, and see what you can afford.",
    icon: Calculator,
    href: "/tools/mortgage",
    color: "cyan",
  },
  {
    id: "relocation",
    title: "Relocation Checklist",
    description: "A step-by-step guide for moving to Asheville — timeline, costs, and tips.",
    icon: ClipboardCheck,
    href: "/tools/relocation",
    color: "emerald",
  },
];

function ToolCard({
  tool,
  index,
}: {
  tool: (typeof TOOLS)[number];
  index: number;
}) {
  const { ref, inView } = useInView(0.15);
  const Icon = tool.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={tool.href} className="block h-full">
        <motion.div
          className="relative glass rounded-2xl p-6 sm:p-8 h-full group overflow-hidden"
          whileHover={{ y: -4, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
        >
          {/* Icon container */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300 ${
              tool.color === "emerald"
                ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20"
                : "bg-cyan-400/10 text-cyan-400 group-hover:bg-cyan-400/20"
            }`}
          >
            <Icon className="w-6 h-6" strokeWidth={1.5} />
          </div>

          {/* Content */}
          <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {tool.title}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            {tool.description}
          </p>

          {/* CTA */}
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 group-hover:gap-2.5 transition-all">
            Try it now
            <ArrowRight className="w-3.5 h-3.5" />
          </span>

          {/* Hover glow */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${
                tool.color === "emerald"
                  ? "rgba(16,185,129,0.06)"
                  : "rgba(34,211,238,0.06)"
              }, transparent 60%)`,
            }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}

export function ToolsPreview() {
  const { ref, inView } = useInView(0.1);

  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/10 bg-cyan-400/5 text-xs font-medium text-cyan-400 mb-4">
            <Calculator className="w-3 h-3" />
            POWERFUL TOOLS
          </motion.span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Smart Tools for <span className="text-gradient">Smart Decisions</span>
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base">
            Free calculators and guides to help you navigate the Asheville market with confidence.
          </p>
        </motion.div>

        {/* Tools grid */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TOOLS.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
