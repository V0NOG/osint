import { Skeleton } from '@/components/ui/Skeleton'

export default function ActorsLoading() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="space-y-2 mb-5">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-52" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-2.5"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton variant="text" lines={2} />
            <div className="flex gap-1 pt-0.5">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
