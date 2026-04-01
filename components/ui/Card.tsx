import { cn } from '@/lib/utils/cn'

type CardVariant = 'default' | 'elevated' | 'interactive' | 'panel'

interface CardProps {
  variant?: CardVariant
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const variantStyles: Record<CardVariant, string> = {
  default:
    'bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg',
  elevated:
    'bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)] rounded-lg',
  interactive:
    'bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-strong)] transition-all duration-150',
  panel:
    'bg-[var(--color-bg-overlay)]/60 backdrop-blur-md border border-[var(--color-border)] rounded-xl',
}

export function Card({ variant = 'default', children, className, onClick }: CardProps) {
  return (
    <div
      className={cn(variantStyles[variant], className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  )
}
