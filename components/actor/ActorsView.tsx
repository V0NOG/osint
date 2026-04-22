'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Users, ChevronRight, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { FilterChipBar, FilterDropdown } from '@/components/ui/FilterChipBar'
import { cn } from '@/lib/utils/cn'
import type { Actor, ActorType } from '@/lib/types'

const ACTOR_TYPES: { value: ActorType; label: string; activeClass: string }[] = [
  { value: 'state', label: 'State', activeClass: 'bg-blue-500/20 border-blue-500/40 text-blue-300' },
  { value: 'non-state', label: 'Non-State', activeClass: 'bg-red-500/20 border-red-500/40 text-red-300' },
  { value: 'international-org', label: 'Int\'l Org', activeClass: 'bg-violet-500/20 border-violet-500/40 text-violet-300' },
  { value: 'individual', label: 'Individual', activeClass: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
]

const RISK_OPTIONS = [
  { value: 'all', label: 'All Risk Levels' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
  { value: 'risk-high', label: 'Risk ↓' },
]

const TYPE_COLORS: Record<ActorType, string> = {
  state: 'text-blue-400',
  'non-state': 'text-red-400',
  'international-org': 'text-violet-400',
  individual: 'text-amber-400',
}

const TYPE_LABELS: Record<ActorType, string> = {
  state: 'State',
  'non-state': 'Non-State',
  'international-org': 'Int\'l Org',
  individual: 'Individual',
}

const RISK_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }

function ActorCard({ actor }: { actor: Actor }) {
  return (
    <Link
      href={`/actors/${actor.id}`}
      className="group flex flex-col gap-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-4 hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-elevated)] transition-all duration-150"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate group-hover:text-white transition-colors">
            {actor.name}
          </h3>
          <p className={cn('text-[11px] font-medium mt-0.5', TYPE_COLORS[actor.type])}>
            {TYPE_LABELS[actor.type]}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
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
          <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed line-clamp-2">
        {actor.role}
      </p>

      {(actor.affiliations ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {(actor.affiliations ?? []).slice(0, 3).map((aff) => (
            <span
              key={aff}
              className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[var(--color-text-tertiary)] border border-white/8 font-medium"
            >
              {aff}
            </span>
          ))}
          {(actor.affiliations ?? []).length > 3 && (
            <span className="text-[10px] text-[var(--color-text-tertiary)] px-1 py-0.5">
              +{(actor.affiliations ?? []).length - 3}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}

export function ActorsView({ initialData }: { initialData: Actor[] }) {
  const [query, setQuery] = useState('')
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set())
  const [risk, setRisk] = useState('all')
  const [sort, setSort] = useState('name-asc')

  const toggleType = (value: string) => {
    setActiveTypes((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const filtered = useMemo(() => {
    let result = [...initialData]

    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          (a.affiliations ?? []).some((af) => af.toLowerCase().includes(q))
      )
    }

    if (activeTypes.size > 0) {
      result = result.filter((a) => activeTypes.has(a.type))
    }

    if (risk !== 'all') {
      result = result.filter((a) => a.riskContribution === risk)
    }

    result.sort((a, b) => {
      if (sort === 'name-asc') return a.name.localeCompare(b.name)
      if (sort === 'name-desc') return b.name.localeCompare(a.name)
      if (sort === 'risk-high') {
        return (RISK_ORDER[a.riskContribution] ?? 99) - (RISK_ORDER[b.riskContribution] ?? 99)
      }
      return 0
    })

    return result
  }, [initialData, activeTypes, risk, sort])

  // Group by type when not filtered
  const isFiltered = activeTypes.size > 0 || risk !== 'all' || query.trim() !== ''

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Users className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Actors</h1>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {initialData.length} tracked actors across {new Set(initialData.map((a) => a.type)).size} categories
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-tertiary)] pointer-events-none" strokeWidth={1.75} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actors by name, role, or affiliation…"
          className="w-full pl-9 pr-9 py-2 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        )}
      </div>

      <FilterChipBar
        chips={ACTOR_TYPES}
        activeValues={activeTypes}
        onToggle={toggleType}
        resultCount={filtered.length}
        totalCount={initialData.length}
        dropdowns={
          <>
            <FilterDropdown
              label="Risk"
              options={RISK_OPTIONS}
              value={risk}
              onChange={setRisk}
            />
            <FilterDropdown
              label="Sort"
              options={SORT_OPTIONS}
              value={sort}
              onChange={setSort}
            />
          </>
        }
      />

      {isFiltered ? (
        <div>
          {filtered.length === 0 ? (
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-10 text-center">
              <p className="text-sm text-[var(--color-text-tertiary)]">No actors match the selected filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((actor) => (
                <ActorCard key={actor.id} actor={actor} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {ACTOR_TYPES.map(({ value, label }) => {
            const group = filtered.filter((a) => a.type === value)
            if (group.length === 0) return null
            return (
              <section key={value}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn('text-xs font-semibold uppercase tracking-wider', TYPE_COLORS[value])}>
                    {label}
                  </div>
                  <div className="flex-1 h-px bg-[var(--color-border)]" />
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">
                    {group.length} {group.length === 1 ? 'actor' : 'actors'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {group.map((actor) => (
                    <ActorCard key={actor.id} actor={actor} />
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
