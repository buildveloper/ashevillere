export function HomesForSaleSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-8">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
        <div className="h-5 w-96 bg-slate-200 dark:bg-slate-700 rounded-lg mb-8" />
        <div className="flex gap-3 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[var(--color-glass-border)] p-4 space-y-3"
            >
              <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="flex gap-2">
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
