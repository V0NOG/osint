'use client'

import { useState, useMemo } from 'react'
import { Zap, Search, X } from 'lucide-react'
import { EventCard } from './EventCard'
import { FilterChipBar, FilterDropdown } from '@/components/ui/FilterChipBar'
import { Badge } from '@/components/ui/Badge'
import type { GeopoliticalEvent, EventType, EventSeverity, Country } from '@/lib/types'

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

interface EventsViewProps {
  initialData: GeopoliticalEvent[]
  countries?: Country[]
}

export function EventsView({ initialData, countries = [] }: EventsViewProps) {
  const allEvents = initialData
  const [activeChips, setActiveChips] = useState<Set<string>>(new Set())
  const [sort, setSort] = useState('date-desc')
  const [countrySearch, setCountrySearch] = useState('')
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)

  // Build id→name map for EventCard lookups
  const countryMap = useMemo(
    () => Object.fromEntries(countries.map((c) => [c.id, c.name])),
    [countries]
  )

  // Countries that have at least one event
  const activeCountries = useMemo(() => {
    const ids = new Set(allEvents.flatMap((e) => e.countries))
    return countries.filter((c) => ids.has(c.id))
  }, [allEvents, countries])

  const filteredCountryOptions = useMemo(() => {
    const q = countrySearch.toLowerCase()
    return activeCountries.filter((c) => c.name.toLowerCase().includes(q))
  }, [activeCountries, countrySearch])

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
    let result = [...allEvents]

    if (activeTypes.size > 0) {
      result = result.filter((e) => activeTypes.has(e.eventType))
    }
    if (activeSeverities.size > 0) {
      result = result.filter((e) => activeSeverities.has(e.severity))
    }
    if (selectedCountryId) {
      result = result.filter((e) => e.countries.includes(selectedCountryId))
    }
    if (activeTag) {
      result = result.filter((e) => e.tags.includes(activeTag))
    }

    result.sort((a, b) => {
      if (sort === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sort === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime()
      if (sort === 'severity') return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
      return 0
    })

    return result
  }, [activeTypes, activeSeverities, selectedCountryId, activeTag, sort, allEvents])

  const isFiltered = activeChips.size > 0 || selectedCountryId !== null || activeTag !== null

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
            {allEvents.length} events tracked
          </p>
        </div>

        {/* Country search */}
        {countries.length > 0 && (
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-tertiary)]" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Filter by country…"
              value={countrySearch}
              onChange={(e) => {
                setCountrySearch(e.target.value)
                if (!e.target.value) setSelectedCountryId(null)
              }}
              className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-border-strong)] transition-colors"
            />
            {(countrySearch || selectedCountryId) && (
              <button
                onClick={() => { setCountrySearch(''); setSelectedCountryId(null) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Dropdown */}
            {countrySearch && !selectedCountryId && filteredCountryOptions.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 z-20 bg-[var(--color-bg-overlay)] border border-[var(--color-border)] rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                {filteredCountryOptions.slice(0, 12).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCountryId(c.id); setCountrySearch(c.name) }}
                    className="w-full text-left px-3 py-2 text-xs text-[var(--color-text-secondary)] hover:bg-white/6 hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-2"
                  >
                    <span className="font-mono text-[10px] text-[var(--color-text-tertiary)] w-6">{c.iso2}</span>
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active filters */}
      {(selectedCountryId || activeTag) && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {selectedCountryId && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--color-text-tertiary)]">Country:</span>
              <button
                onClick={() => { setCountrySearch(''); setSelectedCountryId(null) }}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--color-text-primary)] bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)] px-2 py-0.5 rounded-full hover:border-red-500/40 transition-colors"
              >
                {countryMap[selectedCountryId] ?? selectedCountryId}
                <X className="w-3 h-3 opacity-60" />
              </button>
            </div>
          )}
          {activeTag && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--color-text-tertiary)]">Tag:</span>
              <button
                onClick={() => setActiveTag(null)}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--color-text-primary)] bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)] px-2 py-0.5 rounded-full hover:border-red-500/40 transition-colors"
              >
                {activeTag}
                <X className="w-3 h-3 opacity-60" />
              </button>
            </div>
          )}
          <span className="text-xs text-[var(--color-text-tertiary)]">— {filtered.length} events</span>
        </div>
      )}

      {/* Type distribution summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
        {EVENT_TYPES.map((type) => (
          <div
            key={type}
            className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-3 text-center"
          >
            <div className="text-lg font-bold font-mono tabular-nums text-[var(--color-text-primary)]">
              {allEvents.filter((e) => e.eventType === type).length}
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
        totalCount={allEvents.length}
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
                <EventCard key={event.id} event={event} countryMap={countryMap} onTagClick={setActiveTag} />
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
                    <EventCard key={event.id} event={event} countryMap={countryMap} onTagClick={setActiveTag} />
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
