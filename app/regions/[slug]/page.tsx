import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Activity, Clock, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Panel } from '@/components/ui/Panel'
import { mockRegions } from '@/lib/mock-data/regions'
import { mockCountries } from '@/lib/mock-data/countries'
import { mockForecasts } from '@/lib/mock-data/forecasts'
import { formatDate } from '@/lib/utils/format'
import { getRiskColor, getProbabilityColor } from '@/lib/utils/risk'
import type { Country } from '@/lib/types'

interface PageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  return mockRegions.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const region = mockRegions.find((r) => r.slug === params.slug)
  return { title: region?.name ?? 'Region' }
}

export default function RegionDetailPage({ params }: PageProps) {
  const region = mockRegions.find((r) => r.slug === params.slug)
  if (!region) notFound()

  const memberCountries = region.countries
    .map((id) => mockCountries.find((c) => c.id === id))
    .filter((c): c is Country => c !== undefined)

  const activeForecasts = mockForecasts.filter((f) => f.region === region.id)

  const riskColor = getRiskColor(region.riskLevel)

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      {/* Back nav */}
      <Link
        href="/regions"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] mb-5 transition-colors duration-150"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Regions
      </Link>

      {/* Hero */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-5 relative overflow-hidden">
        {/* Background accent */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
          style={{ backgroundColor: riskColor }}
        />

        <div className="relative flex items-start justify-between gap-6 mb-5">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-[var(--color-text-tertiary)] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1.5">
                {region.name}
              </h1>
              <Badge variant={`risk-${region.riskLevel}`} size="md">
                {region.riskLevel} risk
              </Badge>
            </div>
          </div>

          {/* Risk score */}
          <div className="text-right flex-shrink-0">
            <div
              className="text-4xl font-bold font-mono tabular-nums leading-none"
              style={{ color: riskColor }}
            >
              {region.overallRiskScore}
            </div>
            <div className="text-[11px] text-[var(--color-text-tertiary)] font-medium uppercase tracking-wider mt-1">
              Risk Score
            </div>
          </div>
        </div>

        {/* Key tensions */}
        {region.keyTensions.length > 0 && (
          <div className="relative border-t border-[var(--color-border)] pt-4">
            <h3 className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
              Key Tensions
            </h3>
            <ul className="space-y-1.5">
              {region.keyTensions.map((tension) => (
                <li key={tension} className="flex items-start gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: riskColor, opacity: 0.7 }}
                  />
                  <span className="text-sm text-[var(--color-text-secondary)]">{tension}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Main column */}
        <div className="space-y-5">
          {/* Overview */}
          <Panel title="Overview">
            <div className="px-5 py-4">
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {region.summary}
              </p>
            </div>
          </Panel>

          {/* Member countries */}
          <section>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
              Member Countries
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {memberCountries.map((country) => (
                <Link
                  key={country.id}
                  href={`/countries/${country.slug}`}
                  className="flex items-center justify-between gap-3 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-3.5 hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-strong)] transition-all duration-150 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-6 rounded-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] font-mono">
                        {country.iso2}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-text-primary)] truncate">
                        {country.name}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-tertiary)]">
                        {country.alertCount} alerts · {country.activeForecastCount} forecasts
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span
                      className="text-lg font-bold font-mono tabular-nums leading-none"
                      style={{ color: getRiskColor(country.riskLevel) }}
                    >
                      {country.overallRiskScore}
                    </span>
                    <Badge variant={`risk-${country.riskLevel}`} size="sm">
                      {country.riskLevel}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* At a glance */}
          <Panel title="At a Glance">
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Countries</span>
                <span className="text-xs font-mono font-semibold text-[var(--color-text-secondary)]">
                  {region.countries.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
                  <AlertTriangle className="w-3 h-3" strokeWidth={1.5} />
                  <span className="text-xs">Active Events</span>
                </div>
                <span className="text-xs font-mono font-semibold text-[var(--color-text-secondary)]">
                  {region.activeEventCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
                  <Activity className="w-3 h-3" strokeWidth={1.5} />
                  <span className="text-xs">Active Forecasts</span>
                </div>
                <span className="text-xs font-mono font-semibold text-[var(--color-text-secondary)]">
                  {region.activeForecastCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
                  <Clock className="w-3 h-3" strokeWidth={1.5} />
                  <span className="text-xs">Updated</span>
                </div>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                  {formatDate(region.lastUpdated)}
                </span>
              </div>
            </div>
          </Panel>

          {/* Active forecasts */}
          {activeForecasts.length > 0 && (
            <Panel
              title="Active Forecasts"
              subtitle={`${activeForecasts.length} forecast${activeForecasts.length !== 1 ? 's' : ''}`}
            >
              <div className="divide-y divide-[var(--color-border)]">
                {activeForecasts.map((forecast) => (
                  <Link
                    key={forecast.id}
                    href={`/forecasts/${forecast.id}`}
                    className="flex items-start justify-between gap-3 px-5 py-3.5 hover:bg-[var(--color-bg-elevated)] transition-colors duration-150 group"
                  >
                    <p className="text-xs font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors leading-snug line-clamp-2 flex-1">
                      {forecast.title}
                    </p>
                    <span className={`text-sm font-bold font-mono tabular-nums flex-shrink-0 ${getProbabilityColor(forecast.probability)}`}>
                      {forecast.probability}%
                    </span>
                  </Link>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}
