import { Flag, Filter } from 'lucide-react'
import { CountryCard } from '@/components/country/CountryCard'
import { mockCountries } from '@/lib/mock-data/countries'
import type { RiskLevel } from '@/lib/types'

export const metadata = {
  title: 'Countries',
}

const riskLevels: RiskLevel[] = ['critical', 'high', 'elevated', 'moderate', 'low', 'minimal']

const regions = [
  { id: 'eastern-europe', label: 'Eastern Europe' },
  { id: 'east-asia', label: 'East Asia' },
  { id: 'middle-east', label: 'Middle East' },
  { id: 'sub-saharan-africa', label: 'Sub-Saharan Africa' },
  { id: 'latin-america', label: 'Latin America' },
  { id: 'southeast-asia', label: 'Southeast Asia' },
]

const riskColors: Record<RiskLevel, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  elevated: 'text-amber-400',
  moderate: 'text-yellow-400',
  low: 'text-green-400',
  minimal: 'text-gray-400',
}

export default function CountriesPage() {
  const sortedCountries = [...mockCountries].sort((a, b) => b.overallRiskScore - a.overallRiskScore)

  const byRisk = riskLevels.reduce<Record<string, typeof mockCountries>>((acc, level) => {
    acc[level] = sortedCountries.filter((c) => c.riskLevel === level)
    return acc
  }, {})

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
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

        {/* Filter bar placeholder */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] transition-all duration-150">
            <Filter className="w-3.5 h-3.5" strokeWidth={1.75} />
            Risk Level
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] transition-all duration-150">
            <Filter className="w-3.5 h-3.5" strokeWidth={1.75} />
            Region
          </button>
        </div>
      </div>

      {/* Risk level summary bar */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        {riskLevels.map((level) => {
          const count = byRisk[level]?.length ?? 0
          return (
            <div
              key={level}
              className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-3 text-center"
            >
              <div className={`text-lg font-bold font-mono tabular-nums ${riskColors[level]}`}>
                {count}
              </div>
              <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium mt-0.5">
                {level}
              </div>
            </div>
          )
        })}
      </div>

      {/* Countries grid — sorted by risk */}
      <div className="space-y-6">
        {riskLevels.map((level) => {
          const countries = byRisk[level]
          if (!countries || countries.length === 0) return null
          return (
            <section key={level}>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`text-xs font-semibold uppercase tracking-wider ${riskColors[level]}`}
                >
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
    </div>
  )
}
