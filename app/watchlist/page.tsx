import { Star, Flag, Zap, Target, Plus, type LucideIcon } from 'lucide-react'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'

export const metadata = {
  title: 'Watchlist',
}

function EmptySection({
  icon: Icon,
  label,
  description,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon
  label: string
  description: string
  actionLabel: string
  actionHref: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">{label}</p>
      <p className="text-xs text-[var(--color-text-tertiary)] mb-4 max-w-xs leading-relaxed">
        {description}
      </p>
      <a
        href={actionHref}
        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent-blue)] hover:text-blue-300 font-medium transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        {actionLabel}
      </a>
    </div>
  )
}

export default function WatchlistPage() {
  return (
    <div className="p-6 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Star className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Watchlist</h1>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Track countries, events, and forecasts important to you
          </p>
        </div>
        <Button variant="primary" size="sm">
          <Plus className="w-3.5 h-3.5" />
          Add item
        </Button>
      </div>

      {/* Hero empty state */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-10 text-center mb-6">
        <div className="w-14 h-14 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
          <Star className="w-7 h-7 text-[var(--color-text-tertiary)]" strokeWidth={1.25} />
        </div>
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">
          Your watchlist is empty
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto leading-relaxed mb-6">
          Add countries, events, and forecasts to your watchlist to track them in one place and
          receive priority alerts when they update.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a
            href="/countries"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] transition-all duration-150"
          >
            <Flag className="w-3.5 h-3.5" strokeWidth={1.75} />
            Browse Countries
          </a>
          <a
            href="/events"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] transition-all duration-150"
          >
            <Zap className="w-3.5 h-3.5" strokeWidth={1.75} />
            Browse Events
          </a>
          <a
            href="/forecasts"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] transition-all duration-150"
          >
            <Target className="w-3.5 h-3.5" strokeWidth={1.75} />
            Browse Forecasts
          </a>
        </div>
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Panel title="Countries" subtitle="Tracked country profiles">
          <EmptySection
            icon={Flag}
            label="No countries tracked"
            description="Add high-risk or high-interest countries to monitor risk changes."
            actionLabel="Browse countries"
            actionHref="/countries"
          />
        </Panel>

        <Panel title="Events" subtitle="Tracked events">
          <EmptySection
            icon={Zap}
            label="No events tracked"
            description="Follow ongoing incidents and receive updates as new information arrives."
            actionLabel="Browse events"
            actionHref="/events"
          />
        </Panel>

        <Panel title="Forecasts" subtitle="Tracked forecasts">
          <EmptySection
            icon={Target}
            label="No forecasts tracked"
            description="Watch specific forecast questions and get notified on probability changes."
            actionLabel="Browse forecasts"
            actionHref="/forecasts"
          />
        </Panel>
      </div>
    </div>
  )
}
