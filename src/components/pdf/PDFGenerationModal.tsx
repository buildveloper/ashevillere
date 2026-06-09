"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  CheckCircle2,
  Loader2,
  X,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import type { ReportType, ReportPayload } from "@/lib/report-templates";
import { canGeneratePDF, recordPDFGeneration, remainingGenerations, timeUntilReset, MAX_GENERATIONS, WINDOW_HOURS } from "@/lib/rate-limit";

// ─── Types ─────────────────────────────────────────────────────────────────

type ModalState = "idle" | "generating" | "complete" | "error" | "rate-limited";

interface PDFGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: ReportType;
  reportData: ReportPayload;
  title: string;
  subtitle?: string;
}

// ─── Confetti Particles ────────────────────────────────────────────────────

const CONFETTI_COLORS = [
  "#059669", // emerald-600
  "#06b6d4", // cyan-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#ffffff",
];

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  shape: "circle" | "diamond";
}

function generateParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 200 + Math.random() * 400;
    particles.push({
      id: i,
      x: 0,
      y: 0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 200,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 10,
      rotation: Math.random() * 360,
      shape: Math.random() > 0.5 ? "circle" : "diamond",
    });
  }
  return particles;
}

function ConfettiBurst({ active }: { active: boolean }) {
  const particles = useRef<Particle[]>(generateParticles()).current;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {active &&
          particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute"
              style={{
                left: "50%",
                top: "50%",
                width: p.size,
                height: p.size,
                borderRadius: p.shape === "circle" ? "50%" : "1px",
                backgroundColor: p.color,
              }}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: p.vx,
                y: p.vy,
                opacity: 0,
                rotate: p.rotation * 2,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.2 + Math.random() * 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: Math.random() * 0.15,
              }}
            />
          ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Animated Checkmark ────────────────────────────────────────────────────

function AnimatedCheckmark() {
  return (
    <motion.div
      className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <CheckCircle2 className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
      </motion.div>
    </motion.div>
  );
}

// ─── Step Indicator ────────────────────────────────────────────────────────

const STEPS = [
  "Gathering data...",
  "Building report...",
  "Formatting layout...",
  "Finalizing PDF...",
];

// ─── Main Modal Component ──────────────────────────────────────────────────

