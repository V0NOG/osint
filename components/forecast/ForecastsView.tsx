'use client'

import { useState, useMemo } from 'react'
import { Target } from 'lucide-react'
import { ForecastCard } from './ForecastCard'
import { FilterChipBar, FilterDropdown } from '@/components/ui/FilterChipBar'
import { mockForecasts } from '@/lib/mock-data/forecasts'
import type { ForecastStatus, ConfidenceLevel } from '@/lib/types'

const STATUSES: ForecastStatus[] = ['active', 'resolved', 'expired', 'draft']
const CONFIDENCE_LEVELS: ConfidenceLevel[] = ['high', 'medium', 'low']

const STATUS_CHIPS = STATUSES.map((status) => ({
  value: `status:${status}`,
  label: status.charAt(0).toUpperCase() + status.slice(1),
  activeClass: ({
    active: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
    resolved: 'bg-green-500/20 border-green-500/40 text-green-300',
    expired: 'bg-gray-500/20 border-gray-500/40 text-gray-300',
    draft: 'bg-violet-500/20 border-violet-500/40 text-violet-300',
  } as Record<ForecastStatus, string>)[status],
}))

const CONFIDENCE_CHIPS = CONFIDENCE_LEVELS.map((level) => ({
  value: `conf:${level}`,
  label: `${level.charAt(0).toUpperCase() + level.slice(1)} conf.`,
  activeClass: ({
    high: 'bg-green-500/20 border-green-500/40 text-green-300',
    medium: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    low: 'bg-red-500/20 border-red-500/40 text-red-300',
  } as Record<ConfidenceLevel, string>)[level],
}))

const ALL_CHIPS = [...STATUS_CHIPS, ...CONFIDENCE_CHIPS]

const SORT_OPTIONS = [
  { value: 'prob-desc', label: 'Probability ↓' },
  { value: 'prob-asc', label: 'Probability ↑' },
  { value: 'target-asc', label: 'Target Date' },
  { value: 'updated-desc', label: 'Last Updated' },
]

export function ForecastsView() {
  const [activeChips, setActiveChips] = useState<Set<string>>(new Set(['status:active']))
  const [sort, setSort] = useState('prob-desc')

  const toggleChip = (value: string) => {
    setActiveChips((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const activeStatuses = useMemo(
    () => new Set(Array.from(activeChips).filter((v) => v.startsWith('status:')).map((v) => v.slice(7))),
    [activeChips]
  )
  const activeConfs = useMemo(
    () => new Set(Array.from(activeChips).filter((v) => v.startsWith('conf:')).map((v) => v.slice(5))),
    [activeChips]
  )

  const filtered = useMemo(() => {
    let result = [...mockForecasts]

    if (activeStatuses.size > 0) {
      result = result.filter((f) => activeStatuses.has(f.status))
    }
    if (activeConfs.size > 0) {
      result = result.filter((f) => activeConfs.has(f.confidenceLevel))
    }

    result.sort((a, b) => {
      if (sort === 'prob-desc') return b.probability - a.probability
      if (sort === 'prob-asc') return a.probability - b.probability
      if (sort === 'target-asc')
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
      if (sort === 'updated-desc')
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      return 0
    })

    return result
  }, [activeStatuses, activeConfs, sort])

  const activeCount = mockForecasts.filter((f) => f.status === 'active').length
  const avgProb = Math.round(
    mockForecasts.reduce((sum, f) => sum + f.probability, 0) / mockForecasts.length
  )
  const lowConfCount = mockForecasts.filter((f) => f.confidenceLevel === 'low').length

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Target className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Forecasts</h1>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {mockForecasts.length} structured forecasts — {activeCount} active
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-400 mb-0.5">{activeCount}</div>
          <div className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">Active</div>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="text-2xl font-bold font-mono tabular-nums text-[var(--color-text-primary)] mb-0.5">{avgProb}%</div>
          <div className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">Avg. Probability</div>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mb-0.5">{lowConfCount}</div>
          <div className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">Low Confidence</div>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="text-2xl font-bold font-mono tabular-nums text-[var(--color-text-primary)] mb-0.5">
            {mockForecasts.reduce((sum, f) => sum + f.versionNumber, 0)}
          </div>
          <div className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">Total Revisions</div>
        </div>
      </div>

      {/* Filter bar */}
      <FilterChipBar
        chips={ALL_CHIPS}
        activeValues={activeChips}
        onToggle={toggleChip}
        resultCount={filtered.length}
        totalCount={mockForecasts.length}
        dropdowns={
          <FilterDropdown
            label="Sort"
            options={SORT_OPTIONS}
            value={sort}
            onChange={setSort}
          />
        }
      />

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-10 text-center">
          <p className="text-sm text-[var(--color-text-tertiary)]">
            No forecasts match the selected filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((forecast) => (
            <ForecastCard key={forecast.id} forecast={forecast} />
          ))}
        </div>
      )}
    </div>
  )
}
