"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, RefreshCw, Download, FileText, Mail, Send, Check, AlertCircle } from "lucide-react";
import { AdminSectionHeader, AdminToast, useAdminAPI } from "./AdminLayout";
import { PDFGenerationModal } from "@/components/pdf/PDFGenerationModal";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";
import type { SiteSettings } from "@/lib/admin-store";

interface ResendConfig {
  from: string;
  ownerEmail: string;
  configured: boolean;
  siteUrl: string;
}

interface SettingsWithResend extends SiteSettings {
  resend?: ResendConfig;
}

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
  const [settings, setSettings] = useState<SettingsWithResend | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [showPDFModal, setShowPDFModal] = useState(false);

  // Test email form state
  const [testEmailTo, setTestEmailTo] = useState("");
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    api("get-settings").then((data) => {
      setSettings(data as SettingsWithResend);
      if (data?.resend?.ownerEmail) setTestEmailTo(data.resend.ownerEmail);
    }).finally(() => setLoading(false));
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

  const handleTestEmail = async () => {
    if (!testEmailTo.trim()) {
      setToast("Enter a recipient email first.");
      return;
    }
    setTesting(true);
    const result = await api("send-email", {
      type: "test-email",
      to: testEmailTo.trim(),
    });
    setTesting(false);
    if (result.ok) {
      setToast(`Test email sent! Check ${testEmailTo.trim()}.`);
    } else {
      setToast("Test failed: " + (result.error || "unknown error"));
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

  const resend = settings.resend;

  return (
    <>
      <AdminSectionHeader
        title="Settings"
        description="Site metadata, timestamps, Resend email config, and data management."
      />

      <div className="space-y-6 max-w-2xl">
        {/* Resend Email Status */}
        <motion.div
          className="glass rounded-2xl p-5"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Mail className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)]">Email (Resend)</h4>
                <p className="text-xs text-slate-500">All transactional emails go through Resend</p>
              </div>
            </div>
            {resend?.configured ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Check className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertCircle className="w-3 h-3" /> Not Configured
              </span>
            )}
          </div>

          {resend && (
            <div className="space-y-2 text-xs mb-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">From address</span>
                <span className="font-mono text-slate-300">{resend.from}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Owner inbox (notifications)</span>
                <span className="font-mono text-slate-300">{resend.ownerEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Site URL</span>
                <span className="font-mono text-slate-300">{resend.siteUrl}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="email"
              value={testEmailTo}
              onChange={(e) => setTestEmailTo(e.target.value)}
              placeholder="test@example.com"
              className="flex-1 bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]"
            />
            <motion.button
              onClick={handleTestEmail}
              disabled={testing || !resend?.configured}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
              whileHover={!testing ? { scale: 1.03 } : {}}
              whileTap={!testing ? { scale: 0.97 } : {}}
            >
              <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
              {testing ? "Sending..." : "Send Test"}
            </motion.button>
          </div>

          {!resend?.configured && (
            <p className="text-[11px] text-amber-400 mt-3">
              Add <code className="bg-slate-800/50 px-1 rounded">RESEND_API_KEY</code> to your environment variables,
              and verify the <code className="bg-slate-800/50 px-1 rounded">ashevillere.com</code> domain in the Resend dashboard
              (DKIM/SPF) for emails to deliver.
            </p>
          )}
        </motion.div>

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
            Data is persisted in memory (with optional Vercel KV / Upstash Redis) via{" "}
            <code className="text-xs bg-slate-800/50 px-1 rounded">src/lib/admin-store.ts</code>.
            For serverless durability, swap to Vercel KV or a database. Changes take effect immediately.
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
