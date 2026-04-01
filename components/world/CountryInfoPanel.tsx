'use client'

import Link from 'next/link'
import { X, AlertTriangle, Activity, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { RiskIndicator } from '@/components/ui/RiskIndicator'
import { getRiskTextClass, getRiskColor } from '@/lib/utils/risk'
import { cn } from '@/lib/utils/cn'
import type { Country, RiskLevel } from '@/lib/types'

interface CountryInfoPanelProps {
  country: Country
  onClose: () => void
}

const RISK_CATEGORY_LABELS: Record<keyof Country['riskCategories'], string> = {
  political: 'Political',
  military: 'Military',
  economic: 'Economic',
  social: 'Social',
  environmental: 'Environmental',
}

function RiskCategoryBar({
  label,
  score,
}: {
  label: string
  score: number
}) {
  const level: RiskLevel =
    score >= 85 ? 'critical'
    : score >= 70 ? 'high'
    : score >= 55 ? 'elevated'
    : score >= 40 ? 'moderate'
    : score >= 20 ? 'low'
    : 'minimal'

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[var(--color-text-tertiary)] w-20 flex-shrink-0 truncate">
        {label}
      </span>
      <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${score}%`,
            backgroundColor: getRiskColor(level),
            opacity: 0.85,
          }}
        />
      </div>
      <span
        className={cn(
          'font-mono text-[10px] tabular-nums w-6 text-right',
          getRiskTextClass(level)
        )}
      >
        {score}
      </span>
    </div>
  )
}

export function CountryInfoPanel({ country, onClose }: CountryInfoPanelProps) {
  return (
    <div
      className={cn(
        'absolute bottom-4 right-4 w-72 z-20',
        'bg-[var(--color-bg-overlay)]/90 backdrop-blur-xl',
        'border border-[var(--color-border-strong)] rounded-xl',
        'shadow-2xl shadow-black/50',
        'animate-in slide-in-from-bottom-2 fade-in duration-200'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3 border-b border-[var(--color-border)]">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-5 rounded-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-bold text-[var(--color-text-tertiary)] font-mono tracking-wider">
                {country.iso2}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
              {country.name}
            </h3>
          </div>
          <RiskIndicator level={country.riskLevel} size="xs" variant="full" />
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-white/8 transition-all duration-150"
          aria-label="Close panel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Risk score + badges */}
      <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-[var(--color-border)]">
        <div>
          <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">
            Overall Risk
          </p>
          <span
            className={cn(
              'font-mono text-2xl font-bold tabular-nums',
              getRiskTextClass(country.riskLevel)
            )}
          >
            {country.overallRiskScore}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge variant={`risk-${country.riskLevel}`} size="sm">
            {country.riskLevel}
          </Badge>
          <span className="text-[10px] text-[var(--color-text-tertiary)]">
            {country.capital}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed line-clamp-3">
          {country.summary}
        </p>
      </div>

      {/* Risk category breakdown */}
      <div className="px-4 py-3 border-b border-[var(--color-border)] space-y-2">
        <p className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
          Risk Breakdown
        </p>
        {(Object.entries(country.riskCategories) as [keyof Country['riskCategories'], number][]).map(
          ([key, score]) => (
            <RiskCategoryBar
              key={key}
              label={RISK_CATEGORY_LABELS[key]}
              score={score}
            />
          )
        )}
      </div>

      {/* Alert + forecast counts */}
      <div className="px-4 py-3 grid grid-cols-2 gap-2 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 bg-[var(--color-bg-elevated)]/60 rounded-lg px-2.5 py-2">
          <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" strokeWidth={1.75} />
          <div>
            <p className="font-mono text-sm font-bold text-[var(--color-text-primary)]">
              {country.alertCount}
            </p>
            <p className="text-[9px] text-[var(--color-text-tertiary)]">Alerts</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-bg-elevated)]/60 rounded-lg px-2.5 py-2">
          <Activity className="w-3 h-3 text-blue-400 flex-shrink-0" strokeWidth={1.75} />
          <div>
            <p className="font-mono text-sm font-bold text-[var(--color-text-primary)]">
              {country.activeForecastCount}
            </p>
            <p className="text-[9px] text-[var(--color-text-tertiary)]">Forecasts</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 py-3">
        <Link
          href={`/countries/${country.slug}`}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-[var(--color-accent-blue)]/12 border border-[var(--color-accent-blue)]/20 text-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)]/20 hover:border-[var(--color-accent-blue)]/35 transition-all duration-150 group"
        >
          <span className="text-xs font-medium">View Country Profile</span>
          <ArrowRight
            className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        </Link>
      </div>
    </div>
  )
}
