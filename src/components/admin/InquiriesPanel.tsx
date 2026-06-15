"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  User,
  Phone,
  MessageSquare,
  Home,
  Clock,
  Trash2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { AdminSectionHeader, AdminToast, useAdminAPI } from "./AdminLayout";
import type { ContactMessage } from "@/lib/admin-store";

export function InquiriesPanel() {
  const api = useAdminAPI();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await api("get-contact-messages");
      if (Array.isArray(data)) {
        setMessages(data.sort((a: ContactMessage, b: ContactMessage) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        ));
      }
    } catch {
      setToast("Failed to load inquiries");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    const result = await api("delete-contact-message", { id });
    if (result.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (expandedId === id) setExpandedId(null);
      setToast("Inquiry deleted");
    } else {
      setToast("Failed to delete");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AdminSectionHeader
        title="Inquiries"
        description="View contact seller messages from prospective buyers."
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : messages.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Mail className="w-12 h-12 mx-auto text-slate-500/30 mb-4" strokeWidth={1} />
          <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Inquiries Yet
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            When buyers contact sellers through listing pages, their messages will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                className="w-full p-4 sm:p-5 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {msg.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.5} />
                      <span className="text-xs text-slate-400">{msg.email}</span>
                    </div>
                    {msg.listingAddress && (
                      <div className="flex items-center gap-2">
                        <Home className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.5} />
                        <span className="text-xs text-slate-500 truncate">
                          {msg.listingAddress}
                          {msg.listingPrice ? ` · ${msg.listingPrice}` : ""}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3" strokeWidth={1.5} />
                      {new Date(msg.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </button>

              {expandedId === msg.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-5 pb-5 space-y-3 border-t border-[var(--color-glass-border)] pt-4"
                >
                  {msg.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.5} />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{msg.phone}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-500 mt-0.5" strokeWidth={1.5} />
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <a
                      href={`mailto:${msg.email}`}
                      className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Reply via Email
                      <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                    </a>
                    <button
                      onClick={() => handleDelete(msg.id)}
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
