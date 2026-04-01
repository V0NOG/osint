import { cn } from '@/lib/utils/cn'

type SkeletonVariant = 'text' | 'card' | 'avatar' | 'chart' | 'block'

interface SkeletonProps {
  variant?: SkeletonVariant
  className?: string
  lines?: number
}

function SkeletonBase({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded',
        'bg-[length:1000px_100%]',
        className
      )}
      style={style}
    />
  )
}

export function Skeleton({ variant = 'block', className, lines = 3 }: SkeletonProps) {
  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBase
            key={i}
            className={cn(
              'h-3',
              i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
            )}
          />
        ))}
      </div>
    )
  }

  if (variant === 'avatar') {
    return <SkeletonBase className={cn('w-10 h-10 rounded-full', className)} />
  }

  if (variant === 'card') {
    return (
      <div
        className={cn(
          'bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-4 space-y-3',
          className
        )}
      >
        <SkeletonBase className="h-4 w-2/3" />
        <SkeletonBase className="h-3 w-full" />
        <SkeletonBase className="h-3 w-5/6" />
        <div className="flex gap-2 pt-1">
          <SkeletonBase className="h-5 w-16 rounded" />
          <SkeletonBase className="h-5 w-20 rounded" />
        </div>
      </div>
    )
  }

  if (variant === 'chart') {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-end gap-1 h-20">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBase
              key={i}
              className="flex-1 rounded-t"
              style={{ height: `${30 + Math.random() * 70}%` }}
            />
          ))}
        </div>
        <SkeletonBase className="h-3 w-full" />
      </div>
    )
  }

  return <SkeletonBase className={cn('h-4 w-full', className)} />
}
