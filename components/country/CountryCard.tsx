import Link from 'next/link'
import { AlertTriangle, TrendingUp, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { RiskIndicator } from '@/components/ui/RiskIndicator'
import { cn } from '@/lib/utils/cn'
import type { Country } from '@/lib/types'

interface CountryCardProps {
  country: Country
  className?: string
}

const categoryLabels = {
  political: 'Pol',
  military: 'Mil',
  economic: 'Econ',
  social: 'Soc',
  environmental: 'Env',
}

function MiniScoreBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 80
      ? 'bg-red-500'
      : score >= 65
      ? 'bg-orange-500'
      : score >= 50
      ? 'bg-amber-500'
      : score >= 35
      ? 'bg-yellow-500'
      : 'bg-green-500'

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[10px] text-[var(--color-text-tertiary)] w-6 flex-shrink-0 font-medium">
        {label}
      </span>
      <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden min-w-[40px]">
        <div
          className={cn('h-full rounded-full transition-all duration-300', color)}
          style={{ width: `${score}%`, opacity: 0.7 }}
        />
      </div>
      <span className="text-[10px] font-mono tabular-nums text-[var(--color-text-tertiary)] w-5 text-right flex-shrink-0">
        {score}
      </span>
    </div>
  )
}

export function CountryCard({ country, className }: CountryCardProps) {
  return (
    <Link href={`/countries/${country.slug}`} className="block group">
      <div
        className={cn(
          'bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-4',
          'hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-strong)]',
          'transition-all duration-150 h-full',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-5 rounded-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] font-mono">
                {country.iso2}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate group-hover:text-white transition-colors duration-150">
                {country.name}
              </h3>
              <p className="text-[10px] text-[var(--color-text-tertiary)]">{country.capital}</p>
            </div>
          </div>
          <div className="flex-shrink-0 flex flex-col items-end gap-1">
            <div className="font-mono text-xl font-bold text-[var(--color-text-primary)] tabular-nums leading-none">
              {country.overallRiskScore}
            </div>
            <Badge variant={`risk-${country.riskLevel}`} size="sm">
              {country.riskLevel}
            </Badge>
          </div>
        </div>

        {/* Summary */}
        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-3 leading-relaxed">
          {country.summary}
        </p>

        {/* Risk breakdown */}
        <div className="space-y-1.5 mb-3">
          {Object.entries(country.riskCategories).map(([key, score]) => (
            <MiniScoreBar
              key={key}
              label={categoryLabels[key as keyof typeof categoryLabels]}
              score={score}
            />
          ))}
        </div>

        {/* Footer stats */}
        <div className="flex items-center gap-3 pt-2.5 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
            <AlertTriangle className="w-3 h-3" strokeWidth={1.75} />
            <span className="text-[11px] font-medium">{country.alertCount} alerts</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
            <Activity className="w-3 h-3" strokeWidth={1.75} />
            <span className="text-[11px] font-medium">{country.activeForecastCount} forecasts</span>
          </div>
          <div className="ml-auto">
            <RiskIndicator level={country.riskLevel} size="xs" variant="dot" />
          </div>
        </div>
      </div>
    </Link>
  )
}
