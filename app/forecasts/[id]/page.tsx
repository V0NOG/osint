import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, ChevronUp, ChevronDown, Minus, BookOpen, Scale, AlertCircle, History, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Panel } from '@/components/ui/Panel'
import { EventCard } from '@/components/event/EventCard'
import { mockForecasts } from '@/lib/mock-data/forecasts'
import { mockEvents } from '@/lib/mock-data/events'
import { mockCountries } from '@/lib/mock-data/countries'
import { formatDate } from '@/lib/utils/format'
import { getProbabilityColor } from '@/lib/utils/risk'
import { cn } from '@/lib/utils/cn'

interface PageProps {
  params: { id: string }
}

export async function generateStaticParams() {
  return mockForecasts.map((f) => ({ id: f.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const forecast = mockForecasts.find((f) => f.id === params.id)
  return { title: forecast?.title ?? 'Forecast' }
}

function ProbabilityBar({ probability }: { probability: number }) {
  const color =
    probability >= 70
      ? '#ef4444'
      : probability >= 50
      ? '#f97316'
      : probability >= 30
      ? '#f59e0b'
      : '#22c55e'

  return (
    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${probability}%`, backgroundColor: color, opacity: 0.8 }}
      />
    </div>
  )
}

function HistoryDiff({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous
  if (Math.abs(diff) < 1)
    return <span className="text-[var(--color-text-tertiary)] text-xs">→ No change</span>
  if (diff > 0)
    return (
      <span className="text-red-400 text-xs font-medium flex items-center gap-0.5">
        <ChevronUp className="w-3 h-3" />
        +{diff}pp
      </span>
    )
  return (
    <span className="text-green-400 text-xs font-medium flex items-center gap-0.5">
      <ChevronDown className="w-3 h-3" />
      {diff}pp
    </span>
  )
}

export default function ForecastDetailPage({ params }: PageProps) {
  const forecast = mockForecasts.find((f) => f.id === params.id)
  if (!forecast) notFound()

  const probColor = getProbabilityColor(forecast.probability)
  const countries = forecast.countries
    .map((id) => mockCountries.find((c) => c.id === id))
    .filter(Boolean)

  const relatedEvents = mockEvents
    .filter((e) => forecast.relatedEvents?.includes(e.id))
    .slice(0, 3)

  const sortedHistory = [...forecast.history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const confidenceColors = {
    high: 'text-green-400 bg-green-500/10 border-green-500/20',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    low: 'text-red-400 bg-red-500/10 border-red-500/20',
  }

  const evidenceDirectionColors = {
    supporting: 'text-green-400 bg-green-500/8 border-green-500/15',
    opposing: 'text-red-400 bg-red-500/8 border-red-500/15',
    neutral: 'text-[var(--color-text-tertiary)] bg-white/3 border-[var(--color-border)]',
  }

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      {/* Back nav */}
      <Link
        href="/forecasts"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] mb-5 transition-colors duration-150"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Forecasts
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Main content */}
        <div className="space-y-4">
          {/* Forecast header */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6">
            {/* Status + meta */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Badge variant={`status-${forecast.status}`} size="md">{forecast.status}</Badge>
                <span className="text-[var(--color-text-tertiary)] text-xs">·</span>
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  v{forecast.versionNumber}
                </span>
                <span className="text-[var(--color-text-tertiary)] text-xs">·</span>
                <div className="flex items-center gap-1 text-[var(--color-text-tertiary)]">
                  <Calendar className="w-3 h-3" strokeWidth={1.5} />
                  <span className="text-xs">{formatDate(forecast.targetDate)}</span>
                </div>
              </div>
              <span className="text-xs text-[var(--color-text-tertiary)]">
                Updated {formatDate(forecast.lastUpdated)}
              </span>
            </div>

            {/* Big probability + question */}
            <div className="flex items-start gap-6 mb-4">
              {/* Probability display */}
              <div className="flex-shrink-0 text-center">
                <div className={cn('text-5xl font-bold font-mono tabular-nums leading-none', probColor)}>
                  {forecast.probability}
                  <span className="text-3xl">%</span>
                </div>
                <div className="text-[11px] text-[var(--color-text-tertiary)] mt-1.5 font-medium uppercase tracking-wider">
                  Probability
                </div>
                <div className="mt-3 w-24">
                  <ProbabilityBar probability={forecast.probability} />
                </div>
              </div>

              {/* Question */}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-[var(--color-text-primary)] leading-snug mb-2">
                  {forecast.title}
                </h1>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed italic">
                  &ldquo;{forecast.question}&rdquo;
                </p>
              </div>
            </div>

            {/* Confidence */}
            <div className="flex items-center gap-3 flex-wrap">
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium',
                  confidenceColors[forecast.confidenceLevel]
                )}
              >
                <span className="uppercase tracking-wider text-[10px] font-semibold">
                  {forecast.confidenceLevel} confidence
                </span>
              </div>
              <div className="text-xs text-[var(--color-text-secondary)]">
                {forecast.timeHorizon}
              </div>
              <div className="text-xs text-[var(--color-text-tertiary)]">
                {forecast.region}
              </div>
            </div>
          </div>

          {/* Rationale */}
          <Panel title="Analyst Rationale" subtitle="Why this probability was assessed">
            <div className="px-5 py-4">
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {forecast.rationale}
              </p>
            </div>
          </Panel>

          {/* Confidence notes + uncertainty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel title="Confidence Notes">
              <div className="px-5 py-4">
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {forecast.confidenceNotes}
                </p>
              </div>
            </Panel>
            <Panel title="Uncertainty Factors">
              <div className="px-5 py-4">
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {forecast.uncertaintyNotes}
                </p>
              </div>
            </Panel>
          </div>

          {/* Evidence */}
          {forecast.evidence && forecast.evidence.length > 0 && (
            <Panel title="Evidence" subtitle="Key information weighed in this assessment">
              <div className="divide-y divide-[var(--color-border)]">
                {forecast.evidence.map((item) => (
                  <div key={item.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border mt-0.5',
                          evidenceDirectionColors[item.direction]
                        )}
                      >
                        {item.direction}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-xs font-semibold text-[var(--color-text-primary)]">
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-[var(--color-text-tertiary)] flex-shrink-0">
                            {item.weight} weight
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                          {item.description}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1.5">
                          Added {formatDate(item.addedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Resolution criteria */}
          <Panel title="Resolution Criteria">
            <div className="px-5 py-4">
              <div className="flex items-start gap-2.5">
                <Scale className="w-4 h-4 text-[var(--color-text-tertiary)] flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {forecast.resolutionCriteria}
                </p>
              </div>
            </div>
          </Panel>

          {/* Version history */}
          <Panel title="Revision History" subtitle={`${forecast.history.length} versions`}>
            <div className="divide-y divide-[var(--color-border)]">
              {sortedHistory.map((entry, i) => (
                <div key={i} className="px-5 py-3.5">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-semibold text-[var(--color-text-primary)] tabular-nums">
                        {entry.probability}%
                      </span>
                      {i < sortedHistory.length - 1 && (
                        <HistoryDiff
                          current={entry.probability}
                          previous={sortedHistory[i + 1].probability}
                        />
                      )}
                      <span
                        className={cn(
                          'text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded',
                          entry.confidenceLevel === 'high'
                            ? 'text-green-400 bg-green-500/10'
                            : entry.confidenceLevel === 'medium'
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-red-400 bg-red-500/10'
                        )}
                      >
                        {entry.confidenceLevel} conf.
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--color-text-tertiary)] font-mono flex-shrink-0">
                      {formatDate(entry.date)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {entry.changeReason}
                  </p>
                  {entry.analystNote && (
                    <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1 italic">
                      {entry.analystNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          {/* Related events */}
          {relatedEvents.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                Related Events
              </h2>
              <div className="space-y-2.5">
                {relatedEvents.map((event) => (
                  <EventCard key={event.id} event={event} variant="compact" />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Countries */}
          {countries.length > 0 && (
            <Panel title="Countries">
              <div className="divide-y divide-[var(--color-border)]">
                {countries.map((country) => country && (
                  <Link
                    key={country.id}
                    href={`/countries/${country.slug}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-[var(--color-bg-elevated)] transition-colors duration-150 group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-4 rounded-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
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

          {/* Forecast metadata */}
          <Panel title="Forecast Metadata">
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">ID</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">{forecast.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Status</span>
                <Badge variant={`status-${forecast.status}`} size="sm">{forecast.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Version</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">v{forecast.versionNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Region</span>
                <span className="text-xs text-[var(--color-text-secondary)]">{forecast.region}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Target</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">{forecast.targetDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Created</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">{forecast.createdAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Revisions</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">{forecast.history.length}</span>
              </div>
            </div>
          </Panel>

          {/* Tags */}
          {forecast.tags && forecast.tags.length > 0 && (
            <Panel title="Tags">
              <div className="px-5 py-4 flex flex-wrap gap-1.5">
                {forecast.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-1 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}
