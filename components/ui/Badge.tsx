import { cn } from '@/lib/utils/cn'
import type { RiskLevel, EventType, EventSeverity, ForecastStatus } from '@/lib/types'

type BadgeVariant =
  | `risk-${RiskLevel}`
  | `event-${EventType}`
  | `severity-${EventSeverity}`
  | `status-${ForecastStatus}`
  | 'reliability-high'
  | 'reliability-medium'
  | 'reliability-low'
  | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md'
}

const variantStyles: Record<string, string> = {
  // Risk levels
  'risk-critical': 'bg-red-500/15 text-red-400 border-red-500/25',
  'risk-high': 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  'risk-elevated': 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  'risk-moderate': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  'risk-low': 'bg-green-500/15 text-green-400 border-green-500/25',
  'risk-minimal': 'bg-gray-500/15 text-gray-400 border-gray-500/25',

  // Event types
  'event-military': 'bg-red-500/12 text-red-300 border-red-500/20',
  'event-diplomatic': 'bg-blue-500/12 text-blue-300 border-blue-500/20',
  'event-economic': 'bg-amber-500/12 text-amber-300 border-amber-500/20',
  'event-political': 'bg-violet-500/12 text-violet-300 border-violet-500/20',
  'event-humanitarian': 'bg-emerald-500/12 text-emerald-300 border-emerald-500/20',
  'event-cyber': 'bg-cyan-500/12 text-cyan-300 border-cyan-500/20',

  // Severity
  'severity-critical': 'bg-red-500/15 text-red-400 border-red-500/25',
  'severity-high': 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  'severity-moderate': 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  'severity-low': 'bg-blue-500/15 text-blue-400 border-blue-500/25',

  // Forecast status
  'status-active': 'bg-blue-500/12 text-blue-300 border-blue-500/20',
  'status-resolved': 'bg-green-500/12 text-green-300 border-green-500/20',
  'status-expired': 'bg-gray-500/12 text-gray-400 border-gray-500/20',
  'status-draft': 'bg-violet-500/12 text-violet-300 border-violet-500/20',

  // Source reliability
  'reliability-high': 'bg-green-500/12 text-green-300 border-green-500/20',
  'reliability-medium': 'bg-amber-500/12 text-amber-300 border-amber-500/20',
  'reliability-low': 'bg-red-500/12 text-red-300 border-red-500/20',

  // Default
  default: 'bg-white/5 text-[var(--color-text-secondary)] border-white/10',
}

export function Badge({ variant = 'default', children, className, size = 'sm' }: BadgeProps) {
  const variantClass = variantStyles[variant] ?? variantStyles.default

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded tracking-wide uppercase',
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1',
        variantClass,
        className
      )}
    >
      {children}
    </span>
  )
}
