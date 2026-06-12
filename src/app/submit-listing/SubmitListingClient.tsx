"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  DollarSign,
  MapPin,
  Building2,
  Bed,
  Bath,
  Ruler,
  Calendar,
  FileText,
  Image as ImageIcon,
  Mail,
  Phone,
  User,
  Send,
  Check,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronDown,
  RefreshCcw,
  UploadCloud,
  X,
} from "lucide-react";
import Link from "next/link";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";

const PROPERTY_TYPES = ["Single Family", "Condo", "Townhouse", "Multi-Family", "Land"];

interface FormData {
  title: string;
  price: string;
  address: string;
  neighborhoodId: string;
  beds: string;
  baths: string;
  sqft: string;
  propertyType: string;
  yearBuilt: string;
  description: string;
  imageUrl1: string;
  imageUrl2: string;
  imageUrl3: string;
  imageUrl4: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  agreedToTerms: boolean;
}

const emptyForm: FormData = {
  title: "",
  price: "",
  address: "",
  neighborhoodId: "",
  beds: "",
  baths: "",
  sqft: "",
  propertyType: "Single Family",
  yearBuilt: "",
  description: "",
  imageUrl1: "",
  imageUrl2: "",
  imageUrl3: "",
  imageUrl4: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  agreedToTerms: false,
};

