import { Skeleton } from '@/components/ui/Skeleton'

export default function ForecastDetailLoading() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <Skeleton className="h-4 w-28 mb-5" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <div className="space-y-4">
          {/* Hero */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-7 w-4/5" />
            {/* Probability bar row */}
            <div className="flex items-center gap-4 bg-black/20 rounded-lg px-4 py-3">
              <div className="space-y-1 flex-shrink-0">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-14" />
              </div>
              <Skeleton className="h-2 flex-1 rounded-full" />
              <div className="space-y-1 flex-shrink-0 text-right">
                <Skeleton className="h-3 w-16 ml-auto" />
                <Skeleton className="h-5 w-12 ml-auto" />
              </div>
            </div>
            <Skeleton variant="text" lines={2} />
          </div>

          {/* Chart */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton variant="chart" className="h-32" />
          </div>

          {/* Panels */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton variant="text" lines={3} />
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
            <Skeleton className="h-4 w-20" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
            <Skeleton className="h-4 w-28" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
