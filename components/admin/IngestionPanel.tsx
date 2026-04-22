'use client'

import { useState } from 'react'
import { Play, RefreshCw, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type IngestionSource = 'rss' | 'gdelt' | 'acled' | 'all'

interface IngestionResult {
  source: string
  fetched: number
  ingested: number
  skipped: number
  errors: number
  errorMessages: string[]
}

interface RunResult {
  ok: boolean
  summary: { fetched: number; ingested: number; skipped: number; errors: number }
  detail: IngestionResult[]
  timestamp: string
}

interface SourceConfig {
  key: IngestionSource
  label: string
  description: string
  requiresKey?: boolean
  keyVar?: string
}

const SOURCES: SourceConfig[] = [
  {
    key: 'rss',
    label: 'RSS Feeds',
    description: 'Reuters World, BBC World, Al Jazeera, Foreign Policy, Defense One',
  },
  {
    key: 'gdelt',
    label: 'GDELT v2',
    description: 'Global Database of Events, Language, and Tone — free, no auth',
  },
  {
    key: 'acled',
    label: 'ACLED',
    description: 'Armed Conflict Location & Event Data — conflict events with coordinates',
    requiresKey: true,
    keyVar: 'ACLED_API_KEY + ACLED_EMAIL',
  },
]

export function IngestionPanel() {
  const [running, setRunning] = useState<IngestionSource | null>(null)
  const [lastResult, setLastResult] = useState<RunResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function triggerRun(source: IngestionSource) {
    setRunning(source)
    setLastResult(null)
    setError(null)

    try {
      const res = await fetch(`/api/admin/ingest?source=${source}`, { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message ?? data.error ?? 'Unknown error')
      } else {
        setLastResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setRunning(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Source cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SOURCES.map((source) => (
          <div
            key={source.key}
            className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {source.label}
                  </span>
                  {source.requiresKey && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono uppercase tracking-wider">
                      API Key
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">
                  {source.description}
                </p>
                {source.keyVar && (
                  <p className="text-[10px] font-mono text-[var(--color-text-tertiary)] mt-1.5 opacity-70">
                    {source.keyVar}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => triggerRun(source.key)}
              disabled={running !== null}
              className={cn(
                'flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                running !== null
                  ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] cursor-not-allowed'
                  : 'bg-blue-600/20 border border-blue-600/30 text-blue-300 hover:bg-blue-600/30 hover:border-blue-500/50'
              )}
            >
              {running === source.key ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  Run {source.label}
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Run all button */}
      <button
        onClick={() => triggerRun('all')}
        disabled={running !== null}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 border',
          running !== null
            ? 'bg-[var(--color-bg-surface)] border-[var(--color-border)] text-[var(--color-text-tertiary)] cursor-not-allowed'
            : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'
        )}
      >
        {running === 'all' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Running full pipeline…
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            Run Full Ingestion Pipeline
          </>
        )}
      </button>

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
          <div>
            <p className="text-sm font-medium text-red-300 mb-0.5">Pipeline error</p>
            <p className="text-xs text-red-400/80">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {lastResult && (
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" strokeWidth={1.75} />
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                Run complete
              </span>
            </div>
            <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">
              {new Date(lastResult.timestamp).toLocaleTimeString()}
            </span>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-4 divide-x divide-[var(--color-border)] border-b border-[var(--color-border)]">
            {[
              { label: 'Fetched', value: lastResult.summary.fetched, color: 'text-[var(--color-text-primary)]' },
              { label: 'Ingested', value: lastResult.summary.ingested, color: 'text-green-400' },
              { label: 'Skipped', value: lastResult.summary.skipped, color: 'text-[var(--color-text-tertiary)]' },
              { label: 'Errors', value: lastResult.summary.errors, color: lastResult.summary.errors > 0 ? 'text-red-400' : 'text-[var(--color-text-tertiary)]' },
            ].map((stat) => (
              <div key={stat.label} className="px-5 py-3 text-center">
                <div className={cn('text-2xl font-bold font-mono tabular-nums', stat.color)}>
                  {stat.value}
                </div>
                <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Per-source detail */}
          {lastResult.detail.map((d) => (
            <div key={d.source} className="px-5 py-3 border-b border-[var(--color-border)] last:border-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  {d.source}
                </span>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span className="text-[var(--color-text-tertiary)]">{d.fetched} fetched</span>
                  <span className="text-green-400">+{d.ingested} new</span>
                  <span className="text-[var(--color-text-tertiary)]">{d.skipped} dup</span>
                  {d.errors > 0 && <span className="text-red-400">{d.errors} err</span>}
                </div>
              </div>
              {d.errorMessages.length > 0 && (
                <div className="space-y-1">
                  {d.errorMessages.slice(0, 3).map((msg, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-[10px] text-red-400/80 font-mono leading-relaxed">{msg}</span>
                    </div>
                  ))}
                  {d.errorMessages.length > 3 && (
                    <p className="text-[10px] text-[var(--color-text-tertiary)] pl-4.5">
                      +{d.errorMessages.length - 3} more errors
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
