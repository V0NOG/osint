import { Skeleton } from '@/components/ui/Skeleton'

export default function WorldLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Stat bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]/50 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_320px] overflow-hidden">
        <div className="flex flex-col p-6 gap-4 overflow-y-auto">
          {/* Globe placeholder */}
          <div className="w-full rounded-xl overflow-hidden" style={{ minHeight: 420 }}>
            <Skeleton className="w-full h-full min-h-[420px]" />
          </div>

          {/* Regions strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-3 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>

          {/* Forecasts strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="border-l border-[var(--color-border)] p-4 space-y-3 overflow-y-auto">
          <Skeleton className="h-5 w-24 mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="p-3" />
          ))}
        </div>
      </div>
    </div>
  )
}
