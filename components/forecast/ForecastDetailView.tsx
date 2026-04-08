'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronUp, ChevronDown, Scale } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Panel } from '@/components/ui/Panel'
import { EventCard } from '@/components/event/EventCard'
import { ProbabilityChart } from '@/components/forecast/ProbabilityChart'
import { ResolveModal, type ResolveOutcome } from '@/components/forecast/ResolveModal'
import { formatDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { Forecast, Country, GeopoliticalEvent, ForecastHistoryEntry } from '@/lib/types'

interface ForecastDetailViewProps {
  forecast: Forecast
  countries: Country[]
  relatedEvents: GeopoliticalEvent[]
}

function ProbabilityBar({ probability }: { probability: number }) {
  return (
    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
        style={{ width: `${probability}%` }}
      />
    </div>
  )
}

// Higher probability of risk = unfavorable, shown in red; lower = favorable, shown in green
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

const confidenceTextColors: Record<string, string> = {
  high: 'text-green-400',
  medium: 'text-amber-400',
  low: 'text-red-400',
}

const evidenceDirectionColors: Record<string, string> = {
  supporting: 'text-green-400 bg-green-500/8 border-green-500/15',
  opposing: 'text-red-400 bg-red-500/8 border-red-500/15',
  neutral: 'text-[var(--color-text-tertiary)] bg-white/3 border-[var(--color-border)]',
}

export function ForecastDetailView({ forecast, countries, relatedEvents }: ForecastDetailViewProps) {
  const [localStatus, setLocalStatus] = useState(forecast.status)
  const [localHistory, setLocalHistory] = useState<ForecastHistoryEntry[]>(forecast.history)
  const [resolveModalOpen, setResolveModalOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (toast) {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setToast(null), 3000)
    }
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [toast])

  const handleResolve = (outcome: ResolveOutcome) => {
    setLocalStatus('resolved')
    setLocalHistory((prev) => [
      ...prev,
      {
        date: outcome.resolutionDate,
        probability: forecast.probability,
        confidenceLevel: forecast.confidenceLevel,
        changeReason: outcome.analystNote,
      },
    ])
    setResolveModalOpen(false)
    setToast(`Forecast resolved as ${outcome.result.toUpperCase()}`)
  }

  const handleCloseResolveModal = useCallback(() => setResolveModalOpen(false), [])

  const sortedHistory = useMemo(
    () => [...localHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [localHistory]
  )

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <Link
        href="/forecasts"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] mb-5 transition-colors duration-150"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Forecasts
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <div className="space-y-4">
          {/* Hero */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant={`status-${localStatus}`} size="md">{localStatus}</Badge>
              <span className="text-[10px] font-medium text-[var(--color-text-tertiary)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded px-2 py-0.5 uppercase tracking-wider">
                {forecast.timeHorizon}
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)]">·</span>
              <span className="text-xs text-[var(--color-text-tertiary)]">Updated {formatDate(forecast.lastUpdated)}</span>
              {localStatus === 'active' && (
                <>
                  <span className="text-xs text-[var(--color-text-tertiary)]">·</span>
                  <button
                    onClick={() => setResolveModalOpen(true)}
                    className="text-xs font-medium text-blue-400 border border-blue-500/30 rounded px-2 py-0.5 hover:bg-blue-500/10 transition-colors"
                  >
                    Resolve
                  </button>
                </>
              )}
            </div>

            <h1 className="text-xl font-bold text-[var(--color-text-primary)] leading-snug mb-2">
              {forecast.title}
            </h1>

            <div className="flex items-center gap-4 bg-black/20 rounded-lg px-4 py-3 mb-3">
              <div className="flex-shrink-0">
                <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">Probability</div>
                <div className="text-3xl font-bold font-mono tabular-nums leading-none text-blue-400">
                  {forecast.probability}<span className="text-xl">%</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <ProbabilityBar probability={forecast.probability} />
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">Confidence</div>
                <div className={cn('text-sm font-semibold uppercase tracking-wide', confidenceTextColors[forecast.confidenceLevel])}>
                  {forecast.confidenceLevel}
                </div>
              </div>
              <div className="flex-shrink-0 text-right border-l border-[var(--color-border)] pl-4">
                <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">Revision</div>
                <div className="text-sm font-mono text-[var(--color-text-secondary)]">v{forecast.versionNumber}</div>
              </div>
            </div>

            <p className="text-sm text-[var(--color-text-tertiary)] leading-relaxed italic">
              &ldquo;{forecast.question}&rdquo;
            </p>
          </div>

          {/* Probability chart */}
          <ProbabilityChart history={localHistory} />

          {/* Rationale */}
          <Panel title="Analyst Rationale" subtitle="Why this probability was assessed">
            <div className="px-5 py-4">
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {forecast.rationale}
              </p>
            </div>
          </Panel>

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

          <Panel title="Revision History" subtitle={`${localHistory.length} versions`}>
            <div className="divide-y divide-[var(--color-border)]">
              {sortedHistory.map((entry, i) => (
                <div key={entry.date} className="px-5 py-3.5">
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

        {/* Sidebar */}
        <div className="space-y-4">
          {countries.length > 0 && (
            <Panel title="Countries">
              <div className="divide-y divide-[var(--color-border)]">
                {countries.map((country) => (
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

          <Panel title="Forecast Metadata">
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">ID</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">{forecast.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Status</span>
                <Badge variant={`status-${localStatus}`} size="sm">{localStatus}</Badge>
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
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">{localHistory.length}</span>
              </div>
            </div>
          </Panel>

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

      <ResolveModal
        forecast={forecast}
        isOpen={resolveModalOpen}
        onClose={handleCloseResolveModal}
        onResolve={handleResolve}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--color-bg-surface)] border border-green-500/30 rounded-lg px-4 py-3 text-sm text-green-300 font-medium shadow-xl">
          {toast}
        </div>
      )}
    </div>
  )
}
