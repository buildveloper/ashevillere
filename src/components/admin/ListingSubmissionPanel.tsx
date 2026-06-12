"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Check,
  X,
  Home,
  Tag,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Ruler,
  Calendar,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Clock,
  AlertCircle,
  ChevronDown,
  RefreshCcw,
  Eye,
  ExternalLink,
  UploadCloud,
} from "lucide-react";
import { AdminSectionHeader, AdminFormField, AdminToast, useAdminAPI } from "./AdminLayout";
import type { Listing } from "@/lib/listings";
import type { ListingSubmission } from "@/lib/admin-store";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";

const PROPERTY_TYPES = ["Single Family", "Condo", "Townhouse", "Multi-Family", "Land"];

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
};

function emptyListing(): Listing {
  return {
    id: `admin-${Date.now()}`,
    address: "",
    neighborhood: "",
    neighborhoodId: "",
    price: 0,
    beds: 0,
    baths: 0,
    sqft: 0,
    propertyType: "Single Family",
    yearBuilt: new Date().getFullYear() - 20,
    description: "",
    image: "",
    features: [],
    daysOnMarket: 0,
    priceChange: 0,
  };
}

export function ListingSubmissionPanel() {
  const api = useAdminAPI();
  const [view, setView] = useState<"manual" | "submissions">("manual");
  const [listing, setListing] = useState<Listing>(emptyListing());
  const [featureInput, setFeatureInput] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [improving, setImproving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Image upload state
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  // Submissions state
  const [submissions, setSubmissions] = useState<ListingSubmission[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  useEffect(() => {
    if (view === "submissions") loadSubmissions();
  }, [view]);

  const loadSubmissions = async () => {
    setLoadingSubs(true);
    const data = await api("get-listing-submissions");
    if (Array.isArray(data)) setSubmissions(data);
    setLoadingSubs(false);
  };

  const handleAdd = async () => {
    if (!listing.address.trim() || !listing.price || !listing.neighborhoodId) {
      setToast("Address, price, and neighborhood are required.");
      return;
    }
    setSaving(true);
    const result = await api("save-admin-listing", listing);
    if (!result.error) {
      setToast(`Listing "${listing.address}" added!`);
      setListing(emptyListing());
      setFeatureInput("");
      setImageUrlInput("");
    } else {
      setToast("Failed: " + result.error);
    }
    setSaving(false);
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    if (listing.features.includes(featureInput.trim())) return;
    setListing((p) => ({ ...p, features: [...p.features, featureInput.trim()] }));
    setFeatureInput("");
  };

  const handleRemoveFeature = (f: string) => {
    setListing((p) => ({ ...p, features: p.features.filter((x) => x !== f) }));
  };

  const handleImproveDescription = async () => {
    if (!listing.description.trim()) {
      setToast("Write a basic description first, then click Improve.");
      return;
    }
    setImproving(true);
    try {
      const prompt = `Improve and expand this real estate listing description for a home in Asheville, NC. Make it compelling, professional, and highlight key features. Keep it under 200 words. Original: ${listing.description}`;
      const res = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama3.2", prompt, stream: false, options: { temperature: 0.7, num_predict: 400 } }),
      });
      if (res.ok) {
        const data = await res.json();
        const improved = data.response?.trim() || listing.description;
        setListing((p) => ({ ...p, description: improved }));
        setToast("Description improved!");
      } else {
        setToast("AI service not available. Check your API key.");
      }
    } catch {
      setToast("Failed to connect to AI service.");
    }
    setImproving(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setToast("File too large. Maximum size: 10MB.");
      return;
    }

    // Show local preview
    const reader = new FileReader();
    reader.onload = (ev) => setUploadPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const csrfToken = document.cookie.match(/csrf_token=([^;]+)/)?.[1] || "";
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "X-CSRF-Token": csrfToken },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setListing((p) => ({ ...p, image: data.url }));
        setToast("Image uploaded successfully!");
      } else {
        setToast("Upload failed: " + (data.error || "Unknown error"));
        setUploadPreview(null);
      }
    } catch {
      setToast("Upload failed. Please check your connection.");
      setUploadPreview(null);
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleApproveSubmission = async (trackingNumber: string) => {
    const sub = submissions.find((s) => s.trackingNumber === trackingNumber);
    if (!sub) return;

    const newListing: Listing = {
      id: `usr-${Date.now()}`,
      address: sub.address,
      neighborhood: sub.neighborhood,
      neighborhoodId: sub.neighborhoodId,
      price: sub.price,
      beds: sub.beds,
      baths: sub.baths,
      sqft: sub.sqft,
      propertyType: sub.propertyType as Listing["propertyType"],
      yearBuilt: sub.yearBuilt,
      description: sub.description,
      image: sub.imageUrls?.[0] || "",
      features: [],
      daysOnMarket: 0,
      priceChange: 0,
    };

    const saveResult = await api("save-admin-listing", newListing);
    if (saveResult.error) {
      setToast("Failed to create listing: " + saveResult.error);
      return;
    }

    await api("update-listing-submission", { trackingNumber, status: "approved" });
    setSubmissions((prev) =>
      prev.map((s) => (s.trackingNumber === trackingNumber ? { ...s, status: "approved" } : s))
    );
    setToast(`Submission ${trackingNumber} approved and published!`);
  };

  const handleRejectSubmission = async (trackingNumber: string) => {
    await api("update-listing-submission", { trackingNumber, status: "rejected" });
    setSubmissions((prev) =>
      prev.map((s) => (s.trackingNumber === trackingNumber ? { ...s, status: "rejected" } : s))
    );
    setToast(`Submission ${trackingNumber} rejected.`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AdminSectionHeader
        title="Listings Manager"
        description={view === "manual" ? "Manually add home listings to the site." : "Review user-submitted FSBO listings."}
      />

      {/* View toggle */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => setView("manual")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            view === "manual"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "glass-hover text-slate-400 border border-[var(--color-glass-border)]"
          }`}
        >
          <Plus className="w-4 h-4 inline mr-1.5" strokeWidth={1.5} />
          Manual Entry
        </button>
        <button
          onClick={() => setView("submissions")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${
            view === "submissions"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "glass-hover text-slate-400 border border-[var(--color-glass-border)]"
          }`}
        >
          <Eye className="w-4 h-4 inline mr-1.5" strokeWidth={1.5} />
          Public Submissions
          {submissions.filter((s) => s.status === "pending").length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-[10px] font-bold text-white flex items-center justify-center">
              {submissions.filter((s) => s.status === "pending").length}
            </span>
          )}
        </button>
      </div>

      {view === "manual" ? (
        /* Manual Listing Form */
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminFormField label="Listing Title / Address">
                <input
                  type="text"
                  value={listing.address}
                  onChange={(e) => setListing((p) => ({ ...p, address: e.target.value }))}
                  placeholder="e.g., 42 Haywood Road"
                  className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]"
                />
              </AdminFormField>

              <AdminFormField label="Price ($)">
                <input
                  type="number"
                  value={listing.price || ""}
                  onChange={(e) => setListing((p) => ({ ...p, price: Number(e.target.value) }))}
                  placeholder="425000"
                  className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)] [appearance:textfield]"
                />
              </AdminFormField>

              <AdminFormField label="Neighborhood">
                <select
                  value={listing.neighborhoodId}
                  onChange={(e) => {
                    const hood = NEIGHBORHOODS.find((h) => h.id === e.target.value);
                    setListing((p) => ({
                      ...p,
                      neighborhoodId: e.target.value,
                      neighborhood: hood?.name || "",
                    }));
                  }}
                  className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]"
                >
                  <option value="" className="bg-[var(--color-bg-primary)]">-- Select --</option>
                  {NEIGHBORHOODS.map((h) => (
                    <option key={h.id} value={h.id} className="bg-[var(--color-bg-primary)]">
                      {h.name}
                    </option>
                  ))}
                </select>
              </AdminFormField>

              <AdminFormField label="Property Type">
                <select
                  value={listing.propertyType}
                  onChange={(e) => setListing((p) => ({ ...p, propertyType: e.target.value as Listing["propertyType"] }))}
                  className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-[var(--color-bg-primary)]">{t}</option>
                  ))}
                </select>
              </AdminFormField>

              <AdminFormField label="Beds">
                <input type="number" value={listing.beds || ""} onChange={(e) => setListing((p) => ({ ...p, beds: Number(e.target.value) }))} className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)] [appearance:textfield]" />
              </AdminFormField>

              <AdminFormField label="Baths">
                <input type="number" step="0.5" value={listing.baths || ""} onChange={(e) => setListing((p) => ({ ...p, baths: Number(e.target.value) }))} className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)] [appearance:textfield]" />
              </AdminFormField>

              <AdminFormField label="Sq Ft">
                <input type="number" value={listing.sqft || ""} onChange={(e) => setListing((p) => ({ ...p, sqft: Number(e.target.value) }))} className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)] [appearance:textfield]" />
              </AdminFormField>

              <AdminFormField label="Year Built">
                <input type="number" value={listing.yearBuilt || ""} onChange={(e) => setListing((p) => ({ ...p, yearBuilt: Number(e.target.value) }))} className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)] [appearance:textfield]" />
              </AdminFormField>

              <AdminFormField label="Days on Market">
                <input type="number" value={listing.daysOnMarket || ""} onChange={(e) => setListing((p) => ({ ...p, daysOnMarket: Number(e.target.value) }))} className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)] [appearance:textfield]" />
              </AdminFormField>

              <AdminFormField label="Status">
                <select
                  value={listing.daysOnMarket === 0 ? "For Sale" : listing.priceChange < 0 ? "Reduced" : "For Sale"}
                  className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]"
                >
                  <option className="bg-[var(--color-bg-primary)]">For Sale</option>
                  <option className="bg-[var(--color-bg-primary)]">Pending</option>
                  <option className="bg-[var(--color-bg-primary)]">Sold</option>
                </select>
              </AdminFormField>
            </div>

            {/* Description */}
            <AdminFormField label="Description">
              <textarea
                value={listing.description}
                onChange={(e) => setListing((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe the property..."
                rows={4}
                className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)] resize-none"
              />
              <div className="flex items-center gap-2 mt-2">
                <motion.button
                  onClick={handleImproveDescription}
                  disabled={improving || !listing.description.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 disabled:opacity-50 hover:bg-amber-500/20 transition-colors"
                  whileHover={!improving ? { scale: 1.02 } : {}}
                  whileTap={!improving ? { scale: 0.98 } : {}}
                >
                  {improving ? (
                    <RefreshCcw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  {improving ? "Improving..." : "Improve Description with AI"}
                </motion.button>
              </div>
            </AdminFormField>

            {/* Features */}
            <AdminFormField label="Features">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddFeature(); } }}
                  placeholder="Add a feature (e.g., Hardwood Floors)"
                  className="flex-1 bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]"
                />
                <motion.button
                  onClick={handleAddFeature}
                  className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add
                </motion.button>
              </div>
              {listing.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {listing.features.map((f) => (
                    <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--color-bg-tertiary)] text-xs text-[var(--color-text-secondary)]">
                      {f}
                      <button onClick={() => handleRemoveFeature(f)} className="text-slate-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </AdminFormField>

            {/* Image */}
            <AdminFormField label="Listing Photo">
              <div className="space-y-3">
                {/* File upload */}
                <div className="flex items-center gap-3">
                  <label className="relative cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[var(--color-glass-border)] text-sm text-slate-400 group-hover:border-emerald-500/50 group-hover:text-emerald-400 transition-colors">
                      {uploading ? (
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                      ) : (
                        <UploadCloud className="w-4 h-4" />
                      )}
                      {uploading ? "Uploading..." : "Upload from phone or PC"}
                    </div>
                  </label>
                  {(uploadPreview || listing.image) && (
                    <button
                      onClick={() => { setListing((p) => ({ ...p, image: "" })); setUploadPreview(null); }}
                      className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Preview */}
                {(uploadPreview || listing.image) && (
                  <div className="relative w-40 h-32 rounded-lg overflow-hidden border border-[var(--color-glass-border)]">
                    <img
                      src={uploadPreview || listing.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Or paste URL */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--color-glass-border)]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[var(--color-bg-primary)] px-3 text-[10px] uppercase tracking-wider text-slate-600">Or paste image URL</span>
                  </div>
                </div>
                <input
                  type="text"
                  value={listing.image}
                  onChange={(e) => setListing((p) => ({ ...p, image: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]"
                />
              </div>
            </AdminFormField>
          </div>

          <motion.button
            onClick={handleAdd}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold disabled:opacity-50 shadow-lg shadow-emerald-500/25"
            whileHover={!saving ? { scale: 1.02 } : {}}
            whileTap={!saving ? { scale: 0.98 } : {}}
          >
            {saving ? "Adding..." : (
              <>
                <Plus className="w-4 h-4" strokeWidth={1.5} />
                Add to Homes for Sale
              </>
            )}
          </motion.button>
        </div>
      ) : (
        /* Public Submissions View */
        <div>
          {loadingSubs ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-xl p-5 shimmer-bg h-24" />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Clock className="w-10 h-10 mx-auto text-slate-500/30 mb-3" strokeWidth={1} />
              <p className="text-sm text-slate-500">No public submissions yet.</p>
              <p className="text-xs text-slate-600 mt-1">FSBO listings submitted through /submit-listing will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <motion.div
                  key={sub.trackingNumber}
                  className="glass rounded-xl p-5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-[var(--color-text-primary)] truncate">
                          {sub.address}
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          sub.status === "pending" ? "bg-amber-500/10 text-amber-400"
                          : sub.status === "approved" ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                        }`}>
                          {STATUS_LABELS[sub.status]}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>${sub.price?.toLocaleString()}</span>
                        <span>{sub.beds} bed</span>
                        <span>{sub.baths} bath</span>
                        <span>{sub.sqft?.toLocaleString()} sqft</span>
                        <span>{sub.propertyType}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{sub.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-600">
                        <span>#{sub.trackingNumber}</span>
                        {sub.contactEmail && <span>{sub.contactEmail}</span>}
                        {sub.contactPhone && <span>{sub.contactPhone}</span>}
                      </div>
                    </div>
                    {sub.status === "pending" && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <motion.button
                          onClick={() => handleApproveSubmission(sub.trackingNumber)}
                          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          title="Approve & Publish"
                        >
                          <Check className="w-4 h-4" strokeWidth={1.5} />
                        </motion.button>
                        <motion.button
                          onClick={() => handleRejectSubmission(sub.trackingNumber)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          title="Reject"
                        >
                          <X className="w-4 h-4" strokeWidth={1.5} />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {toast && <AdminToast message={toast} onDone={() => setToast(null)} />}
    </motion.div>
  );
}
