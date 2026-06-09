export function BlogPostSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="h-[50vh] max-h-[500px] bg-slate-200 dark:bg-slate-700" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="space-y-3">
          <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
        <div className="flex gap-4">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3 pt-4">
            <div className="h-6 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
