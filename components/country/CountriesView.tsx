'use client'

import { useState, useMemo } from 'react'
import { Flag } from 'lucide-react'
import { CountryCard } from './CountryCard'
import { FilterChipBar, FilterDropdown } from '@/components/ui/FilterChipBar'
import { mockCountries } from '@/lib/mock-data/countries'
import type { RiskLevel } from '@/lib/types'

const RISK_LEVELS: RiskLevel[] = ['critical', 'high', 'elevated', 'moderate', 'low', 'minimal']

const RISK_CHIPS = RISK_LEVELS.map((level) => ({
  value: level,
  label: level.charAt(0).toUpperCase() + level.slice(1),
  activeClass: {
    critical: 'bg-red-500/20 border-red-500/40 text-red-300',
    high: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
    elevated: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    moderate: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
    low: 'bg-green-500/20 border-green-500/40 text-green-300',
    minimal: 'bg-gray-500/20 border-gray-500/40 text-gray-300',
  }[level] as string,
}))

const SORT_OPTIONS = [
  { value: 'risk-desc', label: 'Risk Score ↓' },
  { value: 'risk-asc', label: 'Risk Score ↑' },
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
]

const REGION_OPTIONS = [
  { value: 'all', label: 'All Regions' },
  { value: 'eastern-europe', label: 'Eastern Europe' },
  { value: 'east-asia', label: 'East Asia' },
  { value: 'middle-east', label: 'Middle East' },
  { value: 'sub-saharan-africa', label: 'Sub-Saharan Africa' },
  { value: 'latin-america', label: 'Latin America' },
  { value: 'southeast-asia', label: 'Southeast Asia' },
]

const riskColors: Record<RiskLevel, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  elevated: 'text-amber-400',
  moderate: 'text-yellow-400',
  low: 'text-green-400',
  minimal: 'text-gray-400',
}

export function CountriesView() {
  const [activeRisk, setActiveRisk] = useState<Set<string>>(new Set())
  const [region, setRegion] = useState('all')
  const [sort, setSort] = useState('risk-desc')

  const toggleRisk = (value: string) => {
    setActiveRisk((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const filtered = useMemo(() => {
    let result = [...mockCountries]

    if (activeRisk.size > 0) {
      result = result.filter((c) => activeRisk.has(c.riskLevel))
    }

    if (region !== 'all') {
      result = result.filter((c) => c.region === region)
    }

    result.sort((a, b) => {
      if (sort === 'risk-desc') return b.overallRiskScore - a.overallRiskScore
      if (sort === 'risk-asc') return a.overallRiskScore - b.overallRiskScore
      if (sort === 'name-asc') return a.name.localeCompare(b.name)
      if (sort === 'name-desc') return b.name.localeCompare(a.name)
      return 0
    })

    return result
  }, [activeRisk, region, sort])

  // When filters are active, show a flat sorted list instead of grouped sections
  const isFiltered = activeRisk.size > 0 || region !== 'all'

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Flag className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Countries</h1>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {mockCountries.length} countries tracked across{' '}
            {new Set(mockCountries.map((c) => c.region)).size} regions
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <FilterChipBar
        chips={RISK_CHIPS}
        activeValues={activeRisk}
        onToggle={toggleRisk}
        resultCount={filtered.length}
        totalCount={mockCountries.length}
        dropdowns={
          <>
            <FilterDropdown
              label="Region"
              options={REGION_OPTIONS}
              value={region}
              onChange={setRegion}
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
        // Flat filtered list
        <div>
          {filtered.length === 0 ? (
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-10 text-center">
              <p className="text-sm text-[var(--color-text-tertiary)]">
                No countries match the selected filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((country) => (
                <CountryCard key={country.id} country={country} />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Grouped by risk level (default view)
        <div className="space-y-6">
          {RISK_LEVELS.map((level) => {
            const countries = filtered.filter((c) => c.riskLevel === level)
            if (countries.length === 0) return null
            return (
              <section key={level}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`text-xs font-semibold uppercase tracking-wider ${riskColors[level]}`}>
                    {level} Risk
                  </div>
                  <div className="flex-1 h-px bg-[var(--color-border)]" />
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">
                    {countries.length} {countries.length === 1 ? 'country' : 'countries'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {countries.map((country) => (
                    <CountryCard key={country.id} country={country} />
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
