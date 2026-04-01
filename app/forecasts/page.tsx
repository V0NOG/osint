import { Target, Filter } from 'lucide-react'
import { ForecastCard } from '@/components/forecast/ForecastCard'
import { Badge } from '@/components/ui/Badge'
import { mockForecasts } from '@/lib/mock-data/forecasts'
import type { ForecastStatus, ConfidenceLevel } from '@/lib/types'

export const metadata = {
  title: 'Forecasts',
}

const statuses: ForecastStatus[] = ['active', 'resolved', 'expired', 'draft']
const confidenceLevels: ConfidenceLevel[] = ['high', 'medium', 'low']

export default function ForecastsPage() {
  const sortedForecasts = [...mockForecasts].sort((a, b) => {
    // Active first, then by probability
    if (a.status === 'active' && b.status !== 'active') return -1
    if (a.status !== 'active' && b.status === 'active') return 1
    return b.probability - a.probability
  })

  const byStatus = statuses.reduce<Record<string, typeof mockForecasts>>((acc, status) => {
    acc[status] = sortedForecasts.filter((f) => f.status === status)
    return acc
  }, {})

  const byConfidence = confidenceLevels.reduce<Record<string, number>>((acc, level) => {
    acc[level] = mockForecasts.filter((f) => f.confidenceLevel === level).length
    return acc
  }, {})

  const avgProb = Math.round(
    mockForecasts.reduce((sum, f) => sum + f.probability, 0) / mockForecasts.length
  )

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Target className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Forecasts</h1>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {mockForecasts.length} structured forecasts — {byStatus.active?.length ?? 0} active
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] transition-all duration-150">
            <Filter className="w-3.5 h-3.5" strokeWidth={1.75} />
            Status
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] transition-all duration-150">
            <Filter className="w-3.5 h-3.5" strokeWidth={1.75} />
            Region
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-400 mb-0.5">
            {byStatus.active?.length ?? 0}
          </div>
          <div className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
            Active
          </div>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="text-2xl font-bold font-mono tabular-nums text-[var(--color-text-primary)] mb-0.5">
            {avgProb}%
          </div>
          <div className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
            Avg. Probability
          </div>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mb-0.5">
            {byConfidence.low ?? 0}
          </div>
          <div className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
            Low Confidence
          </div>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="text-2xl font-bold font-mono tabular-nums text-[var(--color-text-primary)] mb-0.5">
            {mockForecasts.reduce((sum, f) => sum + f.versionNumber, 0)}
          </div>
          <div className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
            Total Revisions
          </div>
        </div>
      </div>

      {/* Forecasts by status */}
      <div className="space-y-6">
        {statuses.map((status) => {
          const forecasts = byStatus[status]
          if (!forecasts || forecasts.length === 0) return null
          return (
            <section key={status}>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={`status-${status}`} size="md">{status}</Badge>
                <div className="flex-1 h-px bg-[var(--color-border)]" />
                <span className="text-[11px] text-[var(--color-text-tertiary)]">
                  {forecasts.length} {forecasts.length === 1 ? 'forecast' : 'forecasts'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {forecasts.map((forecast) => (
                  <ForecastCard key={forecast.id} forecast={forecast} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
