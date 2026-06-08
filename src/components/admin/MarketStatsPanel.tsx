"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Clock, Home, TrendingUp } from "lucide-react";
import { AdminSectionHeader, AdminFormField, AdminToast, useAdminAPI } from "./AdminLayout";
import type { MarketStats } from "@/lib/admin-store";

export function MarketStatsPanel() {
  const api = useAdminAPI();
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api("get-market-stats").then(setStats).finally(() => setLoading(false));
  }, [api]);

  const handleChange = (field: keyof MarketStats, value: string) => {
    if (!stats) return;
    setStats({ ...stats, [field]: parseFloat(value) || 0 });
  };

  const handleSave = async () => {
    if (!stats) return;
    setSaving(true);
    const result = await api("save-market-stats", stats);
    if (!result.error) {
      setToast("Market stats updated successfully");
      setStats(result);
    } else {
      setToast("Failed to save: " + result.error);
    }
    setSaving(false);
  };

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl shimmer-bg" />
        ))}
      </div>
    );
  }

  const fields: { field: keyof MarketStats; label: string; icon: React.ElementType; prefix?: string }[] = [
    { field: "medianPrice", label: "Median Home Price", icon: DollarSign, prefix: "$" },
    { field: "avgDaysOnMarket", label: "Average Days on Market", icon: Clock },
    { field: "activeListings", label: "Active Listings", icon: Home },
    { field: "avgPricePerSqft", label: "Average Price per SqFt", icon: TrendingUp, prefix: "$" },
    { field: "monthsInventory", label: "Months of Inventory", icon: TrendingUp },
    { field: "yoyAppreciation", label: "YoY Appreciation (%)", icon: TrendingUp },
  ];

  return (
    <>
      <AdminSectionHeader
        title="Market Stats"
        description="Update the key market figures displayed across the site and homepage."
        onSave={handleSave}
        loading={saving}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map(({ field, label, icon: Icon, prefix }) => (
          <motion.div
            key={field}
            className="glass rounded-xl p-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -2 }}
          >
            <AdminFormField label={label}>
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-500 flex-shrink-0" strokeWidth={1.5} />
                {prefix && (
                  <span className="text-lg text-slate-400 font-light">{prefix}</span>
                )}
                <input
                  type="number"
                  value={stats[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="flex-1 bg-transparent border-none text-lg font-semibold text-gray-900 dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </AdminFormField>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-8 glass rounded-xl p-5 text-sm text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Last updated: {new Date(stats.lastUpdated).toLocaleString()}
      </motion.div>

      {toast && <AdminToast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}
