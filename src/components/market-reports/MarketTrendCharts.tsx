"use client";

import { useState, useEffect, ComponentType } from "react";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-animations";
import { Activity, TrendingUp } from "lucide-react";

const PRICE_DATA = [
  { month: "Jan", price: 498000 },
  { month: "Feb", price: 505000 },
  { month: "Mar", price: 512000 },
  { month: "Apr", price: 508000 },
  { month: "May", price: 518000 },
  { month: "Jun", price: 525000 },
  { month: "Jul", price: 520000 },
  { month: "Aug", price: 532000 },
  { month: "Sep", price: 528000 },
  { month: "Oct", price: 540000 },
  { month: "Nov", price: 535000 },
  { month: "Dec", price: 548000 },
];

const INVENTORY_DATA = [
  { month: "Jan", inventory: 3.5, listings: 1340 },
  { month: "Feb", inventory: 3.3, listings: 1300 },
  { month: "Mar", inventory: 3.0, listings: 1280 },
  { month: "Apr", inventory: 2.9, listings: 1250 },
  { month: "May", inventory: 2.7, listings: 1220 },
  { month: "Jun", inventory: 2.8, listings: 1247 },
  { month: "Jul", inventory: 3.1, listings: 1290 },
  { month: "Aug", inventory: 3.0, listings: 1265 },
  { month: "Sep", inventory: 2.6, listings: 1200 },
  { month: "Oct", inventory: 2.5, listings: 1175 },
  { month: "Nov", inventory: 2.4, listings: 1140 },
  { month: "Dec", inventory: 2.3, listings: 1110 },
];

function CustomTooltip({
  active,
  payload,
  label,
  prefix = "",
  suffix = "",
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  prefix?: string;
  suffix?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-3 shadow-xl border border-[var(--color-glass-border)]">
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
          {prefix}
          {entry.value.toLocaleString()}
          {suffix}
        </p>
      ))}
    </div>
  );
}

function ChartLoader({ children }: { children: (components: Record<string, ComponentType<any>>) => React.ReactNode }) {
  const [components, setComponents] = useState<Record<string, ComponentType<any>> | null>(null);

  useEffect(() => {
    import("recharts").then((mod) => {
      setComponents({
        LineChart: mod.LineChart,
        Line: mod.Line,
        AreaChart: mod.AreaChart,
        Area: mod.Area,
        XAxis: mod.XAxis,
        YAxis: mod.YAxis,
        CartesianGrid: mod.CartesianGrid,
        Tooltip: mod.Tooltip,
        ResponsiveContainer: mod.ResponsiveContainer,
      });
    });
  }, []);

  if (!components) {
    return (
      <div className="h-64 sm:h-72 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children(components)}</>;
}

function PriceChart() {
  return (
    <ChartLoader>
      {({ LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer }) => (
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={PRICE_DATA}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-glass-border)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                domain={["dataMin - 20000", "dataMax + 20000"]}
              />
              <Tooltip
                content={<CustomTooltip prefix="$" />}
                cursor={{
                  stroke: "var(--color-accent)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#10B981",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
                animationDuration={2000}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartLoader>
  );
}

function InventoryChart() {
  return (
    <ChartLoader>
      {({ AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer }) => (
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={INVENTORY_DATA}>
              <defs>
                <linearGradient id="inventoryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="listingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-glass-border)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                axisLine={false}
                tickLine={false}
                domain={[0, "auto"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="listings"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#listingsGradient)"
                animationDuration={2000}
                animationEasing="ease-in-out"
              />
              <Area
                type="monotone"
                dataKey="inventory"
                stroke="#22D3EE"
                strokeWidth={2}
                fill="url(#inventoryGradient)"
                animationDuration={2000}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartLoader>
  );
}

export function MarketTrendCharts() {
  const { ref: sectionRef, inView } = useInView(0.1);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/10 bg-cyan-400/5 text-xs font-medium text-cyan-400 mb-4">
            <Activity className="w-3 h-3" />
            MARKET TRENDS
          </motion.span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Price &amp; <span className="text-gradient">Inventory Trends</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-sm sm:text-base">
            Track how Asheville&apos;s market has shifted over the past 12 months.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* Price trend chart */}
          <motion.div
            className="relative glass rounded-2xl p-5 sm:p-7 overflow-hidden group"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -3, transition: { duration: 0.35 } }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-px rounded-full bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent group-hover:w-full transition-all duration-500" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white">
                  Median Sale Price
                </h3>
                <p className="text-xs text-slate-500">12-month trend</p>
              </div>
            </div>
            <PriceChart />
          </motion.div>

          {/* Inventory trend chart */}
          <motion.div
            className="relative glass rounded-2xl p-5 sm:p-7 overflow-hidden group"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -3, transition: { duration: 0.35 } }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-px rounded-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent group-hover:w-full transition-all duration-500" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-400" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white">
                  Inventory &amp; Listings
                </h3>
                <p className="text-xs text-slate-500">Months supply + active listings</p>
              </div>
            </div>
            <InventoryChart />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
