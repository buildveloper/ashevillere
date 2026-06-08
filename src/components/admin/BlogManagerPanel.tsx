"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit3, Eye, ArrowLeft, Clock, FileText } from "lucide-react";
import { AdminSectionHeader, AdminFormField, AdminToast, useAdminAPI } from "./AdminLayout";
import type { BlogPost, BlogCategory, BlogContentBlock } from "@/lib/blog";
import { ALL_CATEGORIES } from "@/lib/blog";

function emptyPost(): BlogPost {
  const slug = `post-${Date.now()}`;
  return {
    slug,
    title: "",
    excerpt: "",
    coverImage: "",
    category: "market-trends",
    date: new Date().toISOString().split("T")[0],
    readTime: 5,
    author: { name: "Alex Chen", avatar: "" },
    featured: false,
    tags: [],
    relatedPostSlugs: [],
    content: [],
    tableOfContents: [],
  };
}

export function BlogManagerPanel() {
  const api = useAdminAPI();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "edit" | "create">("list");
  const [editPost, setEditPost] = useState<BlogPost>(emptyPost());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api("get-blog-posts").then((data) => {
      if (Array.isArray(data)) setPosts(data);
      setLoading(false);
    });
  }, [api]);

  const handleCreate = () => {
    setEditPost(emptyPost());
    setView("create");
  };

  const handleEdit = (post: BlogPost) => {
    setEditPost({ ...post });
    setView("edit");
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const result = await api("delete-blog-post", { slug });
    if (!result.error) {
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
      setToast("Post deleted");
    }
  };

  const handleFieldChange = (field: string, value: string | number | boolean | string[] | { name: string; avatar: string }) => {
    setEditPost((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editPost.title.trim()) {
      setToast("Title is required");
      return;
    }
    setSaving(true);
    const result = await api("save-blog-post", editPost);
    if (!result.error) {
      setPosts((prev) => {
        const idx = prev.findIndex((p) => p.slug === editPost.slug);
        if (idx >= 0) return prev.map((p) => (p.slug === editPost.slug ? editPost : p));
        return [...prev, editPost];
      });
      setToast(view === "create" ? "Post created successfully" : "Post updated successfully");
      setView("list");
    } else {
      setToast("Save failed: " + result.error);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="h-64 rounded-xl shimmer-bg" />;
  }

  // ─── List View ───────────────────────────────────────────────────────────
  if (view === "list") {
    return (
      <>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Blog Posts
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {posts.length} post{posts.length !== 1 ? "s" : ""} — create, edit, or delete.
            </p>
          </div>
          <motion.button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus className="w-4 h-4" />
            New Post
          </motion.button>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {posts.map((post) => (
              <motion.div
                key={post.slug}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass rounded-xl p-4 flex items-center gap-4 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {post.title || "Untitled"}
                    </h3>
                    {post.featured && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium flex-shrink-0">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{post.category}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}m
                    </span>
                    <span>·</span>
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <motion.button
                    onClick={() => handleEdit(post)}
                    className="w-8 h-8 rounded-lg glass-hover flex items-center justify-center text-slate-400 hover:text-emerald-400"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(post.slug)}
                    className="w-8 h-8 rounded-lg glass-hover flex items-center justify-center text-slate-400 hover:text-red-400"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {posts.length === 0 && (
            <p className="text-center text-slate-500 py-12">No posts yet. Create your first one!</p>
          )}
        </div>

        {toast && <AdminToast message={toast} onDone={() => setToast(null)} />}
      </>
    );
  }

  // ─── Edit/Create View ─────────────────────────────────────────────────────
  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        <motion.button
          onClick={() => setView("list")}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
          whileHover={{ x: -2 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>
        <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
          {view === "create" ? "New Post" : "Edit Post"}
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5 max-w-2xl"
      >
        {/* Title */}
        <AdminFormField label="Title">
          <input
            value={editPost.title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            placeholder="Post title..."
            className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
          />
        </AdminFormField>

        {/* Slug */}
        <AdminFormField label="Slug">
          <input
            value={editPost.slug}
            onChange={(e) => handleFieldChange("slug", e.target.value)}
            className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm font-mono text-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </AdminFormField>

        {/* Row: Category, Date, Read Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <AdminFormField label="Category">
            <select
              value={editPost.category}
              onChange={(e) => handleFieldChange("category", e.target.value)}
              className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
            >
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace("-", " ")}
                </option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField label="Date">
            <input
              type="date"
              value={editPost.date}
              onChange={(e) => handleFieldChange("date", e.target.value)}
              className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
            />
          </AdminFormField>
          <AdminFormField label="Read Time (min)">
            <input
              type="number"
              value={editPost.readTime}
              onChange={(e) => handleFieldChange("readTime", parseInt(e.target.value) || 5)}
              className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </AdminFormField>
        </div>

        {/* Row: Author + Featured */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AdminFormField label="Author Name">
            <input
              value={editPost.author.name}
              onChange={(e) =>
                handleFieldChange("author", { ...editPost.author, name: e.target.value })
              }
              className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
            />
          </AdminFormField>
          <AdminFormField label="Featured">
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={editPost.featured}
                onChange={(e) => handleFieldChange("featured", e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span className="text-sm text-slate-400">Show as featured post</span>
            </label>
          </AdminFormField>
        </div>

        {/* Excerpt */}
        <AdminFormField label="Excerpt">
          <textarea
            value={editPost.excerpt}
            onChange={(e) => handleFieldChange("excerpt", e.target.value)}
            rows={3}
            placeholder="Brief summary shown on cards..."
            className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 resize-none"
          />
        </AdminFormField>

        {/* Tags */}
        <AdminFormField label="Tags (comma-separated)">
          <input
            value={editPost.tags.join(", ")}
            onChange={(e) =>
              handleFieldChange(
                "tags",
                e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              )
            }
            placeholder="market, trends, 2026..."
            className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
          />
        </AdminFormField>

        {/* Content blocks — simplified: edit as JSON for now */}
        <AdminFormField label="Content (JSON array of blocks)">
          <textarea
            value={JSON.stringify(editPost.content, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                if (Array.isArray(parsed)) handleFieldChange("content", parsed);
              } catch {
                // ignore parse errors during typing
              }
            }}
            rows={14}
            className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 resize-none"
          />
        </AdminFormField>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-glass-border)]">
          <motion.button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold disabled:opacity-50 shadow-lg shadow-emerald-500/25"
            whileHover={!saving ? { scale: 1.03 } : {}}
            whileTap={!saving ? { scale: 0.97 } : {}}
          >
            {saving ? "Saving..." : view === "create" ? "Create Post" : "Save Changes"}
          </motion.button>
          <motion.button
            onClick={() => setView("list")}
            className="px-6 py-2.5 rounded-xl glass text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>

      {toast && <AdminToast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}
