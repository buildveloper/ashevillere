"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  Building2,
  GraduationCap,
  DollarSign,
  Mountain,
  FileCheck,
  Truck,
  Wifi,
  Heart,
  Download,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useInView } from "@/hooks/use-animations";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ChecklistCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  items: ChecklistItem[];
}

const DEFAULT_CHECKLIST: ChecklistCategory[] = [
  {
    id: "housing",
    title: "Housing & Neighborhood",
    icon: Building2,
    items: [
      { id: "h1", text: "Research neighborhoods (use the Neighborhoods Guide)", completed: false },
      { id: "h2", text: "Get pre-approved for a mortgage", completed: false },
      { id: "h3", text: "Use the Home Value Estimator for target homes", completed: false },
      { id: "h4", text: "Hire a local Asheville real estate agent", completed: false },
      { id: "h5", text: "Attend open houses in your top 3 neighborhoods", completed: false },
      { id: "h6", text: "Review HOA fees and flood zone maps", completed: false },
      { id: "h7", text: "Get a home inspection (mold + radon included)", completed: false },
    ],
  },
  {
    id: "finances",
    title: "Cost of Living & Budget",
    icon: DollarSign,
    items: [
      { id: "f1", text: "Estimate monthly mortgage with the Calculator", completed: false },
      { id: "f2", text: "Budget for NC property taxes (∼0.77%)", completed: false },
      { id: "f3", text: "Factor in homeowners insurance (mountain region rates)", completed: false },
      { id: "f4", text: "Plan for utilities (Duke Energy + water/sewer)", completed: false },
      { id: "f5", text: "Research moving costs to Asheville", completed: false },
      { id: "f6", text: "Set up emergency fund for mountain home maintenance", completed: false },
    ],
  },
  {
    id: "schools",
    title: "Schools & Education",
    icon: GraduationCap,
    items: [
      { id: "s1", text: "Review school ratings in target neighborhoods", completed: false },
      { id: "s2", text: "Explore charter and private school options", completed: false },
      { id: "s3", text: "Contact Buncombe County Schools enrollment office", completed: false },
      { id: "s4", text: "Research UNCA continuing education if applicable", completed: false },
    ],
  },
  {
    id: "mountain",
    title: "Mountain Living Prep",
    icon: Mountain,
    items: [
      { id: "m1", text: "Understand winter weather driving (snow + ice on grades)", completed: false },
      { id: "m2", text: "Check for steep driveway access and maintenance", completed: false },
      { id: "m3", text: "Learn about well water systems if applicable", completed: false },
      { id: "m4", text: "Research septic system maintenance", completed: false },
      { id: "m5", text: "Get familiar with bear country precautions", completed: false },
      { id: "m6", text: "Identify nearest hospital and emergency services", completed: false },
    ],
  },
  {
    id: "permits",
    title: "Permits & Logistics",
    icon: FileCheck,
    items: [
      { id: "p1", text: "Update driver's license and vehicle registration (NC DMV)", completed: false },
      { id: "p2", text: "Register to vote in Buncombe County", completed: false },
      { id: "p3", text: "Set up Duke Energy + City of Asheville water account", completed: false },
      { id: "p4", text: "Research home-based business permits if needed", completed: false },
      { id: "p5", text: "Understand short-term rental regulations (if applicable)", completed: false },
    ],
  },
  {
    id: "lifestyle",
    title: "Lifestyle & Community",
    icon: Heart,
    items: [
      { id: "l1", text: "Find local grocery co-ops and farmers markets", completed: false },
      { id: "l2", text: "Explore hiking trails and outdoor recreation", completed: false },
      { id: "l3", text: "Join local Facebook groups or Nextdoor", completed: false },
      { id: "l4", text: "Find healthcare providers accepting new patients", completed: false },
      { id: "l5", text: "Discover breweries, art studios, and music venues", completed: false },
      { id: "l6", text: "Introduce yourself to your new neighbors!", completed: false },
    ],
  },
];

const STORAGE_KEY = "avre_relocation_checklist";

export function RelocationChecklist() {
  const [categories, setCategories] = useState<ChecklistCategory[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { ref, inView } = useInView(0.05);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCategories(JSON.parse(saved));
      } else {
        setCategories(DEFAULT_CHECKLIST);
      }
    } catch {
      setCategories(DEFAULT_CHECKLIST);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded && categories.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    }
  }, [categories, loaded]);

  const toggleItem = useCallback((catId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              ),
            }
          : cat
      )
    );
  }, []);

  const totalItems = categories.reduce((acc, c) => acc + c.items.length, 0);
  const completedItems = categories.reduce(
    (acc, c) => acc + c.items.filter((i) => i.completed).length,
    0
  );
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleReset = () => {
    setCategories(DEFAULT_CHECKLIST);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleGeneratePDF = () => {
    // Simulated PDF generation
    const btn = document.activeElement as HTMLButtonElement;
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = "Generating...";
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 2000);
    }
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div ref={ref} className="space-y-8">
      {/* Progress header */}
      <motion.div
        className="glass rounded-2xl p-6 sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
              Relocation Progress
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {completedItems} of {totalItems} tasks completed
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-3xl font-bold text-gradient tabular-nums">
              {progressPct}%
            </span>
            <div className="flex gap-2">
              <motion.button
                onClick={handleGeneratePDF}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass-hover text-xs font-medium text-emerald-400 border border-emerald-500/10"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                PDF Report
              </motion.button>
              <motion.button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-2 rounded-xl glass-hover text-xs font-medium text-slate-500"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {progressPct === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 text-sm text-emerald-400"
          >
            <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
            All tasks completed — you&apos;re ready for Asheville!
          </motion.div>
        )}
      </motion.div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {categories.map((cat, catIdx) => {
          const catCompleted = cat.items.filter((i) => i.completed).length;
          const catTotal = cat.items.length;
          const Icon = cat.icon;

          return (
            <motion.div
              key={cat.id}
              className="glass rounded-2xl p-5 sm:p-6 group"
              initial={{ opacity: 0, y: 25 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.45,
                delay: 0.05 + catIdx * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 text-emerald-400" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-display text-base font-semibold text-gray-900 dark:text-white">
                    {cat.title}
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    {catCompleted}/{catTotal} done
                  </span>
                </div>
              </div>

              <ul className="space-y-2">
                {cat.items.map((item) => (
                  <motion.li key={item.id} whileTap={{ scale: 0.98 }}>
                    <button
                      onClick={() => toggleItem(cat.id, item.id)}
                      className={`w-full flex items-start gap-3 text-left px-3 py-2.5 rounded-xl transition-all ${
                        item.completed
                          ? "bg-emerald-500/5 border border-emerald-500/10"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          item.completed
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {item.completed && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path
                              d="M1 4L3.5 6.5L9 1"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`text-xs leading-relaxed transition-all ${
                          item.completed
                            ? "text-slate-400 line-through"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {item.text}
                      </span>
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="text-center space-y-3">
        <Link
          href="/str-insights"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors group"
        >
          <BarChart3 className="w-3 h-3" strokeWidth={1.5} />
          Check STR potential & regulations before you buy
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
        </Link>
        <br />
        <Link
          href="/neighborhoods"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-400 transition-colors group"
        >
          Explore neighborhoods for your move
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}
