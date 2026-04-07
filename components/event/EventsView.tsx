'use client'

import { useState, useMemo } from 'react'
import { Zap } from 'lucide-react'
import { EventCard } from './EventCard'
import { FilterChipBar, FilterDropdown } from '@/components/ui/FilterChipBar'
import { Badge } from '@/components/ui/Badge'
import { mockEvents } from '@/lib/mock-data/events'
import type { EventType, EventSeverity } from '@/lib/types'

const EVENT_TYPES: EventType[] = ['military', 'diplomatic', 'economic', 'political', 'humanitarian', 'cyber']
const SEVERITIES: EventSeverity[] = ['critical', 'high', 'moderate', 'low']

const TYPE_CHIPS = EVENT_TYPES.map((type) => ({
  value: `type:${type}`,
  label: type.charAt(0).toUpperCase() + type.slice(1),
  activeClass: ({
    military: 'bg-red-500/20 border-red-500/40 text-red-300',
    diplomatic: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
    economic: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    political: 'bg-violet-500/20 border-violet-500/40 text-violet-300',
    humanitarian: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    cyber: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
  } as Record<EventType, string>)[type],
}))

const SEVERITY_CHIPS = SEVERITIES.map((sev) => ({
  value: `sev:${sev}`,
  label: sev.charAt(0).toUpperCase() + sev.slice(1),
  activeClass: ({
    critical: 'bg-red-500/20 border-red-500/40 text-red-300',
    high: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
    moderate: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    low: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
  } as Record<EventSeverity, string>)[sev],
}))

const ALL_CHIPS = [...TYPE_CHIPS, ...SEVERITY_CHIPS]

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Date (newest)' },
  { value: 'date-asc', label: 'Date (oldest)' },
  { value: 'severity', label: 'Severity' },
]

const SEVERITY_ORDER: Record<EventSeverity, number> = { critical: 0, high: 1, moderate: 2, low: 3 }
const severityColors: Record<EventSeverity, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  moderate: 'text-amber-400',
  low: 'text-blue-400',
}

export function EventsView() {
  const [activeChips, setActiveChips] = useState<Set<string>>(new Set())
  const [sort, setSort] = useState('date-desc')

  const toggleChip = (value: string) => {
    setActiveChips((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const activeTypes = useMemo(
    () => new Set(Array.from(activeChips).filter((v) => v.startsWith('type:')).map((v) => v.slice(5))),
    [activeChips]
  )
  const activeSeverities = useMemo(
    () => new Set(Array.from(activeChips).filter((v) => v.startsWith('sev:')).map((v) => v.slice(4))),
    [activeChips]
  )

  const filtered = useMemo(() => {
    let result = [...mockEvents]

    if (activeTypes.size > 0) {
      result = result.filter((e) => activeTypes.has(e.eventType))
    }
    if (activeSeverities.size > 0) {
      result = result.filter((e) => activeSeverities.has(e.severity))
    }

    result.sort((a, b) => {
      if (sort === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sort === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime()
      if (sort === 'severity') return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
      return 0
    })

    return result
  }, [activeTypes, activeSeverities, sort])

  const isFiltered = activeChips.size > 0

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Zap className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Events</h1>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {mockEvents.length} events tracked
          </p>
        </div>
      </div>

      {/* Type distribution summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
        {EVENT_TYPES.map((type) => (
          <div
            key={type}
            className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-3 text-center"
          >
            <div className="text-lg font-bold font-mono tabular-nums text-[var(--color-text-primary)]">
              {mockEvents.filter((e) => e.eventType === type).length}
            </div>
            <div className="mt-1">
              <Badge variant={`event-${type}`} size="sm">
                {type}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <FilterChipBar
        chips={ALL_CHIPS}
        activeValues={activeChips}
        onToggle={toggleChip}
        resultCount={filtered.length}
        totalCount={mockEvents.length}
        dropdowns={
          <FilterDropdown
            label="Sort"
            options={SORT_OPTIONS}
            value={sort}
            onChange={setSort}
          />
        }
      />

      {isFiltered ? (
        <div>
          {filtered.length === 0 ? (
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-10 text-center">
              <p className="text-sm text-[var(--color-text-tertiary)]">
                No events match the selected filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {SEVERITIES.map((severity) => {
            const events = filtered.filter((e) => e.severity === severity)
            if (events.length === 0) return null
            return (
              <section key={severity}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`text-xs font-semibold uppercase tracking-wider ${severityColors[severity]}`}>
                    {severity} Severity
                  </div>
                  <div className="flex-1 h-px bg-[var(--color-border)]" />
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">
                    {events.length} {events.length === 1 ? 'event' : 'events'}
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
