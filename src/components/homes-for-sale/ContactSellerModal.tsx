"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, User, Phone, MessageSquare, Send, Check, AlertCircle, Home } from "lucide-react";
import type { Listing } from "@/lib/listings";

interface ContactSellerModalProps {
  isOpen: boolean;
  listing: Listing | null;
  onClose: () => void;
}

export function ContactSellerModal({ isOpen, listing, onClose }: ContactSellerModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setStatus("idle");
    setErrorMsg("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg("Please fill in your name, email, and message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");

    try {
      const priceFormatted = listing
        ? listing.price >= 1_000_000
          ? `$${(listing.price / 1_000_000).toFixed(2)}M`
          : `$${listing.price.toLocaleString()}`
        : "";

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact-seller",
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
          listingId: listing?.id || "",
          listingAddress: listing?.address || "",
          listingPrice: priceFormatted,
          listingUrl: listing
            ? `https://ashevillere.com/homes-for-sale?listing=${listing.id}`
            : "",
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setStatus("success");
      } else {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[220] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-[230] flex items-center justify-center p-4">
            <motion.div
              className="glass-strong rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-500/10"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </motion.button>

              {status === "success" ? (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4"
                  >
                    <Check className="w-8 h-8 text-emerald-400" strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Your message has been sent. The seller will reply soon.
                  </p>
                  <motion.button
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Done
                  </motion.button>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-[var(--color-glass-border)]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/10 bg-emerald-500/5 text-[11px] font-semibold text-emerald-400 mb-3">
                      <Mail className="w-3 h-3" />
                      CONTACT SELLER
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      Send an Inquiry
                    </h2>
                    {listing && (
                      <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {listing.address} ·{" "}
                        {listing.price >= 1_000_000
                          ? `$${(listing.price / 1_000_000).toFixed(2)}M`
                          : `$${listing.price.toLocaleString()}`}
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" strokeWidth={1.5} />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => { setName(e.target.value); setErrorMsg(""); }}
                          placeholder="Your full name"
                          required
                          maxLength={100}
                          className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg pl-10 pr-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" strokeWidth={1.5} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                          placeholder="you@example.com"
                          required
                          maxLength={320}
                          className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg pl-10 pr-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Phone <span className="font-normal normal-case tracking-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" strokeWidth={1.5} />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(555) 123-4567"
                          maxLength={20}
                          className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg pl-10 pr-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Message *
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-500" strokeWidth={1.5} />
                        <textarea
                          value={message}
                          onChange={(e) => { setMessage(e.target.value); setErrorMsg(""); }}
                          placeholder="I'm interested in this property and would like to learn more..."
                          required
                          rows={4}
                          maxLength={2000}
                          className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg pl-10 pr-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                        />
                      </div>
                    </div>

                    {errorMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400"
                      >
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                        {errorMsg}
                      </motion.div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold disabled:opacity-50 shadow-lg shadow-emerald-500/25"
                      whileHover={status !== "submitting" ? { scale: 1.02 } : {}}
                      whileTap={status !== "submitting" ? { scale: 0.98 } : {}}
                    >
                      {status === "submitting" ? (
                        <>
                          <motion.div
                            className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" strokeWidth={1.5} />
                          Send Message
                        </>
                      )}
                    </motion.button>

                    <p className="text-[10px] text-slate-500 text-center">
                      Your contact information will not be shared publicly.
                    </p>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
