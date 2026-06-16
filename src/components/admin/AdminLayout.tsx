"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  Building2,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Check,
  AlertCircle,
  Sparkles,
  PlusCircle,
  Download,
  BarChart3,
  MessageSquare,
  Star,
  Inbox,
} from "lucide-react";

export type Section = "dashboard" | "market" | "neighborhoods" | "blog" | "settings" | "ai" | "listings" | "submissions" | "import" | "analytics" | "inquiries" | "feedback";

const SIDEBAR_ITEMS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "market", label: "Market Stats", icon: TrendingUp },
  { id: "neighborhoods", label: "Neighborhoods", icon: Building2 },
  { id: "blog", label: "Blog Posts", icon: FileText },
  { id: "ai", label: "AI Content", icon: Sparkles },
  { id: "listings", label: "Listings", icon: PlusCircle },
  { id: "submissions", label: "Submissions", icon: Inbox },
  { id: "import", label: "Data Import", icon: Download },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "inquiries", label: "Inquiries", icon: MessageSquare },
  { id: "feedback", label: "Feedback", icon: Star },
  { id: "settings", label: "Settings", icon: Settings },
];

function getCSRFToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : "";
}

export function useAdminAPI() {
  const call = useCallback(async (action: string, body?: unknown) => {
    const res = await fetch(`/api/admin?action=${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": getCSRFToken(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  }, []);
  return call;
}

export function AdminSidebar({
  active,
  onSelect,
  mobileOpen,
  onMobileClose,
  onLogout,
}: {
  active: Section;
  onSelect: (s: Section) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onLogout: () => void;
}) {
  const sidebarContent = (
    <nav className="flex flex-col h-full">
      <div className="p-6">
        <span className="text-lg font-bold tracking-tight">
          <span className="text-emerald-500">Asheville</span>
          <span className="text-cyan-400">RE</span>
        </span>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Admin Panel</p>
      </div>

      <div className="flex-1 px-3 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => {
                onSelect(item.id);
                onMobileClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors relative ${
                isActive
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  layoutId="admin-sidebar-active"
                  className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-gradient-to-b from-emerald-500 to-cyan-400"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              {item.label}
            </motion.button>
          );
        })}
      </div>

      <div className="p-3">
        <motion.button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          Logout
        </motion.button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 glass-strong border-r border-[var(--color-glass-border)] z-30">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
            />
            <motion.div
              className="fixed top-0 left-0 bottom-0 z-50 w-72 glass-strong border-r border-[var(--color-glass-border)] lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-end p-4">
                <motion.button
                  onClick={onMobileClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center glass-hover text-slate-400"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </motion.button>
              </div>
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function AdminToast({
  message,
  type = "success",
  onDone,
}: {
  message: string;
  type?: "success" | "error";
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 10, x: "-50%" }}
      className={`fixed bottom-8 left-1/2 z-[200] glass-strong px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border ${
        type === "success" ? "border-emerald-500/20" : "border-red-500/20"
      }`}
    >
      {type === "success" ? (
        <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
      ) : (
        <AlertCircle className="w-4 h-4 text-red-400" strokeWidth={1.5} />
      )}
      <span className="text-sm text-gray-900 dark:text-white font-medium">
        {message}
      </span>
    </motion.div>
  );
}

export function AdminSectionHeader({
  title,
  description,
  onSave,
  loading,
}: {
  title: string;
  description: string;
  onSave?: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      {onSave && (
        <motion.button
          onClick={onSave}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold disabled:opacity-50 shadow-lg shadow-emerald-500/25"
          whileHover={!loading ? { scale: 1.03 } : {}}
          whileTap={!loading ? { scale: 0.97 } : {}}
        >
          {loading ? "Saving..." : "Save Changes"}
        </motion.button>
      )}
    </div>
  );
}

export function AdminFormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}
