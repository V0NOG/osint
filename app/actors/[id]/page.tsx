import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Globe, Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Panel } from '@/components/ui/Panel'
import { EventCard } from '@/components/event/EventCard'
import { getActorById } from '@/lib/db/actors'
import { cn } from '@/lib/utils/cn'
import type { ActorType } from '@/lib/types'

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps) {
  const actor = await getActorById(params.id)
  return { title: actor?.name ?? 'Actor' }
}

const TYPE_COLORS: Record<ActorType, string> = {
  state: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'non-state': 'text-red-400 bg-red-500/10 border-red-500/20',
  'international-org': 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  individual: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
}

const TYPE_LABELS: Record<ActorType, string> = {
  state: 'State Actor',
  'non-state': 'Non-State Actor',
  'international-org': 'International Organization',
  individual: 'Individual',
}

const RISK_ACCENT: Record<string, string> = {
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
}

export default async function ActorDetailPage({ params }: PageProps) {
  const actor = await getActorById(params.id)
  if (!actor) notFound()

  const accentColor = RISK_ACCENT[actor.riskContribution] ?? '#6b7280'
  const countryMap: Record<string, string> = Object.fromEntries(
    actor.countryObjects.map((c) => [c.id, c.name])
  )

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <Link
        href="/actors"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] mb-5 transition-colors duration-150"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Actors
      </Link>

      {/* Hero */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-5 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />

        <div className="relative flex items-start justify-between gap-6 mb-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1.5">
                {actor.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    'text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border',
                    TYPE_COLORS[actor.type]
                  )}
                >
                  {TYPE_LABELS[actor.type]}
                </span>
                <Badge
                  variant={
                    actor.riskContribution === 'high'
                      ? 'risk-high'
                      : actor.riskContribution === 'medium'
                      ? 'risk-moderate'
                      : 'risk-low'
                  }
                >
                  {actor.riskContribution} risk contribution
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="text-right flex-shrink-0 space-y-1">
            <div className="flex items-center gap-2 justify-end text-[var(--color-text-tertiary)]">
              <Globe className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="text-xs">{actor.countryObjects.length} countries</span>
            </div>
            <div className="flex items-center gap-2 justify-end text-[var(--color-text-tertiary)]">
              <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="text-xs">{actor.eventObjects.length} recent events</span>
            </div>
          </div>
        </div>

        {/* Role */}
        <p className="relative text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
          {actor.role}
        </p>

        {/* Description */}
        <p className="relative text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
          {actor.description}
        </p>

        {/* Affiliations */}
        {(actor.affiliations ?? []).length > 0 && (
          <div className="relative flex flex-wrap gap-1.5 border-t border-[var(--color-border)] pt-4">
            <span className="text-[11px] text-[var(--color-text-tertiary)] font-medium self-center mr-1">
              Affiliations:
            </span>
            {(actor.affiliations ?? []).map((aff) => (
              <span
                key={aff}
                className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-[var(--color-text-secondary)] border border-white/8 font-medium"
              >
                {aff}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
        {/* Events */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Associated Events
            </h2>
            <Link
              href="/events"
              className="text-[11px] text-[var(--color-accent-blue)] hover:text-blue-300 font-medium transition-colors"
            >
              View all →
            </Link>
          </div>
          {actor.eventObjects.length > 0 ? (
            <div className="space-y-2.5">
              {actor.eventObjects.map((event) => (
                <EventCard key={event.id} event={event} countryMap={countryMap} />
              ))}
            </div>
          ) : (
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-6 text-center">
              <p className="text-sm text-[var(--color-text-tertiary)]">No events associated</p>
            </div>
          )}
        </section>

        {/* Countries sidebar */}
        <div className="space-y-4">
          <Panel
            title="Associated Countries"
            subtitle={`${actor.countryObjects.length} countries`}
          >
            <div className="divide-y divide-[var(--color-border)]">
              {actor.countryObjects.length > 0 ? (
                actor.countryObjects.map((country) => (
                  <Link
                    key={country.id}
                    href={`/countries/${country.slug}`}
                    className="flex items-center justify-between gap-2 px-5 py-3 hover:bg-[var(--color-bg-elevated)] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-bold font-mono text-[var(--color-text-tertiary)] bg-white/5 px-1.5 py-0.5 rounded">
                        {country.iso2}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                        {country.name}
                      </span>
                    </div>
                    <Badge variant={`risk-${country.riskLevel}`} size="sm">
                      {country.riskLevel}
                    </Badge>
                  </Link>
                ))
              ) : (
                <div className="px-5 py-4 text-xs text-[var(--color-text-tertiary)]">
                  No countries linked
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
