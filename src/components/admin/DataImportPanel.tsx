"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileUp,
  Globe,
  Database,
  AlertTriangle,
  Check,
  RefreshCcw,
  Sparkles,
  ChevronRight,
  Eye,
  Plus,
  Table,
  Filter,
} from "lucide-react";
import { AdminSectionHeader, AdminFormField, AdminToast, useAdminAPI } from "./AdminLayout";

interface ImportedItem {
  id: string;
  address: string;
  neighborhood: string;
  neighborhoodId: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  propertyType: string;
  description: string;
}

export function DataImportPanel() {
  const api = useAdminAPI();
  const [importing, setImporting] = useState(false);
  const [importedItems, setImportedItems] = useState<ImportedItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [enriching, setEnriching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [importSource, setImportSource] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [craigslistUrl, setCraigslistUrl] = useState("");

  const handleImport = async (source: string) => {
    setImporting(true);
    setImportSource(source);
    setImportedItems([]);
    setSelectedIds(new Set());

    try {
      const body: Record<string, string> = { source };
      if (source === "craigslist" && craigslistUrl) body.url = craigslistUrl;

      const result = await api("import-data", body);
      if (result.items && result.items.length > 0) {
        setImportedItems(result.items);
        setToast(`Imported ${result.items.length} items from ${result.source || source}`);
      } else if (result.note) {
        setToast(result.note);
      } else {
        setToast("No items found or import not supported yet.");
      }
    } catch {
      setToast("Import failed. Check the server.");
    }
    setImporting(false);
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      setToast("Select a CSV file first.");
      return;
    }
    setImporting(true);
    setImportSource("csv-upload");

    try {
      const text = await csvFile.text();
      const lines = text.trim().split("\n");
      const headers = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/"/g, ""));
      const items: ImportedItem[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/"/g, ""));
        if (cols.length < 5) continue;

        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = cols[idx] || ""; });

        items.push({
          id: `csv-${Date.now()}-${i}`,
          address: row.address || row.street || "Unknown",
          neighborhood: row.neighborhood || "Unknown",
          neighborhoodId: (row.neighborhood || "unknown").toLowerCase().replace(/\s+/g, "-"),
          price: parseInt(row.price) || 0,
          beds: parseInt(row.beds || row.bedrooms) || 0,
          baths: parseFloat(row.baths || row.bathrooms) || 0,
          sqft: parseInt(row.sqft || row.square_feet) || 0,
          yearBuilt: parseInt(row.year_built || row.yearbuilt || row.year) || 0,
          propertyType: row.property_type || row.propertytype || row.type || "Single Family",
          description: row.description || "",
        });
      }

      setImportedItems(items);
      setToast(`Parsed ${items.length} listings from CSV.`);
    } catch {
      setToast("Failed to parse CSV. Check the format: address,price,beds,baths,sqft,neighborhood,year_built,property_type,description");
    }
    setImporting(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === importedItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(importedItems.map((i) => i.id)));
    }
  };

  const handleEnrichDescriptions = async () => {
    setEnriching(true);
    const selected = importedItems.filter((i) => selectedIds.has(i.id));
    const updated = await Promise.all(
      selected.map(async (item) => {
        try {
          const prompt = `Write a compelling real estate listing description for this Asheville, NC home. Keep it under 150 words, professional tone. Address: ${item.address}, Neighborhood: ${item.neighborhood}, ${item.beds} bed, ${item.baths} bath, ${item.sqft} sqft, built ${item.yearBuilt}, $${item.price.toLocaleString()}. Highlight the neighborhood's character.`;
          const res = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: "llama3.2", prompt, stream: false, options: { temperature: 0.7, num_predict: 300 } }),
          });
          if (res.ok) {
            const data = await res.json();
            return { ...item, description: data.response?.trim() || item.description };
          }
          return item;
        } catch {
          return item;
        }
      })
    );
    setImportedItems((prev) => prev.map((i) => (selectedIds.has(i.id) ? updated.find((u) => u.id === i.id) || i : i)));
    setToast(`Enriched ${selected.length} descriptions with AI.`);
    setEnriching(false);
  };

  const handleAddSelected = async () => {
    setAdding(true);
    const selected = importedItems.filter((i) => selectedIds.has(i.id));
    let added = 0;

    for (const item of selected) {
      const result = await api("save-admin-listing", {
        id: item.id,
        address: item.address,
        neighborhood: item.neighborhood,
        neighborhoodId: item.neighborhoodId,
        price: item.price,
        beds: item.beds,
        baths: item.baths,
        sqft: item.sqft,
        propertyType: item.propertyType,
        yearBuilt: item.yearBuilt,
        description: item.description,
        image: "",
        features: [],
        daysOnMarket: 0,
        priceChange: 0,
      });
      if (!result.error) added++;
    }

    setImportedItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
    setSelectedIds(new Set());
    setToast(`Added ${added} listings to the site.`);
    setAdding(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AdminSectionHeader
        title="Public Data Import"
        description="Import property data from public sources. All imports respect robots.txt and website terms."
      />

      {/* Warning box */}
      <div className="mb-8 p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">Read Before Importing</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Only import public data. Respect robots.txt and website terms of service.
            Do not mass-scrape Zillow, Realtor.com, Facebook, or Redfin — they prohibit automated access.
            This tool is designed for public government records and FSBO feeds only.
          </p>
        </div>
      </div>

      {/* Import cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Buncombe County Sales */}
        <motion.button
          onClick={() => handleImport("buncombe-sales")}
          disabled={importing}
          className="glass rounded-2xl p-6 text-left group"
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
            <Database className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-base font-semibold text-[var(--color-text-primary)] mb-1">
            Buncombe County Sales
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            Import recent public sales records from Buncombe County. Simulated for now — connect to real feed in production.
          </p>
          <span className="text-xs font-medium text-blue-400 group-hover:text-blue-300 transition-colors flex items-center gap-1">
            {importing && importSource === "buncombe-sales" ? (
              <><RefreshCcw className="w-3 h-3 animate-spin" /> Importing...</>
            ) : (
              <><Download className="w-3 h-3" /> Import Recent Sales</>
            )}
          </span>
        </motion.button>

        {/* Craigslist */}
        <motion.button
          onClick={() => handleImport("craigslist")}
          disabled={importing}
          className="glass rounded-2xl p-6 text-left group"
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
            <Globe className="w-5 h-5 text-purple-400" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-base font-semibold text-[var(--color-text-primary)] mb-1">
            Craigslist Asheville
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            Import FSBO listings from Craigslist. Single page only, respectful rate limits. URL input below.
          </p>
          <AdminFormField label="Craigslist Page URL">
            <input
              type="text"
              value={craigslistUrl}
              onChange={(e) => { e.stopPropagation(); setCraigslistUrl(e.target.value); }}
              onClick={(e) => e.stopPropagation()}
              placeholder="https://asheville.craigslist.org/..."
              className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500/50 text-[var(--color-text-primary)] mt-2"
            />
          </AdminFormField>
          <span className="text-xs font-medium text-purple-400 group-hover:text-purple-300 transition-colors flex items-center gap-1 mt-3">
            <Download className="w-3 h-3" /> Import FSBO Listings
          </span>
        </motion.button>

        {/* CSV Upload */}
        <motion.div
          className="glass rounded-2xl p-6 text-left group relative"
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
            <FileUp className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-base font-semibold text-[var(--color-text-primary)] mb-1">
            Bulk CSV Upload
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            Upload a CSV with FSBO or self-compiled listings. Columns: address, price, beds, baths, sqft, neighborhood, year_built, property_type, description
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:text-xs file:font-medium file:bg-emerald-500/10 file:text-emerald-400 file:border file:border-emerald-500/20 file:cursor-pointer hover:file:bg-emerald-500/20 transition-colors"
          />
          <motion.button
            onClick={handleCsvUpload}
            disabled={importing || !csvFile}
            className="flex items-center gap-1.5 mt-3 text-xs font-medium text-amber-400 hover:text-amber-300 disabled:opacity-50 transition-colors"
            whileHover={!importing ? { x: 2 } : {}}
          >
            {importing && importSource === "csv-upload" ? (
              <><RefreshCcw className="w-3 h-3 animate-spin" /> Uploading...</>
            ) : (
              <><FileUp className="w-3 h-3" /> Upload & Parse CSV</>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Imported Items Table */}
      <AnimatePresence>
        {importedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
                  Imported Items
                </h3>
                <span className="text-xs text-slate-500">{importedItems.length} listings</span>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={handleEnrichDescriptions}
                  disabled={enriching || selectedIds.size === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 disabled:opacity-50 hover:bg-purple-500/20 transition-colors"
                  whileHover={!enriching ? { scale: 1.02 } : {}}
                  whileTap={!enriching ? { scale: 0.98 } : {}}
                >
                  {enriching ? (
                    <RefreshCcw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  Enrich with AI
                </motion.button>
                <motion.button
                  onClick={handleAddSelected}
                  disabled={adding || selectedIds.size === 0}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white disabled:opacity-50 shadow-lg shadow-emerald-500/25"
                  whileHover={!adding ? { scale: 1.02 } : {}}
                  whileTap={!adding ? { scale: 0.98 } : {}}
                >
                  {adding ? "Adding..." : (
                    <><Plus className="w-3 h-3" /> Add Selected to Site</>
                  )}
                </motion.button>
              </div>
            </div>

            <div className="glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-glass-border)]">
                      <th className="p-3">
                        <button onClick={toggleSelectAll} className="w-4 h-4 rounded border border-[var(--color-glass-border)] flex items-center justify-center hover:border-emerald-500/50 transition-colors">
                          {selectedIds.size === importedItems.length && importedItems.length > 0 && (
                            <Check className="w-3 h-3 text-emerald-400" />
                          )}
                        </button>
                      </th>
                      <th className="p-3 font-semibold uppercase tracking-wider text-slate-500">Address</th>
                      <th className="p-3 font-semibold uppercase tracking-wider text-slate-500">Neighborhood</th>
                      <th className="p-3 font-semibold uppercase tracking-wider text-slate-500">Price</th>
                      <th className="p-3 font-semibold uppercase tracking-wider text-slate-500">Beds</th>
                      <th className="p-3 font-semibold uppercase tracking-wider text-slate-500">Baths</th>
                      <th className="p-3 font-semibold uppercase tracking-wider text-slate-500">SqFt</th>
                      <th className="p-3 font-semibold uppercase tracking-wider text-slate-500">Year</th>
                      <th className="p-3 font-semibold uppercase tracking-wider text-slate-500">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importedItems.map((item) => (
                      <tr key={item.id} className="border-b border-[var(--color-glass-border)]/50 hover:bg-[var(--color-bg-secondary)]/30 transition-colors">
                        <td className="p-3">
                          <button onClick={() => toggleSelect(item.id)} className="w-4 h-4 rounded border border-[var(--color-glass-border)] flex items-center justify-center hover:border-emerald-500/50 transition-colors">
                            {selectedIds.has(item.id) && <Check className="w-3 h-3 text-emerald-400" />}
                          </button>
                        </td>
                        <td className="p-3 text-[var(--color-text-secondary)] max-w-[180px] truncate">{item.address}</td>
                        <td className="p-3 text-[var(--color-text-secondary)]">{item.neighborhood}</td>
                        <td className="p-3 text-[var(--color-text-secondary)] font-medium">${item.price?.toLocaleString()}</td>
                        <td className="p-3 text-[var(--color-text-secondary)]">{item.beds}</td>
                        <td className="p-3 text-[var(--color-text-secondary)]">{item.baths}</td>
                        <td className="p-3 text-[var(--color-text-secondary)]">{item.sqft?.toLocaleString()}</td>
                        <td className="p-3 text-[var(--color-text-secondary)]">{item.yearBuilt || "-"}</td>
                        <td className="p-3 text-[var(--color-text-secondary)]">{item.propertyType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && <AdminToast message={toast} onDone={() => setToast(null)} />}
    </motion.div>
  );
}
