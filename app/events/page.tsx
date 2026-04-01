import { Zap, Filter } from 'lucide-react'
import { EventCard } from '@/components/event/EventCard'
import { Badge } from '@/components/ui/Badge'
import { mockEvents } from '@/lib/mock-data/events'
import type { EventType, EventSeverity } from '@/lib/types'

export const metadata = {
  title: 'Events',
}

const eventTypes: EventType[] = ['military', 'diplomatic', 'economic', 'political', 'humanitarian', 'cyber']
const severities: EventSeverity[] = ['critical', 'high', 'moderate', 'low']

const eventTypeLabels: Record<EventType, string> = {
  military: 'Military',
  diplomatic: 'Diplomatic',
  economic: 'Economic',
  political: 'Political',
  humanitarian: 'Humanitarian',
  cyber: 'Cyber',
}

const severityColors: Record<EventSeverity, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  moderate: 'text-amber-400',
  low: 'text-blue-400',
}

export default function EventsPage() {
  // Sort by date descending
  const sortedEvents = [...mockEvents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const bySeverity = severities.reduce<Record<string, typeof mockEvents>>((acc, sev) => {
    acc[sev] = sortedEvents.filter((e) => e.severity === sev)
    return acc
  }, {})

  const byType = eventTypes.reduce<Record<string, number>>((acc, type) => {
    acc[type] = sortedEvents.filter((e) => e.eventType === type).length
    return acc
  }, {})

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Zap className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Events</h1>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {mockEvents.length} events tracked — sorted by date
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] transition-all duration-150">
            <Filter className="w-3.5 h-3.5" strokeWidth={1.75} />
            Type
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] transition-all duration-150">
            <Filter className="w-3.5 h-3.5" strokeWidth={1.75} />
            Severity
          </button>
        </div>
      </div>

      {/* Type distribution */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        {eventTypes.map((type) => (
          <div
            key={type}
            className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-3 text-center"
          >
            <div className="text-lg font-bold font-mono tabular-nums text-[var(--color-text-primary)]">
              {byType[type]}
            </div>
            <div className="mt-1">
              <Badge variant={`event-${type}`} size="sm">
                {eventTypeLabels[type]}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Events by severity */}
      <div className="space-y-6">
        {severities.map((severity) => {
          const events = bySeverity[severity]
          if (!events || events.length === 0) return null
          return (
            <section key={severity}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`text-xs font-semibold uppercase tracking-wider ${severityColors[severity]}`}>
                  {severity} Severity
                </div>
                <div className="flex-1 h-px bg-[var(--color-border)]" />
                <span className="text-[11px] text-[var(--color-text-tertiary)]">
                  {events.length} {events.length === 1 ? 'event' : 'events'}
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
