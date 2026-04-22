import { Skeleton } from '@/components/ui/Skeleton'

export default function ActorDetailLoading() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <Skeleton className="h-3 w-20 mb-5" />

      {/* Hero */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-5 space-y-4">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-28 rounded" />
              <Skeleton className="h-5 w-36 rounded-full" />
            </div>
          </div>
        </div>
        <Skeleton className="h-3 w-40" />
        <Skeleton variant="text" lines={3} />
        <div className="flex gap-1.5 border-t border-[var(--color-border)] pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-20 rounded" />
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
        <Skeleton variant="card" className="h-64" />
      </div>
    </div>
  )
}
