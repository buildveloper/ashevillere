"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Home,
  DollarSign,
  Bed,
  Bath,
  Ruler,
  Calendar,
  Check,
  X,
  Eye,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Clock,
  Send,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { AdminSectionHeader, AdminFormField, AdminToast, useAdminAPI } from "./AdminLayout";
import type { ListingSubmission } from "@/lib/admin-store";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border border-red-500/20",
};

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`;
  return `$${price.toLocaleString()}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface SubmissionCardProps {
  sub: ListingSubmission;
  onApprove: (tracking: string) => void;
  onReject: (tracking: string, reason: string) => void;
  onResendConfirmation: (tracking: string) => void;
  expanded: boolean;
  onToggle: () => void;
  busy: boolean;
}

function SubmissionCard({
  sub,
  onApprove,
  onReject,
  onResendConfirmation,
  expanded,
  onToggle,
  busy,
}: SubmissionCardProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = () => {
    if (busy) return;
    onApprove(sub.trackingNumber);
  };

  const handleReject = () => {
    if (busy) return;
    if (!showRejectForm) {
      setShowRejectForm(true);
      return;
    }
    onReject(sub.trackingNumber, rejectReason.trim() || "Listing not approved.");
    setShowRejectForm(false);
    setRejectReason("");
  };

  return (
    <motion.div
      layout
      className="glass rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={onToggle}
        className="w-full p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-start gap-4">
          {/* Image thumbnail */}
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800/50 border border-[var(--color-glass-border)]">
            {sub.imageUrls?.[0] ? (
              <img src={sub.imageUrls[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                <ImageIcon className="w-6 h-6" strokeWidth={1.5} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-medium text-sm text-[var(--color-text-primary)] truncate">
                {sub.title || sub.address}
              </h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[sub.status]}`}>
                {STATUS_LABELS[sub.status]}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
              <Home className="w-3 h-3" strokeWidth={1.5} />
              <span className="truncate">{sub.address}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold">{formatPrice(sub.price)}</span>
              <span>{sub.beds} bd</span>
              <span>{sub.baths} ba</span>
              <span>{sub.sqft?.toLocaleString()} sqft</span>
              <span className="text-slate-500">{sub.propertyType}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" /> {sub.contactName || "Anonymous"}
              </span>
              {sub.contactEmail && (
                <a
                  href={`mailto:${sub.contactEmail}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Mail className="w-3 h-3" /> {sub.contactEmail}
                </a>
              )}
              {sub.contactPhone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {sub.contactPhone}
                </span>
              )}
              <span className="flex items-center gap-1 ml-auto text-slate-600">
                <Clock className="w-3 h-3" /> {formatDate(sub.submittedAt)}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 text-slate-500">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-[var(--color-glass-border)] overflow-hidden"
          >
            <div className="p-5 space-y-5">
              {/* Submitter contact info (prominent) */}
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Submitter Contact
                  </h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Name</p>
                    <p className="font-medium text-[var(--color-text-primary)]">
                      {sub.contactName || <span className="text-slate-500">Not provided</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Email</p>
                    {sub.contactEmail ? (
                      <a
                        href={`mailto:${sub.contactEmail}`}
                        className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors break-all"
                      >
                        {sub.contactEmail}
                      </a>
                    ) : (
                      <span className="text-slate-500">Not provided</span>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Phone</p>
                    {sub.contactPhone ? (
                      <a
                        href={`tel:${sub.contactPhone}`}
                        className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        {sub.contactPhone}
                      </a>
                    ) : (
                      <span className="text-slate-500">Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {sub.description && (
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Description
                  </h5>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {sub.description}
                  </p>
                </div>
              )}

              {/* Image gallery */}
              {sub.imageUrls && sub.imageUrls.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Images ({sub.imageUrls.length})
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {sub.imageUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-video rounded-lg overflow-hidden border border-[var(--color-glass-border)] hover:border-emerald-500/50 transition-colors"
                      >
                        <img src={url} alt={`Submission ${i + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Tracking & status details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Tracking #</p>
                  <p className="font-mono text-emerald-400">{sub.trackingNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Submitted</p>
                  <p className="text-slate-300">{formatDate(sub.submittedAt)}</p>
                </div>
                {sub.reviewedAt && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Reviewed</p>
                    <p className="text-slate-300">{formatDate(sub.reviewedAt)}</p>
                  </div>
                )}
                {sub.yearBuilt > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Year Built</p>
                    <p className="text-slate-300">{sub.yearBuilt}</p>
                  </div>
                )}
              </div>

              {/* Rejection reason (if rejected) */}
              {sub.status === "rejected" && sub.rejectionReason && (
                <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5">
                  <p className="text-xs font-semibold text-red-400 mb-1">Rejection reason sent to submitter:</p>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap">{sub.rejectionReason}</p>
                </div>
              )}

              {/* Reject reason form */}
              {showRejectForm && sub.status === "pending" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-2"
                >
                  <label className="block text-xs font-semibold uppercase tracking-wider text-red-400">
                    Rejection reason (will be emailed to submitter)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    placeholder="e.g. Photos are missing. Please re-submit with at least 3 high-quality photos of the home's exterior and main rooms."
                    className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 transition-colors text-[var(--color-text-primary)] resize-none"
                  />
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {sub.status === "pending" ? (
                  <>
                    <motion.button
                      onClick={handleApprove}
                      disabled={busy}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                      whileHover={!busy ? { scale: 1.03 } : {}}
                      whileTap={!busy ? { scale: 0.97 } : {}}
                    >
                      <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Approve &amp; Publish
                    </motion.button>
                    <motion.button
                      onClick={handleReject}
                      disabled={busy}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      whileHover={!busy ? { scale: 1.03 } : {}}
                      whileTap={!busy ? { scale: 0.97 } : {}}
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {showRejectForm ? "Confirm Reject" : "Reject"}
                    </motion.button>
                    {showRejectForm && (
                      <button
                        onClick={() => { setShowRejectForm(false); setRejectReason(""); }}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </>
                ) : (
                  <motion.button
                    onClick={() => onResendConfirmation(sub.trackingNumber)}
                    disabled={busy || !sub.contactEmail}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-medium hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
                    whileHover={!busy && sub.contactEmail ? { scale: 1.03 } : {}}
                    whileTap={!busy && sub.contactEmail ? { scale: 0.97 } : {}}
                  >
                    <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Resend {sub.status === "approved" ? "Approval" : "Rejection"} Email
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function SubmissionsPanel() {
  const api = useAdminAPI();
  const [submissions, setSubmissions] = useState<ListingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await api("get-listing-submissions");
    if (Array.isArray(data)) {
      // Sort newest first
      const sorted = (data as ListingSubmission[]).sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      setSubmissions(sorted);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = {
    all: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
  };

  const visible = filter === "all" ? submissions : submissions.filter((s) => s.status === filter);

  const handleApprove = async (tracking: string) => {
    setBusy(true);
    const sub = submissions.find((s) => s.trackingNumber === tracking);
    if (!sub) {
      setBusy(false);
      return;
    }

    // Create the live listing from this submission
    const newListing = {
      id: `usr-${Date.now()}`,
      address: sub.address,
      neighborhood: sub.neighborhood,
      neighborhoodId: sub.neighborhoodId,
      price: sub.price,
      beds: sub.beds,
      baths: sub.baths,
      sqft: sub.sqft,
      propertyType: sub.propertyType,
      yearBuilt: sub.yearBuilt,
      description: sub.description,
      image: sub.imageUrls?.[0] || "",
      images: sub.imageUrls || [],
      features: [],
      daysOnMarket: 0,
      priceChange: 0,
      contactEmail: sub.contactEmail,
      contactName: sub.contactName,
      contactPhone: sub.contactPhone,
      source: "fsbo" as const,
    };

    const saveResult = await api("save-admin-listing", newListing);
    if (saveResult.error) {
      setToast("Failed to create listing: " + saveResult.error);
      setBusy(false);
      return;
    }

    const updateResult = await api("update-listing-submission", {
      trackingNumber: tracking,
      status: "approved",
    });

    if (updateResult.error) {
      setToast("Listing created but status update failed: " + updateResult.error);
    } else {
      setToast(`Approved! Confirmation email sent to ${sub.contactEmail || "submitter"}.`);
    }

    await load();
    setBusy(false);
  };

  const handleReject = async (tracking: string, reason: string) => {
    setBusy(true);
    const result = await api("update-listing-submission", {
      trackingNumber: tracking,
      status: "rejected",
      rejectionReason: reason,
    });
    if (result.error) {
      setToast("Failed: " + result.error);
    } else {
      setToast("Listing rejected. Email sent to submitter.");
    }
    await load();
    setBusy(false);
  };

  const handleResend = async (tracking: string) => {
    setBusy(true);
    const sub = submissions.find((s) => s.trackingNumber === tracking);
    if (!sub || !sub.contactEmail) {
      setToast("No submitter email on file.");
      setBusy(false);
      return;
    }

    const type = sub.status === "approved" ? "listing-approved" : "listing-rejected";
    const result = await api("send-email", {
      type,
      contactName: sub.contactName,
      contactEmail: sub.contactEmail,
      trackingNumber: sub.trackingNumber,
      title: sub.title,
      address: sub.address,
      price: sub.price,
      ...(sub.status === "rejected" ? { reason: sub.rejectionReason } : {}),
    });
    if (result.error) {
      setToast("Failed: " + result.error);
    } else {
      setToast("Email re-sent successfully.");
    }
    setBusy(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <AdminSectionHeader
        title="Listings Submissions"
        description="Review FSBO listing submissions with full submitter contact information."
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => {
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "glass-hover text-slate-400 border border-[var(--color-glass-border)]"
              }`}
            >
              {f === "all" ? "All" : STATUS_LABELS[f]}
              <span className="ml-1.5 text-[10px] text-slate-500">({counts[f]})</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-xl p-5 shimmer-bg h-28" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          {filter === "pending" ? (
            <>
              <Check className="w-12 h-12 mx-auto text-emerald-500/30 mb-4" strokeWidth={1} />
              <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-2">
                All caught up!
              </h3>
              <p className="text-sm text-slate-500">No pending submissions to review.</p>
            </>
          ) : (
            <>
              <MessageSquare className="w-12 h-12 mx-auto text-slate-500/30 mb-4" strokeWidth={1} />
              <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No {filter} submissions
              </h3>
              <p className="text-sm text-slate-500">Submissions will appear here once received.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((sub) => (
            <SubmissionCard
              key={sub.trackingNumber}
              sub={sub}
              onApprove={handleApprove}
              onReject={handleReject}
              onResendConfirmation={handleResend}
              expanded={expanded === sub.trackingNumber}
              onToggle={() => setExpanded(expanded === sub.trackingNumber ? null : sub.trackingNumber)}
              busy={busy}
            />
          ))}
        </div>
      )}

      {toast && <AdminToast message={toast} onDone={() => setToast(null)} />}
    </motion.div>
  );
}
