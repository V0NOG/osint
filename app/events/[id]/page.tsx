import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Globe, ExternalLink, Shield, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Panel } from '@/components/ui/Panel'
import { ForecastCard } from '@/components/forecast/ForecastCard'
import { mockEvents } from '@/lib/mock-data/events'
import { mockForecasts } from '@/lib/mock-data/forecasts'
import { mockCountries } from '@/lib/mock-data/countries'
import { mockActors } from '@/lib/mock-data/actors'
import { formatDate } from '@/lib/utils/format'

interface PageProps {
  params: { id: string }
}

export async function generateStaticParams() {
  return mockEvents.map((e) => ({ id: e.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const event = mockEvents.find((e) => e.id === params.id)
  return { title: event?.title ?? 'Event' }
}

const eventTypeLabels: Record<string, string> = {
  military: 'Military',
  diplomatic: 'Diplomatic',
  economic: 'Economic',
  political: 'Political',
  humanitarian: 'Humanitarian',
  cyber: 'Cyber',
}

const reliabilityLabels: Record<string, string> = {
  high: 'High Reliability',
  medium: 'Medium Reliability',
  low: 'Low Reliability / Unverified',
}

export default function EventDetailPage({ params }: PageProps) {
  const event = mockEvents.find((e) => e.id === params.id)
  if (!event) notFound()

  const countries = event.countries
    .map((id) => mockCountries.find((c) => c.id === id))
    .filter(Boolean)

  const actors = event.actors
    .map((id) => mockActors.find((a) => a.id === id))
    .filter(Boolean)

  const relatedForecasts = mockForecasts.filter((f) => event.relatedForecasts.includes(f.id))

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      {/* Back nav */}
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] mb-5 transition-colors duration-150"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        {/* Main content */}
        <div className="space-y-4">
          {/* Event header */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <Badge variant={`event-${event.eventType}`} size="md">
                {eventTypeLabels[event.eventType]}
              </Badge>
              <Badge variant={`severity-${event.severity}`} size="md">
                {event.severity} severity
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold text-[var(--color-text-primary)] leading-snug mb-3">
              {event.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-4 flex-wrap text-[var(--color-text-tertiary)] mb-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-xs font-medium">{formatDate(event.date)}</span>
              </div>
              {event.locationDescription && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="text-xs">{event.locationDescription}</span>
                </div>
              )}
            </div>

            {/* Summary */}
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {event.summary}
            </p>

            {/* Impact assessment */}
            {event.impactAssessment && (
              <div className="mt-4 p-3.5 rounded-lg bg-blue-500/5 border border-blue-500/15">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.75} />
                  <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider">
                    Impact Assessment
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {event.impactAssessment}
                </p>
              </div>
            )}

            {/* Tags */}
            {event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-[var(--color-border)]">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-1 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sources */}
          <Panel title="Sources" subtitle={`${event.sources.length} cited sources`}>
            <div className="divide-y divide-[var(--color-border)]">
              {event.sources.map((source, i) => (
                <div key={i} className="px-5 py-3.5 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <Badge variant={`reliability-${source.reliability}`} size="sm">
                        {reliabilityLabels[source.reliability]}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium text-[var(--color-text-primary)] leading-snug">
                      {source.title}
                    </p>
                    {source.publishedAt && (
                      <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1">
                        Published: {formatDate(source.publishedAt)}
                      </p>
                    )}
                  </div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-1.5 rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
                    title="Open source"
                  >
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </a>
                </div>
              ))}
            </div>
          </Panel>

          {/* Related forecasts */}
          {relatedForecasts.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                Related Forecasts
              </h2>
              <div className="space-y-2.5">
                {relatedForecasts.map((forecast) => (
                  <ForecastCard key={forecast.id} forecast={forecast} variant="compact" />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Countries involved */}
          {countries.length > 0 && (
            <Panel title="Countries Involved">
              <div className="divide-y divide-[var(--color-border)]">
                {countries.map((country) => country && (
                  <Link
                    key={country.id}
                    href={`/countries/${country.slug}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-[var(--color-bg-elevated)] transition-colors duration-150 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-5 rounded-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-[var(--color-text-tertiary)] font-mono">
                          {country.iso2}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors truncate">
                        {country.name}
                      </span>
                    </div>
                    <Badge variant={`risk-${country.riskLevel}`} size="sm">
                      {country.riskLevel}
                    </Badge>
                  </Link>
                ))}
              </div>
            </Panel>
          )}

          {/* Actors involved */}
          {actors.length > 0 && (
            <Panel title="Actors Involved">
              <div className="divide-y divide-[var(--color-border)]">
                {actors.map((actor) => actor && (
                  <div key={actor.id} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                        {actor.name}
                      </span>
                      <Badge
                        variant={
                          actor.riskContribution === 'high'
                            ? 'risk-high'
                            : actor.riskContribution === 'medium'
                            ? 'risk-moderate'
                            : 'risk-low'
                        }
                        size="sm"
                      >
                        {actor.riskContribution}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-tertiary)]">{actor.role}</p>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Event metadata */}
          <Panel title="Event Metadata">
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Event ID</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">{event.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Type</span>
                <Badge variant={`event-${event.eventType}`} size="sm">
                  {eventTypeLabels[event.eventType]}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Severity</span>
                <Badge variant={`severity-${event.severity}`} size="sm">
                  {event.severity}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Date</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">{event.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Sources</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">{event.sources.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Related Forecasts</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">{event.relatedForecasts.length}</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
