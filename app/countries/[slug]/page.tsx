import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Activity, MapPin, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { EventCard } from '@/components/event/EventCard'
import { ForecastCard } from '@/components/forecast/ForecastCard'
import { Panel } from '@/components/ui/Panel'
import { mockCountries } from '@/lib/mock-data/countries'
import { mockEvents } from '@/lib/mock-data/events'
import { mockForecasts } from '@/lib/mock-data/forecasts'
import { mockActors } from '@/lib/mock-data/actors'
import { mockRegions } from '@/lib/mock-data/regions'
import { formatDate, formatNumber } from '@/lib/utils/format'
import { getRiskColor, scoreToRiskLevel } from '@/lib/utils/risk'

interface PageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  return mockCountries.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const country = mockCountries.find((c) => c.slug === params.slug)
  return { title: country?.name ?? 'Country' }
}

const categoryLabels: Record<string, string> = {
  political: 'Political',
  military: 'Military',
  economic: 'Economic',
  social: 'Social',
  environmental: 'Environmental',
}

function RiskBreakdownBar({ label, score }: { label: string; score: number }) {
  const color = getRiskColor(scoreToRiskLevel(score))

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[var(--color-text-tertiary)] w-24 flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color, opacity: 0.85 }}
        />
      </div>
      <span
        className="text-xs font-bold font-mono tabular-nums w-8 text-right flex-shrink-0"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  )
}

export default function CountryDetailPage({ params }: PageProps) {
  const country = mockCountries.find((c) => c.slug === params.slug)
  if (!country) notFound()

  const relatedEvents = mockEvents
    .filter((e) => e.countries.includes(country.id))
    .slice(0, 4)

  const relatedForecasts = mockForecasts
    .filter((f) => f.countries.includes(country.id))
    .slice(0, 3)

  const keyActors = mockActors.filter((a) => country.keyActors.includes(a.id))

  const regionData = mockRegions.find((r) => r.id === country.region)

  const riskColor = getRiskColor(country.riskLevel)

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Back nav */}
      <Link
        href="/countries"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] mb-5 transition-colors duration-150"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Countries
      </Link>

      {/* Hero — includes name, score, summary, and risk category bars */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-5 relative overflow-hidden">
        {/* Background accent */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
          style={{ backgroundColor: riskColor }}
        />

        {/* Name row */}
        <div className="relative flex items-start justify-between gap-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-10 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-[var(--color-text-secondary)] font-mono">
                {country.iso2}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">
                {country.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
                  <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="text-xs">{country.capital}</span>
                </div>
                <span className="text-[var(--color-text-tertiary)] text-xs">·</span>
                <Badge variant={`risk-${country.riskLevel}`}>
                  {country.riskLevel} risk
                </Badge>
              </div>
            </div>
          </div>

          {/* Overall score */}
          <div className="text-right flex-shrink-0">
            <div
              className="text-4xl font-bold font-mono tabular-nums leading-none"
              style={{ color: riskColor }}
            >
              {country.overallRiskScore}
            </div>
            <div className="text-[11px] text-[var(--color-text-tertiary)] font-medium uppercase tracking-wider mt-1">
              Risk Score
            </div>
            <div className="flex items-center gap-3 mt-2 justify-end">
              <div className="flex items-center gap-1 text-[var(--color-text-tertiary)]">
                <AlertTriangle className="w-3 h-3" strokeWidth={1.5} />
                <span className="text-xs">{country.alertCount} alerts</span>
              </div>
              <div className="flex items-center gap-1 text-[var(--color-text-tertiary)]">
                <Activity className="w-3 h-3" strokeWidth={1.5} />
                <span className="text-xs">{country.activeForecastCount} forecasts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed relative mb-4">
          {country.summary}
        </p>

        {/* Risk category bars — inside the hero */}
        <div className="relative border-t border-[var(--color-border)] pt-4 space-y-2.5">
          {Object.entries(country.riskCategories).map(([key, score]) => (
            <RiskBreakdownBar
              key={key}
              label={categoryLabels[key] ?? key}
              score={score}
            />
          ))}
        </div>

        {/* Last updated */}
        <div className="flex items-center gap-1.5 mt-4 text-[var(--color-text-tertiary)] relative">
          <Clock className="w-3 h-3" strokeWidth={1.5} />
          <span className="text-[11px]">Updated {formatDate(country.lastUpdated)}</span>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Left column: events + key actors */}
        <div className="space-y-5">
          {/* Recent events */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Recent Events
              </h2>
              <Link
                href="/events"
                className="text-[11px] text-[var(--color-accent-blue)] hover:text-blue-300 font-medium transition-colors"
              >
                View all →
              </Link>
            </div>
            {relatedEvents.length > 0 ? (
              <div className="space-y-2.5">
                {relatedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-6 text-center">
                <p className="text-sm text-[var(--color-text-tertiary)]">No recent events found</p>
              </div>
            )}
          </section>

          {/* Key actors */}
          <Panel
            title="Key Actors"
            subtitle={`${keyActors.length} identified actor${keyActors.length !== 1 ? 's' : ''}`}
          >
            <div className="divide-y divide-[var(--color-border)]">
              {keyActors.length > 0 ? (
                keyActors.map((actor) => (
                  <div key={actor.id} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                        {actor.name}
                      </span>
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
                    </div>
                    <p className="text-[11px] text-[var(--color-text-tertiary)] mb-1.5 font-medium">
                      {actor.role}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed line-clamp-2">
                      {actor.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="px-5 py-4 text-xs text-[var(--color-text-tertiary)]">
                  No actors catalogued
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* Right column: active forecasts + quick stats */}
        <div className="space-y-4">
          {/* Active forecasts */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Active Forecasts
              </h2>
              <Link
                href="/forecasts"
                className="text-[11px] text-[var(--color-accent-blue)] hover:text-blue-300 font-medium transition-colors"
              >
                View all →
              </Link>
            </div>
            {relatedForecasts.length > 0 ? (
              <div className="space-y-2.5">
                {relatedForecasts.map((forecast) => (
                  <ForecastCard key={forecast.id} forecast={forecast} variant="compact" />
                ))}
              </div>
            ) : (
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-5 text-center">
                <p className="text-sm text-[var(--color-text-tertiary)]">No active forecasts</p>
              </div>
            )}
          </section>

          {/* Quick stats */}
          <Panel title="Quick Stats">
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Region</span>
                <Link
                  href={`/regions/${regionData?.slug ?? country.region}`}
                  className="text-xs font-medium text-[var(--color-accent-blue)] hover:text-blue-300 transition-colors"
                >
                  {regionData?.name ?? country.region}
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Capital</span>
                <span className="text-xs text-[var(--color-text-secondary)]">{country.capital}</span>
              </div>
              {country.population && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-tertiary)]">Population</span>
                  <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                    {formatNumber(country.population)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">ISO</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">{country.iso3}</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
