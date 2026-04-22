'use client'

import Link from 'next/link'
import { Calendar, MapPin, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'
import { formatRelativeDate } from '@/lib/utils/format'
import { SOURCE_NAME_BIAS_MAP } from '@/lib/ingestion/adapters/sources'
import type { GeopoliticalEvent } from '@/lib/types'
import type { SourceBias } from '@/lib/ingestion/adapters/sources'

interface EventCardProps {
  event: GeopoliticalEvent
  className?: string
  variant?: 'compact' | 'full'
  countryMap?: Record<string, string>
  onTagClick?: (tag: string) => void
}

const eventTypeLabels: Record<string, string> = {
  military: 'Military',
  diplomatic: 'Diplomatic',
  economic: 'Economic',
  political: 'Political',
  humanitarian: 'Humanitarian',
  cyber: 'Cyber',
}

const BIAS_LABEL: Record<SourceBias, string> = {
  'left':         'L',
  'center-left':  'C-L',
  'center':       'C',
  'center-right': 'C-R',
  'right':        'R',
}

const BIAS_CLASS: Record<SourceBias, string> = {
  'left':         'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'center-left':  'bg-sky-500/15 text-sky-400 border-sky-500/25',
  'center':       'bg-white/8 text-[var(--color-text-tertiary)] border-white/10',
  'center-right': 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  'right':        'bg-red-500/15 text-red-400 border-red-500/25',
}

export function EventCard({ event, className, variant = 'full', countryMap, onTagClick }: EventCardProps) {
  const countryNames = event.countries
    .map((id) => countryMap?.[id])
    .filter(Boolean) as string[]

  // Derive bias from the first source's display name
  const primarySourceName = event.sources[0]?.title
  const bias: SourceBias | undefined = primarySourceName
    ? SOURCE_NAME_BIAS_MAP[primarySourceName]
    : undefined

  return (
    <Link href={`/events/${event.id}`} className="block group">
      <div
        className={cn(
          'bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg',
          'hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-strong)]',
          'transition-all duration-150',
          variant === 'compact' ? 'p-3' : 'p-4',
          className
        )}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={`event-${event.eventType}`}>
              {eventTypeLabels[event.eventType]}
            </Badge>
            <Badge variant={`severity-${event.severity}`}>
              {event.severity}
            </Badge>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {bias && (
              <span
                className={cn(
                  'text-[9px] font-bold px-1.5 py-0.5 rounded border tracking-wider',
                  BIAS_CLASS[bias]
                )}
                title={`Source bias: ${bias}`}
              >
                {BIAS_LABEL[bias]}
              </span>
            )}
            <div className="flex items-center gap-1 text-[var(--color-text-tertiary)]">
              <Calendar className="w-3 h-3" strokeWidth={1.5} />
              <span className="text-[10px] font-medium">{formatRelativeDate(event.date)}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3
          className={cn(
            'font-semibold text-[var(--color-text-primary)] group-hover:text-white transition-colors duration-150 leading-snug mb-1.5',
            variant === 'compact' ? 'text-xs' : 'text-sm'
          )}
        >
          {event.title}
        </h3>

        {/* Summary — only in full variant */}
        {variant === 'full' && (
          <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-3 leading-relaxed">
            {event.summary}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3">
          {countryNames.length > 0 && (
            <div className="flex items-center gap-1 text-[var(--color-text-tertiary)] min-w-0">
              <MapPin className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-[11px] truncate">
                {countryNames.slice(0, 2).join(', ')}
                {countryNames.length > 2 && ` +${countryNames.length - 2}`}
              </span>
            </div>
          )}
          {primarySourceName && (
            <span className="text-[10px] text-[var(--color-text-tertiary)] truncate max-w-[120px]">
              {primarySourceName}
            </span>
          )}
          <div className="ml-auto flex items-center gap-1 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
          </div>
        </div>

        {/* Tags */}
        {variant === 'full' && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5 pt-2.5 border-t border-[var(--color-border)]">
            {event.tags.slice(0, 4).map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  if (onTagClick) {
                    e.preventDefault()
                    e.stopPropagation()
                    onTagClick(tag)
                  }
                }}
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded bg-white/4 text-[var(--color-text-tertiary)] font-medium border border-transparent transition-colors',
                  onTagClick && 'hover:bg-white/10 hover:text-[var(--color-text-secondary)] hover:border-white/10 cursor-pointer'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
