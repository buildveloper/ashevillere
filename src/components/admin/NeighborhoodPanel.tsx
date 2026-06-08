"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Save, Undo2 } from "lucide-react";
import { AdminSectionHeader, AdminFormField, AdminToast, useAdminAPI } from "./AdminLayout";
import type { NeighborhoodDetail } from "@/lib/neighborhoods";

export function NeighborhoodPanel() {
  const api = useAdminAPI();
  const [hoods, setHoods] = useState<NeighborhoodDetail[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [edit, setEdit] = useState<NeighborhoodDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api("get-neighborhoods").then((data) => {
      if (Array.isArray(data)) {
        setHoods(data);
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].id);
          setEdit({ ...data[0] });
        }
      }
      setLoading(false);
    });
  }, [api]);

  useEffect(() => {
    if (selectedId && hoods.length) {
      const h = hoods.find((n) => n.id === selectedId);
      if (h) setEdit({ ...h });
    }
  }, [selectedId, hoods]);

  const selected = hoods.find((n) => n.id === selectedId);

  const handleFieldChange = (field: string, value: string | number | string[]) => {
    if (!edit) return;
    if (field.startsWith("stats.")) {
      const statField = field.replace("stats.", "") as keyof NeighborhoodDetail["stats"];
      setEdit({
        ...edit,
        stats: { ...edit.stats, [statField]: value },
      });
    } else if (field.startsWith("schools.")) {
      const schoolField = field.replace("schools.", "");
      setEdit({
        ...edit,
        schools: { ...edit.schools, [schoolField]: schoolField === "rating" ? Number(value) : value },
      });
    } else {
      setEdit({ ...edit, [field]: value });
    }
  };

  const handleArrayToggle = (field: "vibe" | "pros" | "cons" | "bestFor", item: string) => {
    if (!edit) return;
    const arr = [...edit[field]];
    const idx = arr.indexOf(item);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(item);
    setEdit({ ...edit, [field]: arr });
  };

  const handleSave = async () => {
    if (!edit) return;
    setSaving(true);
    const result = await api("save-neighborhood", edit);
    if (!result.error) {
      setHoods((prev) => prev.map((h) => (h.id === edit.id ? edit : h)));
      setToast(`${edit.name} updated successfully`);
    } else {
      setToast("Save failed: " + result.error);
    }
    setSaving(false);
  };

  const handleReset = () => {
    if (selected) setEdit({ ...selected });
  };

  if (loading) {
    return <div className="h-64 rounded-xl shimmer-bg" />;
  }

  return (
    <>
      <AdminSectionHeader
        title="Neighborhoods"
        description="Edit neighborhood details, stats, and descriptions."
        onSave={handleSave}
        loading={saving}
      />

      <div className="lg:grid lg:grid-cols-[260px_1fr] gap-8">
        {/* List sidebar */}
        <div className="space-y-1 mb-6 lg:mb-0">
          {hoods.map((h) => (
            <motion.button
              key={h.id}
              onClick={() => setSelectedId(h.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 ${
                h.id === selectedId
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
              <span className="truncate">{h.name}</span>
              <span className="text-xs text-slate-600 ml-auto">{h.priceLabel}</span>
            </motion.button>
          ))}
        </div>

        {/* Editor */}
        {edit && (
          <motion.div
            key={edit.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white">
                Editing: {edit.name}
              </h3>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-400 transition-colors"
              >
                <Undo2 className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Basic fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminFormField label="Name">
                <input
                  value={edit.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                />
              </AdminFormField>
              <AdminFormField label="Tagline">
                <input
                  value={edit.tagline}
                  onChange={(e) => handleFieldChange("tagline", e.target.value)}
                  className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                />
              </AdminFormField>
              <AdminFormField label="Price Label">
                <input
                  value={edit.priceLabel}
                  onChange={(e) => handleFieldChange("priceLabel", e.target.value)}
                  className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                />
              </AdminFormField>
              <AdminFormField label="Market Trend">
                <select
                  value={edit.marketTrend}
                  onChange={(e) => handleFieldChange("marketTrend", e.target.value)}
                  className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="hot">Hot</option>
                  <option value="up">Up</option>
                  <option value="stable">Stable</option>
                </select>
              </AdminFormField>
            </div>

            {/* Stats grid */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Market Stats
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  ["medianPrice", "Median Price"],
                  ["pricePerSqft", "Price/SqFt"],
                  ["avgDaysOnMarket", "Days on Market"],
                  ["activeListings", "Active Listings"],
                  ["monthsInventory", "Months Inventory"],
                  ["yoyAppreciation", "YoY Appreciation %"],
                ].map(([field, label]) => (
                  <AdminFormField key={field} label={label}>
                    <input
                      type="number"
                      value={edit.stats[field as keyof typeof edit.stats]}
                      onChange={(e) =>
                        handleFieldChange(`stats.${field}`, parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </AdminFormField>
                ))}
              </div>
            </div>

            {/* STR fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <AdminFormField label="STR Score (0-100)">
                <input
                  type="number"
                  value={edit.strScore}
                  onChange={(e) => handleFieldChange("strScore", parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </AdminFormField>
              <AdminFormField label="STR Revenue ($/yr)">
                <input
                  type="number"
                  value={edit.strRevenue}
                  onChange={(e) => handleFieldChange("strRevenue", parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </AdminFormField>
              <AdminFormField label="STR Regulation">
                <select
                  value={edit.strRegulation}
                  onChange={(e) => handleFieldChange("strRegulation", e.target.value)}
                  className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="permitted">Permitted</option>
                  <option value="homestay-only">Homestay Only</option>
                  <option value="restricted">Restricted</option>
                  <option value="prohibited">Prohibited</option>
                </select>
              </AdminFormField>
            </div>

            {/* Schools */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Schools
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {[
                  ["elementary", "Elementary"],
                  ["middle", "Middle"],
                  ["high", "High"],
                  ["rating", "Rating (1-10)"],
                ].map(([field, label]) => (
                  <AdminFormField key={field} label={label}>
                    <input
                      value={
                        field === "rating"
                          ? edit.schools.rating
                          : edit.schools[field as "elementary" | "middle" | "high"]
                      }
                      onChange={(e) =>
                        handleFieldChange(`schools.${field}`, e.target.value)
                      }
                      className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </AdminFormField>
                ))}
              </div>
            </div>

            {/* Text areas */}
            <AdminFormField label="Description">
              <textarea
                value={edit.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                rows={2}
                className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </AdminFormField>
            <AdminFormField label="Overview">
              <textarea
                value={edit.overview}
                onChange={(e) => handleFieldChange("overview", e.target.value)}
                rows={5}
                className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </AdminFormField>
          </motion.div>
        )}
      </div>

      {toast && <AdminToast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}
