"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Mail, MessageSquare, Send, Check, AlertCircle } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const resetForm = () => {
    setRating(0);
    setHoveredStar(0);
    setMessage("");
    setEmail("");
    setStatus("idle");
    setErrorMsg("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMsg("Please select a rating.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "feedback",
          rating,
          message: message.trim(),
          email: email.trim(),
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

  const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
            <motion.div
              className="glass-strong rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-500/10"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
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
                    Thank You!
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Your feedback helps us improve AshevilleRE. We appreciate you taking the time to share your thoughts.
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
                  {/* Header */}
                  <div className="p-6 border-b border-[var(--color-glass-border)]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/10 bg-purple-500/10 text-[11px] font-semibold text-purple-400 mb-3">
                      <Star className="w-3 h-3" />
                      FEEDBACK
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      Share Your Thoughts
                    </h2>
                    <p className="text-sm text-slate-500">Help us make AshevilleRE even better.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Star Rating */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                        Rating
                      </label>
                      <div className="flex items-center justify-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            type="button"
                            onClick={() => { setRating(star); setErrorMsg(""); }}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(0)}
                            className="p-1"
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                (hoveredStar || rating) >= star
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-500/30"
                              }`}
                              strokeWidth={1.5}
                            />
                          </motion.button>
                        ))}
                      </div>
                      {rating > 0 && (
                        <motion.p
                          initial={{ opacity: 0, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center text-xs font-medium text-amber-400"
                        >
                          {ratingLabels[rating]}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Your Feedback
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-500" strokeWidth={1.5} />
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Tell us what you think about AshevilleRE — what works, what could be better, feature ideas..."
                          rows={4}
                          maxLength={2000}
                          className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg pl-10 pr-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Email <span className="font-normal normal-case tracking-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" strokeWidth={1.5} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          maxLength={320}
                          className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg pl-10 pr-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors"
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
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold disabled:opacity-50 shadow-lg shadow-purple-500/25"
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
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" strokeWidth={1.5} />
                          Submit Feedback
                        </>
                      )}
                    </motion.button>
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
