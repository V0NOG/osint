import { Skeleton } from '@/components/ui/Skeleton'

export default function EventDetailLoading() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <Skeleton className="h-4 w-24 mb-5" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <div className="space-y-4">
          {/* Hero */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-7 w-4/5" />
            <Skeleton variant="text" lines={3} />
          </div>

          {/* Source panel */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-3">
            <Skeleton className="h-4 w-24" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-16 rounded" />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
            <Skeleton className="h-4 w-24" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
            <Skeleton className="h-4 w-28" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
