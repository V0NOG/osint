'use client'

import { useState } from 'react'
import { Sparkles, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface GenerateResult {
  ok: boolean
  generated: number
  saved: number
  failed: number
  eventsAnalysed: number
  timestamp: string
  results: Array<{ ok: boolean; id?: string; title?: string; error?: string }>
}

export function ForecastGenerationPanel() {
  const [running, setRunning] = useState(false)
  const [count, setCount] = useState(5)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    setRunning(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch(`/api/admin/generate-forecasts?count=${count}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message ?? data.error ?? 'Unknown error')
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-violet-400" strokeWidth={1.75} />
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                AI Forecast Generation
              </h3>
            </div>
            <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed max-w-sm">
              Claude analyses recent ingested events and generates structured probabilistic forecasts
              with rationale, evidence, and resolution criteria.
            </p>
            <p className="text-[10px] font-mono text-amber-400/80 mt-1.5">
              Requires ANTHROPIC_API_KEY in .env.local
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <label className="text-xs text-[var(--color-text-tertiary)]">Count:</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              disabled={running}
              className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-xs text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-border-strong)]"
            >
              {[3, 5, 8, 10].map((n) => (
                <option key={n} value={n}>{n} forecasts</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={generate}
          disabled={running}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border',
            running
              ? 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-tertiary)] cursor-not-allowed'
              : 'bg-violet-600/20 border-violet-600/30 text-violet-300 hover:bg-violet-600/30 hover:border-violet-500/50'
          )}
        >
          {running ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating with Claude…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate {count} Forecasts
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
          <div>
            <p className="text-sm font-medium text-red-300 mb-0.5">Generation failed</p>
            <p className="text-xs text-red-400/80">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" strokeWidth={1.75} />
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                {result.saved} forecast{result.saved !== 1 ? 's' : ''} created
              </span>
            </div>
            <div className="text-[11px] font-mono text-[var(--color-text-tertiary)] flex items-center gap-2">
              <span>{result.eventsAnalysed} events analysed</span>
              <span>·</span>
              <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[var(--color-border)] border-b border-[var(--color-border)]">
            {[
              { label: 'Generated', value: result.generated, color: 'text-[var(--color-text-primary)]' },
              { label: 'Saved', value: result.saved, color: 'text-green-400' },
              { label: 'Failed', value: result.failed, color: result.failed > 0 ? 'text-red-400' : 'text-[var(--color-text-tertiary)]' },
            ].map((s) => (
              <div key={s.label} className="px-5 py-3 text-center">
                <div className={cn('text-2xl font-bold font-mono tabular-nums', s.color)}>{s.value}</div>
                <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="divide-y divide-[var(--color-border)]">
            {result.results.map((r, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3">
                <div className={cn(
                  'w-1.5 h-1.5 rounded-full flex-shrink-0',
                  r.ok ? 'bg-green-400' : 'bg-red-400'
                )} />
                <span className="text-xs text-[var(--color-text-secondary)] truncate flex-1">
                  {r.title ?? `Forecast ${i + 1}`}
                </span>
                {r.id && (
                  <code className="text-[10px] font-mono text-[var(--color-text-tertiary)] flex-shrink-0">
                    {r.id}
                  </code>
                )}
                {r.error && (
                  <span className="text-[10px] text-red-400 truncate max-w-[200px]">{r.error}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
