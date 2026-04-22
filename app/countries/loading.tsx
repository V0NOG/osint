import { Skeleton } from '@/components/ui/Skeleton'

export default function CountriesLoading() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-8 w-48 rounded-lg" />
      </div>

      {/* Filter bar */}
      <Skeleton className="h-10 w-full rounded-lg mb-5" />

      {/* Country cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-10 rounded" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-8 w-12 rounded" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <Skeleton variant="text" lines={2} />
          </div>
        ))}
      </div>
    </div>
  )
}