export function SubmitListingClient() {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState("");

  // Image upload state
  const [uploading, setUploading] = useState(false);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newPreviews: string[] = [];

    for (let i = 0; i < Math.min(files.length, 4); i++) {
      const file = files[i];

      if (file.size > 10 * 1024 * 1024) {
        setError("File too large. Maximum size: 10MB per image.");
        setUploading(false);
        return;
      }

      // Local preview
      const reader = new FileReader();
      const idx = i;
      reader.onload = (ev) => {
        setUploadPreviews((prev) => {
          const copy = [...prev];
          copy[idx] = ev.target?.result as string;
          return copy;
        });
      };
      reader.readAsDataURL(file);

      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload?public=true", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.url) {
          const field = `imageUrl${i + 1}` as keyof FormData;
          setForm((prev) => ({ ...prev, [field]: data.url }));
          newPreviews.push(data.url);
        }
      } catch {
        // Continue with remaining files
      }
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.address.trim() || !form.price || !form.neighborhoodId) {
      setError("Title, address, price, and neighborhood are required.");
      return;
    }
    if (!form.agreedToTerms) {
      setError("You must agree to the terms before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const hood = NEIGHBORHOODS.find((h) => h.id === form.neighborhoodId);
      const imageUrls = [form.imageUrl1, form.imageUrl2, form.imageUrl3, form.imageUrl4].filter(Boolean);

      const res = await fetch("/api/admin?action=submit-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          price: parseInt(form.price) || 0,
          address: form.address.trim(),
          neighborhood: hood?.name || "",
          neighborhoodId: form.neighborhoodId,
          beds: parseInt(form.beds) || 0,
          baths: parseFloat(form.baths) || 0,
          sqft: parseInt(form.sqft) || 0,
          propertyType: form.propertyType,
          yearBuilt: parseInt(form.yearBuilt) || 0,
          description: form.description.trim(),
          imageUrls,
          contactName: form.contactName.trim(),
          contactEmail: form.contactEmail.trim(),
          contactPhone: form.contactPhone.trim(),
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setTrackingNumber(data.trackingNumber);
        setSubmitted(true);
      } else {
        setError(data.error || "Submission failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0 bg-[var(--color-bg-primary)]" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/3 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/3 rounded-full blur-3xl" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
        {submitted ? (
          /* Success State */
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            >
              <Check className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
            </motion.div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
              Listing Submitted!
            </h1>
            <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-6">
              Your listing has been received and will be reviewed by our team.
              We publish approved listings within <strong>24-48 hours</strong>.
            </p>

            <div className="glass rounded-2xl p-6 max-w-sm mx-auto mb-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Tracking Number</p>
              <p className="font-mono text-lg font-bold text-emerald-400 tracking-wider">{trackingNumber}</p>
              <p className="text-xs text-slate-500 mt-2">
                Save this number to check on your listing status. We&apos;ll also email you at{" "}
                <strong>{form.contactEmail || "the email you provided"}</strong> when it&apos;s live.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/homes-for-sale"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25"
              >
                Browse Homes for Sale
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-hover text-sm font-medium text-[var(--color-text-secondary)] border border-[var(--color-glass-border)]"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Form */
          <>
            {/* Hero */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 text-xs font-medium text-emerald-400 mb-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Home className="w-3 h-3" />
                FOR SALE BY OWNER
              </motion.span>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text-primary)] mb-4">
                List Your Home on{" "}
                <span className="text-gradient">AshevilleRE</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
                Reach thousands of Asheville home buyers. Submit your FSBO listing for free.
                Your listing will be reviewed and published within 24-48 hours.
              </p>
            </motion.div>

            {/* Review Notice */}
            <motion.div
              className="mb-8 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Review Process</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  All listings are reviewed for quality and accuracy before publication.
                  We verify addresses, pricing, and content. Listings that appear fraudulent,
                  contain misleading information, or violate our terms will be rejected.
                  Expected review time: 24-48 hours.
                </p>
              </div>
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="glass rounded-2xl p-6 sm:p-8 space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              {/* Property Details */}
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)] mb-1">Property Details</h2>
                <p className="text-xs text-slate-500 mb-6">Tell us about the home you&apos;re listing.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Listing Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="e.g., Charming Bungalow in West Asheville"
                      className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Price ($) *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" strokeWidth={1.5} />
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => handleChange("price", e.target.value)}
                        placeholder="425000"
                        className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)] [appearance:textfield]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Full Address *</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="42 Haywood Road, Asheville, NC 28801"
                      className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Neighborhood *</label>
                    <select
                      value={form.neighborhoodId}
                      onChange={(e) => handleChange("neighborhoodId", e.target.value)}
                      className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]"
                    >
                      <option value="" className="bg-[var(--color-bg-primary)]">-- Select Neighborhood --</option>
                      {NEIGHBORHOODS.map((h) => (
                        <option key={h.id} value={h.id} className="bg-[var(--color-bg-primary)]">{h.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Property Type</label>
                    <select
                      value={form.propertyType}
                      onChange={(e) => handleChange("propertyType", e.target.value)}
                      className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]"
                    >
                      {PROPERTY_TYPES.map((t) => (
                        <option key={t} value={t} className="bg-[var(--color-bg-primary)]">{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Bedrooms</label>
                    <input type="number" value={form.beds} onChange={(e) => handleChange("beds", e.target.value)} placeholder="3" className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)] [appearance:textfield]" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Bathrooms</label>
                    <input type="number" step="0.5" value={form.baths} onChange={(e) => handleChange("baths", e.target.value)} placeholder="2" className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)] [appearance:textfield]" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Square Feet</label>
                    <input type="number" value={form.sqft} onChange={(e) => handleChange("sqft", e.target.value)} placeholder="1800" className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)] [appearance:textfield]" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Year Built</label>
                    <input type="number" value={form.yearBuilt} onChange={(e) => handleChange("yearBuilt", e.target.value)} placeholder="1998" className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)] [appearance:textfield]" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Description</label>
                <p className="text-xs text-slate-500">Describe your home in detail. Highlight its best features, recent upgrades, and what makes it special.</p>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe the property — key features, upgrades, neighborhood highlights, and what makes it special..."
                  rows={5}
                  className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)] resize-none"
                />
              </div>

              {/* Images */}
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)] mb-1">Images</h2>
                <p className="text-xs text-slate-500 mb-6">Upload photos from your phone or computer, or paste image URLs below.</p>

                {/* File upload */}
                <div className="mb-4">
                  <label className="relative cursor-pointer group inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-dashed border-[var(--color-glass-border)] text-sm text-slate-400 group-hover:border-emerald-500/50 group-hover:text-emerald-400 transition-colors">
                      {uploading ? (
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                      ) : (
                        <UploadCloud className="w-4 h-4" />
                      )}
                      {uploading ? "Uploading..." : "Upload photos from phone or PC (up to 4)"}
                    </div>
                  </label>
                </div>

                {/* Upload previews */}
                {uploadPreviews.filter(Boolean).length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {uploadPreviews.map((preview, i) => {
                      if (!preview) return null;
                      const field = `imageUrl${i + 1}` as keyof FormData;
                      return (
                        <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-[var(--color-glass-border)]">
                          <img src={preview} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => {
                              setForm((p) => ({ ...p, [field]: "" }));
                              setUploadPreviews((p) => { const copy = [...p]; copy[i] = ""; return copy; });
                            }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* URL inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((n) => {
                    const field = `imageUrl${n}` as keyof FormData;
                    return (
                      <div key={field} className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Image URL {n}</label>
                        <input
                          type="text"
                          value={form[field] as string}
                          onChange={(e) => handleChange(field, e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contact */}
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)] mb-1">Contact Information</h2>
                <p className="text-xs text-slate-500 mb-6">How can interested buyers reach you? Email and phone are optional but recommended.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Your Name</label>
                    <input type="text" value={form.contactName} onChange={(e) => handleChange("contactName", e.target.value)} placeholder="Jane Smith" className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Email</label>
                    <input type="email" value={form.contactEmail} onChange={(e) => handleChange("contactEmail", e.target.value)} placeholder="jane@example.com" className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</label>
                    <input type="tel" value={form.contactPhone} onChange={(e) => handleChange("contactPhone", e.target.value)} placeholder="(828) 555-0123" className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]" />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="p-4 rounded-xl border border-[var(--color-glass-border)] space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={form.agreedToTerms}
                    onChange={(e) => handleChange("agreedToTerms", e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--color-glass-border)] mt-0.5 accent-emerald-500"
                  />
                  <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed">
                    I confirm that I am the property owner or authorized agent. I understand that my listing will be reviewed before publication and may be edited for clarity. I agree to the{" "}
                    <Link href="/terms" className="text-emerald-400 underline hover:text-emerald-300 transition-colors">Terms of Service</Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-emerald-400 underline hover:text-emerald-300 transition-colors">Privacy Policy</Link>.
                    I understand that AshevilleRE is not a real estate brokerage and does not represent buyers or sellers.
                  </label>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-start gap-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <p className="text-xs text-red-400">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold disabled:opacity-50 shadow-lg shadow-emerald-500/25"
                whileHover={!submitting ? { scale: 1.01 } : {}}
                whileTap={!submitting ? { scale: 0.99 } : {}}
              >
                {submitting ? (
                  <>
                    <RefreshCcw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" strokeWidth={1.5} />
                    Submit Listing for Review
                  </>
                )}
              </motion.button>

              <p className="text-center text-[11px] text-slate-600">
                By submitting, you agree that your contact information may be displayed on the public listing page (email and phone are optional and only shown if provided).
              </p>
            </motion.form>
          </>
        )}
      </div>
    </div>
  );
}
