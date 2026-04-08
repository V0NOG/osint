import { Map, AlertTriangle, Activity, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { RiskIndicator } from '@/components/ui/RiskIndicator'
import { mockRegions } from '@/lib/mock-data/regions'
import { mockCountries } from '@/lib/mock-data/countries'
import Link from 'next/link'

export const metadata = {
  title: 'Regions',
}

export default function RegionsPage() {
  const sortedRegions = [...mockRegions].sort((a, b) => b.overallRiskScore - a.overallRiskScore)

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <Map className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Regions</h1>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Geopolitical risk overview across {mockRegions.length} global regions
        </p>
      </div>

      {/* Regions list */}
      <div className="space-y-4">
        {sortedRegions.map((region) => {
          const regionCountries = mockCountries.filter((c) => region.countries.includes(c.id))
          return (
            <Link
              key={region.id}
              href={`/regions/${region.slug}`}
              className="block bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)] transition-all duration-150"
            >
              {/* Region header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                      {region.name}
                    </h2>
                    <Badge variant={`risk-${region.riskLevel}`}>{region.riskLevel}</Badge>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-2xl">
                    {region.summary}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-3xl font-bold font-mono tabular-nums text-[var(--color-text-primary)]">
                    {region.overallRiskScore}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider">
                    Risk Score
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 mb-4 text-[var(--color-text-tertiary)]">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="text-xs font-medium">{region.activeEventCount} active events</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="text-xs font-medium">{region.activeForecastCount} forecasts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="text-xs font-medium">{regionCountries.length} countries</span>
                </div>
              </div>

              {/* Key tensions */}
              {region.keyTensions.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
                    Key Tensions
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {region.keyTensions.map((tension) => (
                      <span
                        key={tension}
                        className="text-[11px] px-2 py-1 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)]"
                      >
                        {tension}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Countries in region */}
              {regionCountries.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
                    Countries
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {regionCountries.map((country) => (
                      <span
                        key={country.id}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)]"
                      >
                        <span className="text-[10px] font-bold font-mono text-[var(--color-text-tertiary)]">
                          {country.iso2}
                        </span>
                        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                          {country.name}
                        </span>
                        <RiskIndicator level={country.riskLevel} size="xs" variant="dot" />
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
