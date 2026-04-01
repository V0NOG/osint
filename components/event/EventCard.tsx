import Link from 'next/link'
import { Calendar, MapPin, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'
import { formatRelativeDate } from '@/lib/utils/format'
import { mockCountries } from '@/lib/mock-data/countries'
import type { GeopoliticalEvent } from '@/lib/types'

interface EventCardProps {
  event: GeopoliticalEvent
  className?: string
  variant?: 'compact' | 'full'
}

const eventTypeLabels: Record<string, string> = {
  military: 'Military',
  diplomatic: 'Diplomatic',
  economic: 'Economic',
  political: 'Political',
  humanitarian: 'Humanitarian',
  cyber: 'Cyber',
}

export function EventCard({ event, className, variant = 'full' }: EventCardProps) {
  const countries = event.countries
    .map((id) => mockCountries.find((c) => c.id === id)?.name)
    .filter(Boolean)

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
          <div className="flex items-center gap-1 text-[var(--color-text-tertiary)] flex-shrink-0">
            <Calendar className="w-3 h-3" strokeWidth={1.5} />
            <span className="text-[10px] font-medium">{formatRelativeDate(event.date)}</span>
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
          {countries.length > 0 && (
            <div className="flex items-center gap-1 text-[var(--color-text-tertiary)] min-w-0">
              <MapPin className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-[11px] truncate">
                {countries.slice(0, 2).join(', ')}
                {countries.length > 2 && ` +${countries.length - 2}`}
              </span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-1 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
          </div>
        </div>

        {/* Tags */}
        {variant === 'full' && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5 pt-2.5 border-t border-[var(--color-border)]">
            {event.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-white/4 text-[var(--color-text-tertiary)] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
