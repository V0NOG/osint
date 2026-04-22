import { Skeleton } from '@/components/ui/Skeleton'

export default function EventsLoading() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-8 w-48 rounded-lg" />
      </div>

      {/* Type distribution */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-3 space-y-2">
            <Skeleton className="h-7 w-10 mx-auto" />
            <Skeleton className="h-4 w-14 mx-auto rounded-full" />
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <Skeleton className="h-10 w-full rounded-lg mb-5" />

      {/* Event groups */}
      {['critical', 'high', 'moderate'].map((sev) => (
        <div key={sev} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-3 w-28" />
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {Array.from({ length: sev === 'critical' ? 2 : 4 }).map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
