export function NeighborhoodsSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-8">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-full mb-6" />
        <div className="h-12 w-96 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
        <div className="h-5 w-128 bg-slate-200 dark:bg-slate-700 rounded-lg mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[var(--color-glass-border)] p-6 space-y-4"
            >
              <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              <div className="h-6 w-2/3 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
