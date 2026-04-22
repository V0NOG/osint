import { Skeleton } from '@/components/ui/Skeleton'

export default function CountryDetailLoading() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <Skeleton className="h-4 w-24 mb-5" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        <div className="space-y-4">
          {/* Hero */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-20 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-7 w-40" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-12 w-14 rounded-lg" />
            </div>
            {/* Risk bars */}
            <div className="space-y-2 pt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-3 w-20 flex-shrink-0" />
                  <Skeleton className="h-1.5 flex-1 rounded-full" />
                  <Skeleton className="h-3 w-6" />
                </div>
              ))}
            </div>
          </div>

          {/* Summary panel */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton variant="text" lines={4} />
          </div>

          {/* Events */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
              <Skeleton className="h-4 w-28" />
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
