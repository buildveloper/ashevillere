"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Lock, Sparkles, ArrowRight, Eye, EyeOff, TrendingUp, Building2, FileText, Settings, PenLine, PlusCircle, Download } from "lucide-react";
import {
  AdminSidebar,
  AdminToast,
  useAdminAPI,
  type Section,
} from "@/components/admin/AdminLayout";
import { MarketStatsPanel } from "@/components/admin/MarketStatsPanel";
import { NeighborhoodPanel } from "@/components/admin/NeighborhoodPanel";
import { BlogManagerPanel } from "@/components/admin/BlogManagerPanel";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { AIContentPanel } from "@/components/admin/AIContentPanel";
import { ListingSubmissionPanel } from "@/components/admin/ListingSubmissionPanel";
import { DataImportPanel } from "@/components/admin/DataImportPanel";

function LoginGate({ onLogin }: { onLogin: () => void }) {
  const api = useAdminAPI();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await api("login", { password });
      if (result.ok) {
        onLogin();
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Connection failed. Is the server running?");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Lock className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase">
              Admin Access
            </span>
          </motion.div>

          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">
            <span className="text-emerald-500">Asheville</span>
            <span className="text-cyan-400">RE</span>
          </h1>
          <p className="text-sm text-slate-500">Content Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter admin password"
              autoFocus
              className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-xl px-4 py-3 pr-12 text-sm text-gray-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showPw ? (
                <EyeOff className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <Eye className="w-4 h-4" strokeWidth={1.5} />
              )}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red-400 text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold disabled:opacity-50 shadow-lg shadow-emerald-500/25"
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            {loading ? (
              "Signing in..."
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <p className="text-center text-[11px] text-slate-600 mt-4">
          Protected area. Authorized personnel only.
        </p>
      </motion.div>
    </div>
  );
}

export default function AdminPage() {
  const api = useAdminAPI();
  const [authed, setAuthed] = useState<boolean | null>(null); // null = checking
  const [section, setSection] = useState<Section>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api("check").then((r) => setAuthed(r.authed ?? false));
  }, [api]);

  const handleLogout = async () => {
    await api("logout");
    setAuthed(false);
    setSection("dashboard");
    setToast("Signed out");
  };

  // Loading state
  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-sm text-slate-500">Checking access...</span>
        </motion.div>
      </div>
    );
  }

  // Login gate
  if (!authed) {
    return (
      <>
        <LoginGate onLogin={() => setAuthed(true)} />
        {toast && <AdminToast message={toast} onDone={() => setToast(null)} />}
      </>
    );
  }

  // Authenticated dashboard
  const renderPanel = () => {
    switch (section) {
      case "dashboard":
        return <DashboardHome onNavigate={setSection} />;
      case "market":
        return <MarketStatsPanel />;
      case "neighborhoods":
        return <NeighborhoodPanel />;
      case "blog":
        return <BlogManagerPanel />;
      case "ai":
        return <AIContentPanel />;
      case "listings":
        return <ListingSubmissionPanel />;
      case "import":
        return <DataImportPanel />;
      case "settings":
        return <SettingsPanel />;
      default:
        return <DashboardHome onNavigate={setSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <AdminSidebar
        active={section}
        onSelect={setSection}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-20 lg:hidden glass-strong border-b border-[var(--color-glass-border)] px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-bold">
            <span className="text-emerald-500">Asheville</span>
            <span className="text-cyan-400">RE</span>{" "}
            <span className="text-slate-500 font-normal">Admin</span>
          </span>
          <button
            onClick={() => setMobileOpen(true)}
            className="w-8 h-8 rounded-lg glass-hover flex items-center justify-center text-slate-400"
          >
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <path d="M1 1H17M1 7H17M1 13H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">{renderPanel()}</div>
      </div>

      {toast && <AdminToast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

// ─── Dashboard Home Panel ───────────────────────────────────────────────────

const QUICK_ACTIONS: { label: string; section: Section; description: string; icon: React.ElementType }[] = [
  { label: "Market Stats", section: "market", description: "Edit median price, DOM, inventory, appreciation", icon: TrendingUp },
  { label: "Neighborhoods", section: "neighborhoods", description: "Update all 8 neighborhood profiles and data", icon: Building2 },
  { label: "Blog Posts", section: "blog", description: "Create, edit, and manage blog articles", icon: FileText },
  { label: "AI Content", section: "ai", description: "Generate SEO blog posts with Groq AI", icon: PenLine },
  { label: "Listings", section: "listings", description: "Add home listings + review public FSBO submissions", icon: PlusCircle },
  { label: "Data Import", section: "import", description: "Import public data from county records, CSV, Craigslist", icon: Download },
  { label: "Site Settings", section: "settings", description: "Timestamps, data export, and system info", icon: Settings },
];

function DashboardHome({ onNavigate }: { onNavigate: (s: Section) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-10">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase">
            Admin Dashboard
          </span>
        </motion.div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome <span className="text-gradient">back</span>
        </h1>
        <p className="text-slate-500 text-sm sm:text-base">
          Manage your AshevilleRE site content from one place. Changes take effect immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QUICK_ACTIONS.map((action, i) => {
          const IconComponent = action.icon;
          return (
            <motion.button
              key={action.section}
              onClick={() => onNavigate(action.section)}
              className="glass rounded-2xl p-6 text-left group"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 25 } }}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <IconComponent className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {action.label}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{action.description}</p>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
