import Link from 'next/link'
import { Calendar, ChevronUp, ChevronDown, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'
import { getProbabilityColor } from '@/lib/utils/risk'
import { formatDate } from '@/lib/utils/format'
import type { Forecast } from '@/lib/types'

interface ForecastCardProps {
  forecast: Forecast
  className?: string
  variant?: 'compact' | 'full'
}

function ProbabilityChange({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous
  if (Math.abs(diff) < 1) return <Minus className="w-3 h-3 text-[var(--color-text-tertiary)]" />
  if (diff > 0)
    return (
      <div className="flex items-center gap-0.5 text-red-400">
        <ChevronUp className="w-3 h-3" />
        <span className="text-[10px] font-medium">{diff}pp</span>
      </div>
    )
  return (
    <div className="flex items-center gap-0.5 text-green-400">
      <ChevronDown className="w-3 h-3" />
      <span className="text-[10px] font-medium">{Math.abs(diff)}pp</span>
    </div>
  )
}

export function ForecastCard({ forecast, className, variant = 'full' }: ForecastCardProps) {
  const probColor = getProbabilityColor(forecast.probability)
  const previousProb = forecast.history[forecast.history.length - 2]?.probability

  const confidenceColors = {
    high: 'text-green-400',
    medium: 'text-amber-400',
    low: 'text-red-400',
  }

  return (
    <Link href={`/forecasts/${forecast.id}`} className="block group">
      <div
        className={cn(
          'bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg',
          'hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-strong)]',
          'transition-all duration-150 h-full flex flex-col',
          variant === 'compact' ? 'p-3' : 'p-4',
          className
        )}
      >
        {/* Status + target date */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant={`status-${forecast.status}`}>{forecast.status}</Badge>
          <div className="flex items-center gap-1 text-[var(--color-text-tertiary)]">
            <Calendar className="w-3 h-3" strokeWidth={1.5} />
            <span className="text-[10px]">{formatDate(forecast.targetDate)}</span>
          </div>
        </div>

        {/* Probability + title row */}
        <div className="flex items-start gap-4 mb-3 flex-1">
          {/* Big probability number */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className={cn('text-3xl font-bold font-mono tabular-nums leading-none', probColor)}>
              {forecast.probability}
              <span className="text-lg">%</span>
            </div>
            <span className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5 font-medium uppercase tracking-wider">
              prob.
            </span>
            {previousProb !== undefined && (
              <div className="mt-1">
                <ProbabilityChange current={forecast.probability} previous={previousProb} />
              </div>
            )}
          </div>

          {/* Question */}
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                'font-semibold text-[var(--color-text-primary)] group-hover:text-white transition-colors duration-150 leading-snug',
                variant === 'compact' ? 'text-xs line-clamp-3' : 'text-sm line-clamp-3'
              )}
            >
              {forecast.question}
            </h3>
          </div>
        </div>

        {/* Rationale snippet — full only */}
        {variant === 'full' && (
          <p className="text-xs text-[var(--color-text-tertiary)] line-clamp-2 mb-3 leading-relaxed">
            {forecast.rationale.slice(0, 160)}...
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 pt-2.5 border-t border-[var(--color-border)] mt-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
              Confidence:
            </span>
            <span
              className={cn(
                'text-[10px] font-semibold uppercase tracking-wide',
                confidenceColors[forecast.confidenceLevel]
              )}
            >
              {forecast.confidenceLevel}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
            <span className="text-[10px]">v{forecast.versionNumber}</span>
            <span className="text-[10px] opacity-60">·</span>
            <span className="text-[10px]">{forecast.timeHorizon}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
