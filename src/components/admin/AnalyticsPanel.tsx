"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, MousePointerClick, MessageSquare, FileText, Link2 } from "lucide-react";
import { AdminSectionHeader } from "./AdminLayout";

interface AnalyticsSummary {
  pageViews: number;
  chatMessages: number;
  pdfDownloads: number;
  affiliateClicks: number;
  toolUsage: number;
  topPages: { path: string; views: number }[];
  lastUpdated: string;
}

function getMockAnalytics(): AnalyticsSummary {
  return {
    pageViews: 1423,
    chatMessages: 87,
    pdfDownloads: 34,
    affiliateClicks: 52,
    toolUsage: 128,
    topPages: [
      { path: "/", views: 420 },
      { path: "/neighborhoods", views: 285 },
      { path: "/market-reports", views: 198 },
      { path: "/str-insights", views: 156 },
      { path: "/homes-for-sale", views: 142 },
      { path: "/blog", views: 98 },
      { path: "/tools", views: 82 },
      { path: "/resources", views: 42 },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

const METRIC_CARDS = [
  { key: "pageViews", label: "Page Views", icon: TrendingUp, color: "emerald" },
  { key: "chatMessages", label: "Chat Messages", icon: MessageSquare, color: "cyan" },
  { key: "pdfDownloads", label: "PDF Downloads", icon: FileText, color: "violet" },
  { key: "affiliateClicks", label: "Affiliate Clicks", icon: Link2, color: "amber" },
  { key: "toolUsage", label: "Tool Usage", icon: MousePointerClick, color: "rose" },
] as const;

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
};

export function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(getMockAnalytics());
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!data) {
    return <p className="text-slate-500 py-20 text-center">Failed to load analytics data.</p>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <AdminSectionHeader
        title="Analytics"
        description="Track key metrics, user engagement, and site performance."
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {METRIC_CARDS.map((metric, i) => {
          const Icon = metric.icon;
          const color = colorMap[metric.color];
          const value = data[metric.key as keyof AnalyticsSummary] as number;

          return (
            <motion.div
              key={metric.key}
              className={`glass rounded-2xl p-5 border ${color.border}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color.text}`} strokeWidth={1.5} />
              </div>
              <div className={`text-2xl font-bold ${color.text} mb-1`}>
                {typeof value === "number" ? value.toLocaleString() : value}
              </div>
              <p className="text-xs text-slate-500">{metric.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Top Pages */}
      <div className="glass rounded-2xl p-6 border border-[var(--color-glass-border)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Pages</h3>
            <p className="text-xs text-slate-500">Most visited pages this period</p>
          </div>
        </div>

        <div className="space-y-2">
          {data.topPages.map((page, i) => {
            const maxViews = data.topPages[0].views;
            const barWidth = maxViews > 0 ? (page.views / maxViews) * 100 : 0;

            return (
              <motion.div
                key={page.path}
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="w-6 text-xs text-slate-500 text-right font-mono">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300 font-medium">{page.path}</span>
                    <span className="text-xs text-slate-500 font-mono">{page.views.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-6 text-[10px] text-slate-600">
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </p>
      </div>

      {/* GA4 / Vercel note */}
      <div className="mt-8 p-6 rounded-2xl glass border border-[var(--color-glass-border)]">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Connect Real Analytics
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          Set <code className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[11px]">NEXT_PUBLIC_GA_ID</code> in your environment
          variables to enable Google Analytics 4 tracking. Then configure Vercel Analytics in your Vercel dashboard.
          This dashboard currently shows simulated data for the admin preview.
        </p>
      </div>
    </motion.div>
  );
}
