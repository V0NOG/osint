import { cn } from '@/lib/utils/cn'

interface PanelProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export function Panel({ children, className, title, subtitle, action }: PanelProps) {
  return (
    <div
      className={cn(
        'bg-[var(--color-bg-overlay)]/60 backdrop-blur-md border border-[var(--color-border)] rounded-xl',
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-[var(--color-border)]">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] tracking-wide">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0 ml-4">{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
