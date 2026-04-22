import { Skeleton } from '@/components/ui/Skeleton'

export default function ForecastsLoading() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <Skeleton className="h-10 w-full rounded-lg mb-5" />

      {/* Cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-5 w-5/6" />
            <Skeleton variant="text" lines={2} />
            <div className="pt-1">
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
