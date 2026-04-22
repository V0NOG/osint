'use client'

import { Star } from 'lucide-react'
import { useWatchlist, type WatchlistEntityType } from '@/contexts/watchlist'
import { cn } from '@/lib/utils/cn'

interface WatchButtonProps {
  type: WatchlistEntityType
  id: string
  size?: 'sm' | 'md'
  className?: string
}

export function WatchButton({ type, id, size = 'md', className }: WatchButtonProps) {
  const { isWatched, watch, unwatch } = useWatchlist()
  const watched = isWatched(type, id)

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (watched) unwatch(type, id)
    else watch(type, id)
  }

  return (
    <button
      onClick={toggle}
      title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
      aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
      className={cn(
        'flex items-center justify-center rounded-lg border transition-all duration-150',
        size === 'sm' ? 'w-7 h-7' : 'w-8 h-8',
        watched
          ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
          : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-secondary)]',
        className
      )}
    >
      <Star
        className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}
        strokeWidth={1.75}
        fill={watched ? 'currentColor' : 'none'}
      />
    </button>
  )
}
