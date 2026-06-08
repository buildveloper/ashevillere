"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, RefreshCw, Download, FileText, Sparkles } from "lucide-react";
import { AdminSectionHeader, AdminToast, useAdminAPI } from "./AdminLayout";
import { PDFGenerationModal } from "@/components/pdf/PDFGenerationModal";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";
import type { SiteSettings } from "@/lib/admin-store";

const TEST_STATS = {
  medianPrice: 525000,
  avgDaysOnMarket: 28,
  activeListings: 1247,
  avgPricePerSqft: 312,
  monthsInventory: 2.8,
  yoyAppreciation: 8.2,
  lastUpdated: new Date().toISOString(),
};

export function SettingsPanel() {
  const api = useAdminAPI();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [showPDFModal, setShowPDFModal] = useState(false);

  useEffect(() => {
    api("get-settings").then(setSettings).finally(() => setLoading(false));
  }, [api]);

  const handleExport = async () => {
    const data = await api("export");
    if (!data.error) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ashevillere-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setToast("Data exported successfully");
    }
  };

  if (loading || !settings) {
    return <div className="h-48 rounded-xl shimmer-bg" />;
  }

  const meta = [
    { label: "Market Stats", timestamp: settings.lastMarketUpdate },
    { label: "Neighborhoods", timestamp: settings.lastNeighborhoodUpdate },
    { label: "Blog Posts", timestamp: settings.lastBlogUpdate },
  ];

  return (
    <>
      <AdminSectionHeader
        title="Settings"
        description="Site metadata, timestamps, and data management."
      />

      <div className="space-y-6 max-w-xl">
        {/* Timestamps */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Last Updated
          </h4>
          <div className="space-y-2">
            {meta.map((m) => (
              <motion.div
                key={m.label}
                className="glass rounded-xl p-4 flex items-center justify-between"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="text-sm text-slate-500 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {m.label}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {new Date(m.timestamp).toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Actions
          </h4>
          <div className="space-y-2">
            <motion.button
              onClick={handleExport}
              className="w-full flex items-center gap-3 glass rounded-xl p-4 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
              whileHover={{ x: 3 }}
            >
              <Download className="w-4 h-4" />
              Export All Data (JSON)
            </motion.button>

            <motion.button
              onClick={() => window.location.reload()}
              className="w-full flex items-center gap-3 glass rounded-xl p-4 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              whileHover={{ x: 3 }}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </motion.button>

            <motion.button
              onClick={() => setShowPDFModal(true)}
              className="w-full flex items-center gap-3 glass rounded-xl p-4 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
              whileHover={{ x: 3 }}
            >
              <FileText className="w-4 h-4" />
              Test Report Generation
            </motion.button>
          </div>
        </div>

        {/* Info */}
        <motion.div
          className="glass rounded-xl p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            About This Admin
          </h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            Data is persisted as JSON files in the <code className="text-xs bg-slate-800/50 px-1 rounded">/data</code>{" "}
            directory. In production, swap the storage layer in{" "}
            <code className="text-xs bg-slate-800/50 px-1 rounded">src/lib/admin-store.ts</code>{" "}
            for a database. Changes take effect immediately — no build step needed.
          </p>
        </motion.div>
      </div>

      {toast && <AdminToast message={toast} onDone={() => setToast(null)} />}

      <PDFGenerationModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        reportType="market-report"
        reportData={{
          stats: TEST_STATS,
          neighborhoods: NEIGHBORHOODS,
          generatedAt: new Date().toISOString(),
        }}
        title="Test Report"
        subtitle="Admin · PDF Generation Test"
      />
    </>
  );
}
