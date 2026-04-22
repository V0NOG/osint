'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Star, Flag, Zap, Target, Loader2, X, Plus, AlertCircle
} from 'lucide-react'
import { useWatchlist } from '@/contexts/watchlist'
import { Badge } from '@/components/ui/Badge'
import { WatchButton } from '@/components/ui/WatchButton'
import { formatRelativeDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { Country, GeopoliticalEvent, Forecast } from '@/lib/types'

interface WatchlistData {
  countries: Country[]
  events: GeopoliticalEvent[]
  forecasts: Forecast[]
}

const SEVERITY_CLASS: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  moderate: 'text-amber-400',
  low: 'text-blue-400',
}

export function WatchlistView() {
  const { watchlist, totalCount } = useWatchlist()
  const [data, setData] = useState<WatchlistData>({ countries: [], events: [], forecasts: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (totalCount === 0) {
      setData({ countries: [], events: [], forecasts: [] })
      return
    }

    setLoading(true)
    setError(null)

    fetch('/api/watchlist/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        countryIds: watchlist.countries,
        eventIds: watchlist.events,
        forecastIds: watchlist.forecasts,
      }),
    })
      .then((r) => r.json())
      .then((d: WatchlistData) => setData(d))
      .catch(() => setError('Failed to load watchlist data'))
      .finally(() => setLoading(false))
  }, [watchlist, totalCount])

  const isEmpty = totalCount === 0

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Star className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Watchlist</h1>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {isEmpty
              ? 'Track countries, events, and forecasts important to you'
              : `${totalCount} item${totalCount !== 1 ? 's' : ''} tracked — ${watchlist.countries.length} countries, ${watchlist.events.length} events, ${watchlist.forecasts.length} forecasts`}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/5 border border-red-500/20 mb-5">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <div className="w-14 h-14 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
            <Star className="w-7 h-7 text-[var(--color-text-tertiary)]" strokeWidth={1.25} />
          </div>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">
            Your watchlist is empty
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto leading-relaxed mb-6">
            Click the <Star className="inline w-3.5 h-3.5 mb-0.5" strokeWidth={1.75} /> star icon on any country, event, or forecast to add it here.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {[
              { href: '/countries', icon: Flag, label: 'Browse Countries' },
              { href: '/events', icon: Zap, label: 'Browse Events' },
              { href: '/forecasts', icon: Target, label: 'Browse Forecasts' },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] transition-all duration-150"
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-5 h-5 text-[var(--color-text-tertiary)] animate-spin" strokeWidth={1.5} />
        </div>
      )}

      {/* Content */}
      {!loading && !isEmpty && (
        <div className="space-y-6">
          {/* Countries */}
          {data.countries.length > 0 && (
            <section>
              <SectionHeader icon={Flag} label="Countries" count={data.countries.length} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.countries.map((country) => (
                  <Link
                    key={country.id}
                    href={`/countries/${country.slug}`}
                    className="group flex items-start justify-between gap-3 p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)] transition-all duration-150"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold font-mono text-[var(--color-text-tertiary)]">
                          {country.iso2}
                        </span>
                        <Badge variant={`risk-${country.riskLevel}`} size="sm">
                          {country.riskLevel}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                        {country.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                        Risk score: {country.overallRiskScore}
                      </p>
                    </div>
                    <WatchButton type="country" id={country.id} size="sm" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Events */}
          {data.events.length > 0 && (
            <section>
              <SectionHeader icon={Zap} label="Events" count={data.events.length} />
              <div className="space-y-2">
                {data.events.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="group flex items-start justify-between gap-3 p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)] transition-all duration-150"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <Badge variant={`event-${event.eventType}`} size="sm">
                          {event.eventType}
                        </Badge>
                        <span className={cn('text-[11px] font-medium', SEVERITY_CLASS[event.severity])}>
                          {event.severity}
                        </span>
                        <span className="text-[11px] text-[var(--color-text-tertiary)] font-mono">
                          {formatRelativeDate(event.date)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)] leading-snug line-clamp-2">
                        {event.title}
                      </p>
                    </div>
                    <WatchButton type="event" id={event.id} size="sm" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Forecasts */}
          {data.forecasts.length > 0 && (
            <section>
              <SectionHeader icon={Target} label="Forecasts" count={data.forecasts.length} />
              <div className="space-y-2">
                {data.forecasts.map((forecast) => (
                  <Link
                    key={forecast.id}
                    href={`/forecasts/${forecast.id}`}
                    className="group flex items-start justify-between gap-3 p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)] transition-all duration-150"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <Badge variant={`status-${forecast.status}`} size="sm">
                          {forecast.status}
                        </Badge>
                        <span className="text-[11px] text-[var(--color-text-tertiary)]">
                          {forecast.timeHorizon}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)] leading-snug line-clamp-2 mb-1">
                        {forecast.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-20 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${forecast.probability}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-[var(--color-text-secondary)]">
                          {forecast.probability}%
                        </span>
                      </div>
                    </div>
                    <WatchButton type="forecast" id={forecast.id} size="sm" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Placeholders for empty sections */}
          {totalCount > 0 && data.countries.length === 0 && data.events.length === 0 && data.forecasts.length === 0 && (
            <p className="text-sm text-[var(--color-text-tertiary)] text-center py-8">
              Loading watchlist items…
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function SectionHeader({ icon: Icon, label, count }: { icon: React.ElementType; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
      <span className="text-sm font-semibold text-[var(--color-text-primary)]">{label}</span>
      <div className="flex-1 h-px bg-[var(--color-border)]" />
      <span className="text-[11px] text-[var(--color-text-tertiary)]">{count}</span>
    </div>
  )
}
