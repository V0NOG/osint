import { Activity, AlertTriangle, Globe, TrendingUp, Zap } from 'lucide-react'
import { WorldGlobeSection } from '@/components/world/WorldGlobeSection'
import { EventCard } from '@/components/event/EventCard'
import { ForecastCard } from '@/components/forecast/ForecastCard'
import { StatBlock } from '@/components/ui/StatBlock'
import { Panel } from '@/components/ui/Panel'
import { Badge } from '@/components/ui/Badge'
import { RiskIndicator } from '@/components/ui/RiskIndicator'
import { mockEvents } from '@/lib/mock-data/events'
import { mockForecasts } from '@/lib/mock-data/forecasts'
import { mockCountries } from '@/lib/mock-data/countries'
import { mockRegions } from '@/lib/mock-data/regions'
import Link from 'next/link'

export const metadata = {
  title: 'World Overview',
}

export default function WorldPage() {
  const criticalEvents = mockEvents.filter((e) => e.severity === 'critical').slice(0, 3)
  const topAlerts = mockEvents.slice(0, 4)
  const activeForecasts = mockForecasts.filter((f) => f.status === 'active').slice(0, 4)
  const criticalCountries = mockCountries.filter((c) => c.riskLevel === 'critical')
  const totalAlerts = mockCountries.reduce((sum, c) => sum + c.alertCount, 0)

  return (
    <div className="flex flex-col h-full">
      {/* Top stat bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]/50 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatBlock
            label="Active Events"
            value={mockEvents.length}
            subtext="Global incidents tracked"
            icon={Zap}
            trend="up"
            trendValue="3 this week"
            variant="alert"
          />
          <StatBlock
            label="Critical Risk"
            value={criticalCountries.length}
            subtext="Countries at critical risk"
            icon={AlertTriangle}
            variant="alert"
          />
          <StatBlock
            label="Active Forecasts"
            value={mockForecasts.filter((f) => f.status === 'active').length}
            subtext="Open forecast questions"
            icon={Activity}
          />
          <StatBlock
            label="Total Alerts"
            value={totalAlerts}
            subtext="Pending analyst review"
            icon={TrendingUp}
            trend="up"
            trendValue="12 new"
          />
        </div>
      </div>

      {/* Main content grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-0 overflow-hidden">
        {/* Globe + forecasts column */}
        <div className="flex flex-col overflow-y-auto">
          {/* Globe area */}
          <div className="flex-1 min-h-[480px] p-6 pb-0">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                  World Overview
                </h2>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                  Live geopolitical risk assessment — {new Date('2026-04-01').toLocaleDateString('en-US', { dateStyle: 'long' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium uppercase tracking-wider">
                  Live
                </span>
              </div>
            </div>

            {/* Risk legend */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              {(['critical', 'high', 'elevated', 'moderate', 'low'] as const).map((level) => (
                <RiskIndicator key={level} level={level} size="xs" variant="dot" />
              ))}
            </div>

            {/* Globe */}
            <WorldGlobeSection countries={mockCountries} />
          </div>

          {/* Region risk summary strip */}
          <div className="px-6 pt-4 pb-2">
            <h3 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">
              Regional Risk Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {mockRegions.map((region) => (
                <Link
                  key={region.id}
                  href={`/regions`}
                  className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-3 hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-strong)] transition-all duration-150 group"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-medium text-[var(--color-text-secondary)] truncate group-hover:text-[var(--color-text-primary)] transition-colors">
                      {region.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-bold text-[var(--color-text-primary)]">
                      {region.overallRiskScore}
                    </span>
                    <Badge variant={`risk-${region.riskLevel}`} size="sm">
                      {region.riskLevel}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Active forecasts strip */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Active Forecasts
              </h3>
              <Link
                href="/forecasts"
                className="text-[11px] text-[var(--color-accent-blue)] hover:text-blue-300 font-medium transition-colors duration-150"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeForecasts.map((forecast) => (
                <ForecastCard key={forecast.id} forecast={forecast} variant="compact" />
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — alerts */}
        <div className="border-l border-[var(--color-border)] bg-[var(--color-bg-surface)]/30 overflow-y-auto">
          <div className="p-4 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-bg-surface)]/95 backdrop-blur-sm z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Top Alerts
                </h3>
                <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">
                  Priority incidents requiring attention
                </p>
              </div>
              <Badge variant="risk-critical" size="sm">
                {criticalEvents.length} critical
              </Badge>
            </div>
          </div>

          <div className="p-3 space-y-2">
            {topAlerts.map((event) => (
              <EventCard key={event.id} event={event} variant="compact" />
            ))}
          </div>

          {/* Critical countries */}
          <div className="p-4 border-t border-[var(--color-border)] mt-2">
            <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">
              Critical Risk Countries
            </h4>
            <div className="space-y-2">
              {criticalCountries.map((country) => (
                <Link
                  key={country.id}
                  href={`/countries/${country.slug}`}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[var(--color-bg-elevated)]/50 border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)] transition-all duration-150 group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-4 rounded-sm bg-[var(--color-bg-overlay)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-[var(--color-text-tertiary)] font-mono">
                        {country.iso2}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors truncate">
                      {country.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-sm font-bold text-red-400">
                      {country.overallRiskScore}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Global stats */}
          <div className="p-4 border-t border-[var(--color-border)]">
            <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">
              Platform Stats
            </h4>
            <div className="space-y-2">
              {[
                { label: 'Countries tracked', value: mockCountries.length },
                { label: 'Regions monitored', value: mockRegions.length },
                { label: 'Events catalogued', value: mockEvents.length },
                { label: 'Open forecasts', value: mockForecasts.filter(f => f.status === 'active').length },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-tertiary)]">{stat.label}</span>
                  <span className="text-xs font-mono font-semibold text-[var(--color-text-primary)]">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
