"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, DollarSign, Percent, Clock, PiggyBank, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCountUp } from "@/hooks/use-animations";

interface AmortizationYear {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

function calculateMortgage(
  price: number,
  downPct: number,
  rate: number,
  termYears: number
) {
  const downPayment = (price * downPct) / 100;
  const loanAmount = price - downPayment;
  const monthlyRate = rate / 100 / 12;
  const numPayments = termYears * 12;

  let monthlyPayment = 0;
  if (monthlyRate > 0) {
    monthlyPayment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
  } else {
    monthlyPayment = loanAmount / numPayments;
  }

  let totalInterest = 0;
  let balance = loanAmount;
  const schedule: AmortizationYear[] = [];

  for (let y = 1; y <= termYears; y++) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    for (let m = 1; m <= 12; m++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      yearPrincipal += principalPayment;
      yearInterest += interestPayment;
      balance -= principalPayment;
      if (balance < 0) balance = 0;
    }
    totalInterest += yearInterest;
    schedule.push({
      year: y,
      principalPaid: Math.round(yearPrincipal),
      interestPaid: Math.round(yearInterest),
      balance: Math.round(balance),
    });
    if (balance <= 0) break;
  }

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalInterest: Math.round(totalInterest),
    totalCost: price + Math.round(totalInterest),
    downPayment: Math.round(downPayment),
    loanAmount: Math.round(loanAmount),
    schedule,
  };
}

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function MortgageCalculator() {
  const [price, setPrice] = useState(450000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [termYears, setTermYears] = useState(30);
  const [showDetails, setShowDetails] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(true);

  const result = calculateMortgage(price, downPct, rate, termYears);
  const animatedPayment = useCountUp(result.monthlyPayment, 1500, true);
  const animatedInterest = useCountUp(result.totalInterest, 1800, hasCalculated);

  const termOptions = [15, 20, 30];
  const downOptions = [5, 10, 15, 20, 25, 30, 35, 40];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Inputs */}
        <motion.div
          className="lg:col-span-3 glass rounded-2xl p-6 sm:p-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="space-y-5">
            {/* Price */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <DollarSign className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Home Price
                </label>
                <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                  {formatCurrency(price)}
                </span>
              </div>
              <input
                type="range"
                min={100000}
                max={2000000}
                step={10000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r
                  [&::-webkit-slider-thumb]:from-emerald-500 [&::-webkit-slider-thumb]:to-cyan-500
                  [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>$100K</span>
                <span>$2M</span>
              </div>
            </div>

            {/* Down payment */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                <Percent className="w-3.5 h-3.5" strokeWidth={1.5} />
                Down Payment — {downPct}% ({formatCurrency(result.downPayment)})
              </label>
              <div className="flex gap-2">
                {downOptions.map((p) => (
                  <button
                    key={p}
                    onClick={() => setDownPct(p)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      downPct === p
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "text-slate-500 border border-[var(--color-glass-border)] hover:border-emerald-500/20"
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>

            {/* Interest rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <TrendingUpIcon />
                  Interest Rate
                </label>
                <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                  {rate}%
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={12}
                step={0.125}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r
                  [&::-webkit-slider-thumb]:from-cyan-500 [&::-webkit-slider-thumb]:to-emerald-500
                  [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>2%</span>
                <span>12%</span>
              </div>
            </div>

            {/* Term */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                Loan Term
              </label>
              <div className="flex gap-2">
                {termOptions.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTermYears(t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      termYears === t
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "text-slate-500 border border-[var(--color-glass-border)] hover:border-emerald-500/20"
                    }`}
                  >
                    {t} yr
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          className="lg:col-span-2 glass rounded-2xl p-6 sm:p-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white">
                Breakdown
              </h3>
              <p className="text-xs text-slate-500">Monthly & total costs</p>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-xs text-slate-500 mb-1">Monthly Payment</p>
            <p className="font-display text-4xl sm:text-5xl font-bold text-gradient tabular-nums">
              {formatCurrency(animatedPayment)}
              <span className="text-lg font-normal text-slate-400">/mo</span>
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-[var(--color-glass-border)]">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                <span className="text-xs text-slate-500">Loan Amount</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                {formatCurrency(result.loanAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[var(--color-glass-border)]">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                <span className="text-xs text-slate-500">Down Payment</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                {formatCurrency(result.downPayment)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[var(--color-glass-border)]">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                <span className="text-xs text-slate-500">Total Interest</span>
              </div>
              <span className="text-sm font-semibold text-red-400 tabular-nums">
                {formatCurrency(animatedInterest)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Total Cost
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                {formatCurrency(result.totalCost)}
              </span>
            </div>
          </div>

          <motion.button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-6 w-full py-2.5 rounded-xl glass-hover text-sm font-medium text-cyan-400 border border-cyan-400/10"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showDetails ? "Hide" : "Show"} Amortization Schedule
          </motion.button>
        </motion.div>
      </div>

      {/* Amortization */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="glass rounded-2xl p-6 sm:p-8">
              <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Amortization Schedule
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-[var(--color-glass-border)]">
                      <th className="text-left py-2 pr-4">Year</th>
                      <th className="text-right py-2 px-2">Principal Paid</th>
                      <th className="text-right py-2 px-2">Interest Paid</th>
                      <th className="text-right py-2 pl-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map((row, i) => (
                      <motion.tr
                        key={row.year}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-[var(--color-glass-border)] text-xs"
                      >
                        <td className="py-2 pr-4 font-medium text-gray-900 dark:text-white">
                          {row.year}
                        </td>
                        <td className="py-2 px-2 text-right text-emerald-400 tabular-nums">
                          {formatCurrency(row.principalPaid)}
                        </td>
                        <td className="py-2 px-2 text-right text-red-400 tabular-nums">
                          {formatCurrency(row.interestPaid)}
                        </td>
                        <td className="py-2 pl-2 text-right text-slate-500 tabular-nums">
                          {formatCurrency(row.balance)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center">
        <Link
          href="/market-reports"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-400 transition-colors group"
        >
          See current rates and market trends
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}

function TrendingUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
