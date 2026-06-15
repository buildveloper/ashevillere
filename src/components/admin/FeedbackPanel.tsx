"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Mail,
  MessageSquare,
  Clock,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { AdminSectionHeader, AdminToast, useAdminAPI } from "./AdminLayout";
import type { FeedbackEntry } from "@/lib/admin-store";

export function FeedbackPanel() {
  const api = useAdminAPI();
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const data = await api("get-feedback");
      if (Array.isArray(data)) {
        setEntries(data.sort((a: FeedbackEntry, b: FeedbackEntry) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        ));
      }
    } catch {
      setToast("Failed to load feedback");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeedback();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    const result = await api("delete-feedback", { id });
    if (result.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (expandedId === id) setExpandedId(null);
      setToast("Feedback deleted");
    } else {
      setToast("Failed to delete");
    }
  };

  const avgRating = entries.length > 0
    ? (entries.reduce((sum, e) => sum + e.rating, 0) / entries.length).toFixed(1)
    : "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AdminSectionHeader
        title="Feedback"
        description="Review user feedback and ratings submitted via the floating feedback button."
      />

      {/* Summary stats */}
      {entries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{entries.length}</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Avg Rating</p>
            <p className="text-2xl font-bold text-amber-400">{avgRating}</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Latest</p>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {new Date(entries[0].submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : entries.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Star className="w-12 h-12 mx-auto text-slate-500/30 mb-4" strokeWidth={1} />
          <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Feedback Yet
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            When visitors submit feedback through the floating feedback button, their ratings and comments will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                className="w-full p-4 sm:p-5 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= entry.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-500/20"
                          }`}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                    {entry.message && (
                      <span className="text-xs text-slate-500 truncate max-w-[200px]">
                        {entry.message.slice(0, 50)}
                        {entry.message.length > 50 ? "..." : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {entry.email && (
                      <Mail className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.5} />
                    )}
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3" strokeWidth={1.5} />
                      {new Date(entry.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </button>

              {expandedId === entry.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-5 pb-5 space-y-3 border-t border-[var(--color-glass-border)] pt-4"
                >
                  {entry.message && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-slate-500 mt-0.5" strokeWidth={1.5} />
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {entry.message}
                      </p>
                    </div>
                  )}
                  {entry.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.5} />
                      <a
                        href={`mailto:${entry.email}`}
                        className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        {entry.email}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition-colors ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {toast && <AdminToast message={toast} onDone={() => setToast(null)} />}
    </motion.div>
  );
}
