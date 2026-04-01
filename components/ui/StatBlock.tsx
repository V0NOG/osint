import { cn } from '@/lib/utils/cn'
import { type LucideIcon } from 'lucide-react'

interface StatBlockProps {
  label: string
  value: string | number
  subtext?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  variant?: 'default' | 'alert' | 'positive'
  className?: string
}

export function StatBlock({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  className,
}: StatBlockProps) {
  const trendColor =
    trend === 'up'
      ? 'text-red-400'
      : trend === 'down'
      ? 'text-green-400'
      : 'text-[var(--color-text-tertiary)]'

  const variantValueClass =
    variant === 'alert'
      ? 'text-red-400'
      : variant === 'positive'
      ? 'text-green-400'
      : 'text-[var(--color-text-primary)]'

  return (
    <div
      className={cn(
        'flex flex-col gap-1',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        {Icon && (
          <Icon
            className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] flex-shrink-0"
            strokeWidth={1.75}
          />
        )}
        <span className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={cn('text-2xl font-bold font-mono tabular-nums', variantValueClass)}>
          {value}
        </span>
        {trendValue && trend && (
          <span className={cn('text-xs font-medium', trendColor)}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        )}
      </div>
      {subtext && (
        <span className="text-[11px] text-[var(--color-text-tertiary)]">{subtext}</span>
      )}
    </div>
  )
}
