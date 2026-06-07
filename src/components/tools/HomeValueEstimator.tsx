"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, TrendingUp, Star, Save, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCountUp } from "@/hooks/use-animations";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";

const CONDITIONS = ["Excellent", "Good", "Average", "Needs Work", "Fixer"] as const;
type Condition = (typeof CONDITIONS)[number];

interface EstimateResult {
  low: number;
  mid: number;
  high: number;
  confidence: number;
  neighborhoodAvg: number;
}

interface SavedEstimate {
  address: string;
  neighborhood: string;
  sqft: number;
  beds: number;
  baths: number;
  year: number;
  condition: Condition;
  result: EstimateResult;
  date: string;
}

function calculateEstimate(
  neighborhoodId: string,
  sqft: number,
  condition: Condition
): EstimateResult {
  const hood = NEIGHBORHOODS.find((n) => n.id === neighborhoodId);
  const basePricePerSqft = hood ? hood.stats.pricePerSqft : 312;

  const conditionMultiplier: Record<Condition, number> = {
    Excellent: 1.12,
    Good: 1.0,
    Average: 0.88,
    "Needs Work": 0.72,
    Fixer: 0.55,
  };

  const adjustedPricePerSqft = basePricePerSqft * conditionMultiplier[condition];
  const mid = Math.round(adjustedPricePerSqft * sqft);
  const variance = mid * 0.08;
  const confidence = Math.round(75 + Math.random() * 15);

  return {
    low: Math.round(mid - variance),
    mid,
    high: Math.round(mid + variance),
    confidence,
    neighborhoodAvg: hood ? hood.stats.medianPrice : 525000,
  };
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  return `$${(n / 1000).toFixed(0)}K`;
}

function SavedEstimatesList({
  estimates,
  onClear,
}: {
  estimates: SavedEstimate[];
  onClear: () => void;
}) {
  if (estimates.length === 0) return null;

  return (
    <div className="mt-8">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
        Saved Estimates
      </h4>
      <div className="space-y-2">
        {estimates.map((est, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between glass rounded-xl px-4 py-3 text-sm"
          >
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                {est.address || est.neighborhood}
              </span>
              <span className="text-slate-500 ml-2 text-xs">{est.date}</span>
            </div>
            <span className="font-semibold text-emerald-400 tabular-nums">
              {formatCurrency(est.result.mid)}
            </span>
          </motion.div>
        ))}
      </div>
      <button
        onClick={onClear}
        className="mt-3 text-xs text-slate-500 hover:text-red-400 transition-colors"
      >
        Clear all saved
      </button>
    </div>
  );
}

export function HomeValueEstimator() {
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [sqft, setSqft] = useState(1800);
  const [beds, setBeds] = useState(3);
  const [baths, setBaths] = useState(2);
  const [year, setYear] = useState(2010);
  const [condition, setCondition] = useState<Condition>("Good");
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [savedEstimates, setSavedEstimates] = useState<SavedEstimate[]>([]);

  const countLow = useCountUp(result?.low ?? 0, 1800, showResult);
  const countMid = useCountUp(result?.mid ?? 0, 1800, showResult);
  const countHigh = useCountUp(result?.high ?? 0, 1800, showResult);
  const countConfidence = useCountUp(result?.confidence ?? 0, 1500, showResult);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("avre_saved_estimates");
      if (saved) setSavedEstimates(JSON.parse(saved));
    } catch {}
  }, []);

  const handleEstimate = () => {
    if (!neighborhood) return;
    const r = calculateEstimate(neighborhood, sqft, condition);
    setResult(r);
    setShowResult(true);
  };

  const handleSave = () => {
    if (!result || !neighborhood) return;
    const hood = NEIGHBORHOODS.find((n) => n.id === neighborhood);
    const saved: SavedEstimate = {
      address,
      neighborhood: hood?.name ?? neighborhood,
      sqft,
      beds,
      baths,
      year,
      condition,
      result,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
    const updated = [saved, ...savedEstimates].slice(0, 10);
    setSavedEstimates(updated);
    localStorage.setItem("avre_saved_estimates", JSON.stringify(updated));
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <motion.div
          className="lg:col-span-3 glass rounded-2xl p-6 sm:p-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Property Address (optional)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Mountain View Dr, Asheville NC"
                className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Neighborhood
              </label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              >
                <option value="" className="bg-gray-900 text-white">
                  Select neighborhood
                </option>
                {NEIGHBORHOODS.map((n) => (
                  <option key={n.id} value={n.id} className="bg-gray-900 text-white">
                    {n.name} — {formatCurrency(n.stats.medianPrice)} median
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Square Feet
              </label>
              <input
                type="number"
                value={sqft}
                onChange={(e) => setSqft(Number(e.target.value))}
                min={400}
                max={20000}
                className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Bedrooms
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setBeds(n)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      beds === n
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "text-slate-500 border border-[var(--color-glass-border)] hover:border-emerald-500/20"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Bathrooms
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setBaths(n)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      baths === n
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "text-slate-500 border border-[var(--color-glass-border)] hover:border-emerald-500/20"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Year Built
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1900}
                max={2026}
                className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Condition
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CONDITIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCondition(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      condition === c
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "text-slate-500 border border-[var(--color-glass-border)] hover:border-emerald-500/20"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.button
            onClick={handleEstimate}
            disabled={!neighborhood}
            className={`mt-6 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all ${
              neighborhood
                ? "bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 shadow-lg shadow-emerald-500/20"
                : "bg-slate-600 cursor-not-allowed"
            }`}
            whileHover={neighborhood ? { scale: 1.01 } : {}}
            whileTap={neighborhood ? { scale: 0.99 } : {}}
          >
            Calculate Estimate
          </motion.button>
        </motion.div>

        {/* Result panel */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {showResult && result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="glass rounded-2xl p-6 sm:p-8 h-full"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Home className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white">
                      Your Estimate
                    </h3>
                    <p className="text-xs text-slate-500">AI-powered valuation</p>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="text-xs text-slate-500 mb-1">Estimated Value</p>
                  <p className="font-display text-4xl sm:text-5xl font-bold text-gradient tabular-nums">
                    {formatCurrency(countMid)}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Low estimate</span>
                    <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                      {formatCurrency(countLow)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">High estimate</span>
                    <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                      {formatCurrency(countHigh)}
                    </span>
                  </div>
                </div>

                {/* Confidence meter */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-500">Confidence</span>
                    <span className="text-emerald-400 font-semibold tabular-nums">
                      {countConfidence}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>

                <motion.button
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl glass-hover text-sm font-medium text-emerald-400 border border-emerald-500/10"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save className="w-4 h-4" strokeWidth={1.5} />
                  Save Estimate
                </motion.button>

                <div className="mt-4 text-center">
                  <Link
                    href={`/neighborhoods/${neighborhood}`}
                    className="text-xs text-slate-500 hover:text-emerald-400 transition-colors inline-flex items-center gap-1 group"
                  >
                    View {NEIGHBORHOODS.find((n) => n.id === neighborhood)?.name} guide
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl p-6 sm:p-8 h-full flex flex-col items-center justify-center text-center"
              >
                <TrendingUp className="w-12 h-12 text-slate-600 mb-4" strokeWidth={1} />
                <p className="text-sm text-slate-500 leading-relaxed">
                  Fill out the form and select a neighborhood to get your estimated home value.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <SavedEstimatesList
        estimates={savedEstimates}
        onClear={() => {
          setSavedEstimates([]);
          localStorage.removeItem("avre_saved_estimates");
        }}
      />
    </div>
  );
}
