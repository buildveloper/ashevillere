"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  MapPin,
  Home,
  TrendingUp,
  Building2,
  Wrench,
  BarChart3,
  BookOpen,
  Calculator,
  ClipboardCheck,
  Calendar,
  AlertTriangle,
  Scale,
  Sparkles,
  Truck,
  Clock,
  ArrowUpRight,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Trash2,
} from "lucide-react";
import {
  buildSearchIndex,
  searchAll,
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
  type SearchResult,
  type ResultType,
} from "@/lib/search";

// ─── Icon map ───

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Home,
  MapPin,
  TrendingUp,
  Building2,
  Wrench,
  BarChart3,
  BookOpen,
  Calculator,
  ClipboardCheck,
  Calendar,
  AlertTriangle,
  Scale,
  Sparkles,
  Truck,
};

// ─── Type label + color ───

const TYPE_CONFIG: Record<ResultType, { label: string; color: string; bg: string }> = {
  neighborhood: { label: "Neighborhood", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  listing: { label: "Home for Sale", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  tool: { label: "Tool", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  "market-insight": { label: "Market Insight", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  "str-info": { label: "STR Info", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
  resource: { label: "Resource", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  page: { label: "Page", color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20" },
  article: { label: "Article", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
};

// ─── Context to expose openSearch globally ───

interface SearchContextValue {
  openSearch: (query?: string) => void;
  isOpen: boolean;
}

const SearchContext = createContext<SearchContextValue>({
  openSearch: () => {},
  isOpen: false,
});

export function useSearch() {
  return useContext(SearchContext);
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");

  const openSearch = useCallback((query?: string) => {
    setInitialQuery(query || "");
    setIsOpen(true);
  }, []);

  return (
    <SearchContext.Provider value={{ openSearch, isOpen }}>
      {children}
      <GlobalSearchOverlay
        isOpen={isOpen}
        initialQuery={initialQuery}
        onClose={() => setIsOpen(false)}
      />
    </SearchContext.Provider>
  );
}

// ─── Keyboard shortcut hook ───

function useKeyboardShortcut() {
  const { openSearch, isOpen } = useSearch();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) openSearch();
      }
      if (e.key === "Escape" && isOpen) {
        // handled in the overlay
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [openSearch, isOpen]);
}

// ─── Result row component ───

function ResultRow({
  result,
  active,
  onClick,
  onHover,
}: {
  result: SearchResult;
  active: boolean;
  onClick: () => void;
  onHover: () => void;
}) {
  const Icon = ICON_MAP[result.icon] || Sparkles;
  const cfg = TYPE_CONFIG[result.type];

  return (
    <motion.button
      layout
      onClick={onClick}
      onMouseEnter={onHover}
      className={`w-full text-left px-4 py-3 rounded-xl flex items-start gap-3.5 transition-colors group ${
        active
          ? "bg-emerald-500/10 border border-emerald-500/20"
          : "hover:bg-white/5 border border-transparent"
      }`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Icon */}
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
          active ? "bg-emerald-500/20" : "bg-white/5 group-hover:bg-white/10"
        } transition-colors`}
      >
        <Icon
          className={`w-4 h-4 ${active ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-300"} transition-colors`}
          strokeWidth={1.5}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {result.title}
          </span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} flex-shrink-0`}>
            {cfg.label}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
          {result.subtitle}
        </p>
      </div>

      {/* Arrow indicator when active */}
      <motion.span
        className="flex-shrink-0 self-center"
        animate={{ opacity: active ? 1 : 0, x: active ? 0 : -4 }}
        transition={{ duration: 0.15 }}
      >
        <CornerDownLeft className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
      </motion.span>
    </motion.button>
  );
}

// ─── Category section ───

function CategorySection({
  type,
  results,
  activeId,
  onSelect,
  onHover,
}: {
  type: ResultType;
  results: SearchResult[];
  activeId: string | null;
  onSelect: (r: SearchResult) => void;
  onHover: (id: string) => void;
}) {
  if (results.length === 0) return null;

  const cfg = TYPE_CONFIG[type];

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${cfg.color}`}>
          {cfg.label}s
        </span>
        <span className="flex-1 h-px bg-gradient-to-r from-current to-transparent opacity-10" />
      </div>
      <div className="space-y-0.5">
        {results.slice(0, 3).map((r) => (
          <ResultRow
            key={r.id}
            result={r}
            active={activeId === r.id}
            onClick={() => onSelect(r)}
            onHover={() => onHover(r.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main overlay component ───

function GlobalSearchOverlay({
  isOpen,
  initialQuery,
  onClose,
}: {
  isOpen: boolean;
  initialQuery: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build search index once
  const index = useMemo(() => buildSearchIndex(), []);

  // Recent searches
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
    }
  }, [isOpen]);

  // Set initial query when opening
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setActiveIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialQuery]);

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchAll(query, index);
  }, [query, index]);

  // Group results by type
  const grouped = useMemo(() => {
    const map = new Map<ResultType, SearchResult[]>();
    for (const r of results) {
      const existing = map.get(r.type) || [];
      existing.push(r);
      map.set(r.type, existing);
    }
    return Array.from(map.entries());
  }, [results]);

  // Flattened list for keyboard nav
  const flatResults = useMemo(() => results, [results]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [results.length]);

  const navigate = useCallback(
    (result: SearchResult) => {
      addRecentSearch(query);
      onClose();
      router.push(result.href);
    },
    [query, onClose, router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        if (query) {
          setQuery("");
          setActiveIndex(-1);
        } else {
          onClose();
        }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((p) => Math.min(p + 1, flatResults.length - 1));
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((p) => Math.max(p - 1, -1));
        return;
      }

      if (e.key === "Enter" && activeIndex >= 0 && flatResults[activeIndex]) {
        e.preventDefault();
        navigate(flatResults[activeIndex]);
        return;
      }

      if (e.key === "Enter" && flatResults.length > 0) {
        e.preventDefault();
        navigate(flatResults[0]);
      }
    },
    [query, flatResults, activeIndex, navigate, onClose]
  );

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const el = listRef.current.querySelector(`[data-result-index="${activeIndex}"]`);
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Search panel */}
          <motion.div
            className="fixed inset-x-4 top-[10vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-[210] w-full sm:w-[640px] max-h-[75vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          >
            <div className="glass-strong rounded-2xl shadow-2xl border border-emerald-500/10 flex flex-col overflow-hidden max-h-[75vh]">
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-glass-border)]">
                <Search className="w-5 h-5 text-emerald-400 flex-shrink-0" strokeWidth={1.5} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search neighborhoods, homes, tools, insights..."
                  className="flex-1 bg-transparent border-none text-base text-gray-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
                {query && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="w-7 h-7 rounded-full glass-hover flex items-center justify-center text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </motion.button>
                )}
                <div className="flex items-center gap-1">
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded-md bg-slate-800/50 text-[10px] text-slate-500 font-medium border border-slate-700/50">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                  <motion.button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full glass-hover flex items-center justify-center text-slate-400 hover:text-slate-200"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </motion.button>
                </div>
              </div>

              {/* Results area */}
              <div className="flex-1 overflow-y-auto scrollbar-none" ref={listRef}>
                {/* No query — show recent searches */}
                {!query.trim() && (
                  <div className="p-5 space-y-4">
                    {/* Empty state */}
                    {recentSearches.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-8"
                      >
                        <Search className="w-10 h-10 mx-auto text-slate-500/30 mb-3" strokeWidth={1} />
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                          Search across neighborhoods, homes, tools, market insights, STR info, and resources.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {["West Asheville", "homes under $500K", "mortgage calculator", "STR regulations", "moving checklist"].map(
                            (suggestion) => (
                              <motion.button
                                key={suggestion}
                                onClick={() => setQuery(suggestion)}
                                className="px-3 py-1.5 rounded-full glass text-[11px] font-medium text-slate-400 hover:text-emerald-400 transition-colors"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                              >
                                {suggestion}
                              </motion.button>
                            )
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Recent searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Recent Searches
                          </span>
                          <button
                            onClick={() => {
                              clearRecentSearches();
                              setRecentSearches([]);
                            }}
                            className="text-[10px] text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                            Clear
                          </button>
                        </div>
                        <div className="space-y-1">
                          {recentSearches.map((recent, i) => (
                            <motion.button
                              key={recent}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              onClick={() => setQuery(recent)}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-colors flex items-center gap-2 group"
                            >
                              <Clock className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-500/60 transition-colors" strokeWidth={1.5} />
                              {recent}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick links */}
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-3">
                        Quick Navigation
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { label: "Neighborhoods", href: "/neighborhoods", icon: Building2, color: "emerald" },
                          { label: "Homes for Sale", href: "/homes-for-sale", icon: Home, color: "cyan" },
                          { label: "Market Reports", href: "/market-reports", icon: TrendingUp, color: "purple" },
                          { label: "Tools", href: "/tools", icon: Wrench, color: "amber" },
                          { label: "STR Insights", href: "/str-insights", icon: BarChart3, color: "pink" },
                          { label: "Resources", href: "/resources", icon: BookOpen, color: "blue" },
                        ].map((q) => (
                          <motion.button
                            key={q.label}
                            onClick={() => {
                              onClose();
                              router.push(q.href);
                            }}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl glass text-xs font-medium text-slate-400 hover:text-white transition-colors group"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <q.icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" strokeWidth={1.5} />
                            {q.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Has query — show results */}
                {query.trim() && results.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12 px-5"
                  >
                    <Search className="w-10 h-10 mx-auto text-slate-500/30 mb-3" strokeWidth={1} />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      No results for &quot;{query}&quot;
                    </p>
                    <p className="text-[11px] text-slate-500 mb-4">
                      Try a different search term or browse categories below.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {["West Asheville", "homes for sale", "mortgage", "STR permit", "moving"].map((s) => (
                        <button
                          key={s}
                          onClick={() => setQuery(s)}
                          className="px-3 py-1.5 rounded-full glass text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Has query — show result groups */}
                {query.trim() && results.length > 0 && (
                  <div className="p-4 space-y-5">
                    {grouped.map(([type, items]) => (
                      <CategorySection
                        key={type}
                        type={type}
                        results={items}
                        activeId={activeIndex >= 0 ? flatResults[activeIndex]?.id ?? null : null}
                        onSelect={navigate}
                        onHover={(id) => {
                          const idx = flatResults.findIndex((r) => r.id === id);
                          if (idx >= 0) setActiveIndex(idx);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-2.5 border-t border-[var(--color-glass-border)] text-[10px] text-slate-600">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <ArrowUp className="w-3 h-3" strokeWidth={1.5} />
                    <ArrowDown className="w-3 h-3" strokeWidth={1.5} />
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <CornerDownLeft className="w-3 h-3" strokeWidth={1.5} />
                    Select
                  </span>
                  <span>Esc Close</span>
                </div>
                <span>
                  {results.length > 0
                    ? `${results.length} result${results.length === 1 ? "" : "s"}`
                    : "Type to search"}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Hook to wire keyboard shortcut ───

export function useGlobalSearchKeyboardShortcut() {
  useKeyboardShortcut();
}
