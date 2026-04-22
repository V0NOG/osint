import { Skeleton } from '@/components/ui/Skeleton'

export default function RegionsLoading() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="space-y-2 mb-5">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <Skeleton variant="text" lines={2} />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
