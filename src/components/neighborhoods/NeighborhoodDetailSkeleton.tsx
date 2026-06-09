export function NeighborhoodDetailSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="h-[40vh] max-h-[400px] bg-slate-200 dark:bg-slate-700" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="space-y-3">
          <div className="h-12 w-96 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-5 w-128 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--color-glass-border)] p-6 space-y-4">
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
