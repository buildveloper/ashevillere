"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Send,
  Check,
  X,
} from "lucide-react";
import { AdminSectionHeader, AdminFormField, AdminToast, useAdminAPI } from "./AdminLayout";
import type { ContactMessage } from "@/lib/admin-store";

export function InquiriesPanel() {
  const api = useAdminAPI();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Forward-to-seller modal state
  const [forwardModalOpen, setForwardModalOpen] = useState<string | null>(null);
  const [overrideSellerEmail, setOverrideSellerEmail] = useState("");
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await api("get-contact-messages");
      if (Array.isArray(data)) {
        setMessages(data);
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

  const openForwardModal = (msg: ContactMessage) => {
    setOverrideSellerEmail(msg.sellerEmail || "");
    setForwardModalOpen(msg.id);
  };

  const handleForward = async (msg: ContactMessage) => {
    const sellerEmail = overrideSellerEmail.trim();
    if (!sellerEmail) {
      setToast("Seller email is required to forward.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sellerEmail)) {
      setToast("Please enter a valid email address.");
      return;
    }

    setSending(true);
    const result = await api("send-email", {
      type: "forward-inquiry",
      inquiryId: msg.id,
      sellerEmail,
    });
    setSending(false);

    if (result.ok) {
      setToast("Forwarded to seller! They can reply directly to the buyer.");
      setForwardModalOpen(null);
      await fetchMessages();
    } else {
      setToast("Failed to forward: " + (result.error || "unknown error"));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <AdminSectionHeader
        title="Inquiries"
        description="View contact seller messages from prospective buyers and forward them to the seller."
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
                      {msg.forwarded && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Check className="w-2.5 h-2.5" /> Forwarded
                        </span>
                      )}
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

                  {/* Seller email section */}
                  <div className="p-3 rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-bg-tertiary)]/30">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Seller Email
                      </p>
                      {msg.forwarded && (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Forwarded {msg.forwardedAt && new Date(msg.forwardedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {msg.sellerEmail ? (
                      <p className="text-sm font-medium text-emerald-400 break-all">{msg.sellerEmail}</p>
                    ) : (
                      <p className="text-xs text-amber-400 flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3" />
                        No seller email on file. Click Forward to set one.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={`mailto:${msg.email}`}
                      className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Reply to Buyer
                      <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                    </a>
                    <button
                      onClick={() => openForwardModal(msg)}
                      className="flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {msg.sellerEmail ? "Re-forward to Seller" : "Forward to Seller"}
                    </button>
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

      {/* Forward-to-Seller Modal */}
      <AnimatePresence>
        {forwardModalOpen && (() => {
          const msg = messages.find((m) => m.id === forwardModalOpen);
          if (!msg) return null;
          return (
            <>
              <motion.div
                className="fixed inset-0 z-[220] bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !sending && setForwardModalOpen(null)}
              />
              <div className="fixed inset-0 z-[230] flex items-center justify-center p-4">
                <motion.div
                  className="glass-strong rounded-2xl w-full max-w-md p-6 shadow-2xl border border-cyan-500/10"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                        <Send className="w-4 h-4 text-cyan-400" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white">
                        Forward to Seller
                      </h3>
                    </div>
                    <button
                      onClick={() => setForwardModalOpen(null)}
                      disabled={sending}
                      className="w-7 h-7 rounded-full glass flex items-center justify-center text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="p-3 rounded-lg bg-[var(--color-bg-tertiary)]/30 border border-[var(--color-glass-border)]">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">From</p>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{msg.name}</p>
                      <p className="text-xs text-slate-400">{msg.email}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--color-bg-tertiary)]/30 border border-[var(--color-glass-border)]">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Re</p>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{msg.listingAddress}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-5">
                    <AdminFormField label="Seller Email (will be BCC'd)">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" strokeWidth={1.5} />
                        <input
                          type="email"
                          value={overrideSellerEmail}
                          onChange={(e) => setOverrideSellerEmail(e.target.value)}
                          placeholder="seller@example.com"
                          className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]"
                        />
                      </div>
                    </AdminFormField>
                    <p className="text-[11px] text-slate-500">
                      The seller will receive a formatted email. Their reply will go directly to the buyer.
                      You'll be BCC'd on the message for record-keeping.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => handleForward(msg)}
                      disabled={sending || !overrideSellerEmail.trim()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm font-semibold disabled:opacity-50 shadow-lg shadow-cyan-500/25"
                      whileHover={!sending ? { scale: 1.02 } : {}}
                      whileTap={!sending ? { scale: 0.98 } : {}}
                    >
                      {sending ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
                          Send to Seller
                        </>
                      )}
                    </motion.button>
                    <button
                      onClick={() => setForwardModalOpen(null)}
                      disabled={sending}
                      className="px-4 py-2.5 rounded-xl glass-hover text-sm font-medium text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          );
        })()}
      </AnimatePresence>

      {toast && <AdminToast message={toast} onDone={() => setToast(null)} />}
    </motion.div>
  );
}