export function PDFGenerationModal({
  isOpen,
  onClose,
  reportType,
  reportData,
  title,
  subtitle,
}: PDFGenerationModalProps) {
  const [state, setState] = useState<ModalState>("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setState("idle");
      setCurrentStep(0);
      setErrorMsg("");
    }
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, [isOpen]);

  // Animate steps during generation
  useEffect(() => {
    if (state === "generating") {
      stepIntervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < STEPS.length - 1) return prev + 1;
          return prev;
        });
      }, 700);
    }
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, [state]);

  const handleGenerate = useCallback(async () => {
    if (!canGeneratePDF()) {
      setState("rate-limited");
      return;
    }

    setState("generating");
    setCurrentStep(0);
    setErrorMsg("");

    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportType, data: reportData }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({ error: "Request failed" }));
        throw new Error(errBody.error || `Server returned ${response.status}`);
      }

      // Advance to last step for visual polish
      setCurrentStep(STEPS.length - 1);

      // Small delay so final step is visible
      await new Promise((r) => setTimeout(r, 600));

      // Get the filename from Content-Disposition header or generate one
      const disposition = response.headers.get("Content-Disposition");
      let filename = "AshevilleRE-Report.pdf";
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }

      // Download the file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      recordPDFGeneration();
      setState("complete");
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Failed to generate report");
      setState("error");
    }
  }, [reportType, reportData]);

  const handleClose = useCallback(() => {
    // Don't close during generation
    if (state === "generating") return;
    setState("idle");
    onClose();
  }, [state, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          />

          {/* Centered panel */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              className="relative w-full max-w-md"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div
                className="glass-strong rounded-2xl p-8 shadow-2xl border border-[var(--color-glass-border)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Confetti overlay */}
                <ConfettiBurst active={state === "complete"} />

                {/* Close button (hidden during generation) */}
                {state !== "generating" && (
                  <motion.button
                    onClick={handleClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-lg glass-hover flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors z-10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </motion.button>
                )}

                <div className="relative z-10">
                  {/* ─── IDLE STATE ─────────────────────────────────── */}
                  <AnimatePresence mode="wait">
                    {state === "idle" && (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center"
                      >
                        {/* Animated icon */}
                        <motion.div
                          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-400/10 border border-emerald-500/10 mb-6"
                          animate={{
                            boxShadow: [
                              "0 0 0 0 rgba(16,185,129,0)",
                              "0 0 0 12px rgba(16,185,129,0.08)",
                              "0 0 0 0 rgba(16,185,129,0)",
                            ],
                          }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <FileText
                              className="w-10 h-10 text-emerald-400"
                              strokeWidth={1.5}
                            />
                          </motion.div>
                        </motion.div>

                        <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {title}
                        </h3>
                        {subtitle && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            {subtitle}
                          </p>
                        )}

                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed">
                          Generate a professional PDF report with detailed data,
                          charts, and AshevilleRE branding.
                        </p>

                        <motion.button
                          onClick={handleGenerate}
                          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-sm font-semibold shadow-xl shadow-emerald-500/25 overflow-hidden relative group"
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer-bg" />
                          <span className="relative z-10 flex items-center gap-3">
                            <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                            Generate PDF
                          </span>
                        </motion.button>

                        <p className="mt-4 text-[10px] text-slate-500">
                          Free &bull; No sign-up required
                        </p>
                      </motion.div>
                    )}

                    {/* ─── GENERATING STATE ──────────────────────────── */}
                    {state === "generating" && (
                      <motion.div
                        key="generating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center"
                      >
                        {/* Spinning icon */}
                        <motion.div
                          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-400/10 border border-emerald-500/10 mb-6"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
                        </motion.div>

                        <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2">
                          Generating Report
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                          Building your professional PDF...
                        </p>

                        {/* Stepped progress */}
                        <div className="space-y-3 mb-6">
                          {STEPS.map((step, i) => (
                            <motion.div
                              key={step}
                              className="flex items-center gap-3"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{
                                opacity: i <= currentStep ? 1 : 0.3,
                                x: 0,
                              }}
                              transition={{ delay: i * 0.15 }}
                            >
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                  i < currentStep
                                    ? "bg-emerald-500"
                                    : i === currentStep
                                    ? "bg-emerald-500/50 animate-pulse"
                                    : "bg-slate-700"
                                }`}
                              >
                                {i < currentStep ? (
                                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                    <path
                                      d="M1 4L3.5 6.5L9 1"
                                      stroke="white"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                ) : i === currentStep ? (
                                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                                )}
                              </div>
                              <span
                                className={`text-xs transition-all duration-300 ${
                                  i <= currentStep
                                    ? "text-slate-200 font-medium"
                                    : "text-slate-500"
                                }`}
                              >
                                {step}
                              </span>
                            </motion.div>
                          ))}
                        </div>

                        {/* Shimmer progress bar */}
                        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 shimmer-bg"
                            initial={{ width: "0%" }}
                            animate={{
                              width: `${Math.min(90, (currentStep / (STEPS.length - 1)) * 90)}%`,
                            }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* ─── COMPLETE STATE ────────────────────────────── */}
                    {state === "complete" && (
                      <motion.div
                        key="complete"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center"
                      >
                        <div className="flex justify-center mb-6">
                          <AnimatedCheckmark />
                        </div>

                        <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          Report Ready!
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                          Your PDF has been downloaded. You can also download it again below.
                        </p>

                        <div className="flex flex-col gap-3">
                          <motion.button
                            onClick={handleGenerate}
                            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-sm font-semibold shadow-xl shadow-emerald-500/25"
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          >
                            <Download className="w-5 h-5" strokeWidth={1.5} />
                            Download Again
                          </motion.button>

                          <motion.button
                            onClick={handleClose}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl glass-hover text-sm font-medium text-slate-500 dark:text-slate-400"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Done
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* ─── ERROR STATE ───────────────────────────────── */}
                    {state === "error" && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center"
                      >
                        <motion.div
                          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/10 mb-6"
                          animate={{
                            boxShadow: [
                              "0 0 0 0 rgba(239,68,68,0)",
                              "0 0 0 12px rgba(239,68,68,0.06)",
                              "0 0 0 0 rgba(239,68,68,0)",
                            ],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <AlertCircle className="w-8 h-8 text-red-400" strokeWidth={1.5} />
                        </motion.div>

                        <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2">
                          Generation Failed
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                          {errorMsg || "Something went wrong while generating your report."}
                        </p>
                        <p className="text-xs text-slate-500 mb-6">
                          This could be a temporary issue. You can try again.
                        </p>

                        <div className="flex flex-col gap-3">
                          <motion.button
                            onClick={handleGenerate}
                            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-sm font-semibold shadow-xl shadow-emerald-500/25"
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          >
                            <RefreshCw className="w-5 h-5" strokeWidth={1.5} />
                            Try Again
                          </motion.button>

                          <motion.button
                            onClick={handleClose}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl glass-hover text-sm font-medium text-slate-500 dark:text-slate-400"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Bottom attribution */}
              <motion.p
                className="text-center mt-4 text-[10px] text-slate-500/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Powered by AshevilleRE Intelligence
              </motion.p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
