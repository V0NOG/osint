import { cn } from '@/lib/utils/cn'
import { getRiskColor, getRiskLabel, getRiskTextClass } from '@/lib/utils/risk'
import type { RiskLevel } from '@/lib/types'

interface RiskIndicatorProps {
  level: RiskLevel
  score?: number
  showScore?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'dot' | 'bar' | 'full'
}

export function RiskIndicator({
  level,
  score,
  showScore = false,
  size = 'sm',
  variant = 'dot',
}: RiskIndicatorProps) {
  const color = getRiskColor(level)
  const label = getRiskLabel(level)
  const textClass = getRiskTextClass(level)

  const dotSize = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  }[size]

  const textSize = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size]

  if (variant === 'bar') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${score ?? 50}%`,
              backgroundColor: color,
              opacity: 0.8,
            }}
          />
        </div>
        {showScore && score !== undefined && (
          <span className={cn('font-mono text-xs tabular-nums w-6 text-right', textClass)}>
            {score}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'full') {
    return (
      <div className="flex items-center gap-2">
        <div className="relative flex-shrink-0">
          <div
            className={cn('rounded-full', dotSize)}
            style={{ backgroundColor: color }}
          />
          {(level === 'critical' || level === 'high') && (
            <div
              className={cn('absolute inset-0 rounded-full animate-pulse-ring opacity-60', dotSize)}
              style={{ backgroundColor: color }}
            />
          )}
        </div>
        <span className={cn('font-medium', textSize, textClass)}>{label}</span>
        {showScore && score !== undefined && (
          <span className="font-mono text-xs text-[var(--color-text-tertiary)] tabular-nums">
            {score}
          </span>
        )}
      </div>
    )
  }

  // dot variant (default)
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative flex-shrink-0">
        <div
          className={cn('rounded-full flex-shrink-0', dotSize)}
          style={{ backgroundColor: color }}
        />
      </div>
      <span className={cn('font-medium', textSize, textClass)}>{label}</span>
      {showScore && score !== undefined && (
        <span className="font-mono text-xs text-[var(--color-text-tertiary)] tabular-nums ml-1">
          {score}
        </span>
      )}
    </div>
  )
}
