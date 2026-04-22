'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Bell, CheckCheck, Loader2 } from 'lucide-react'
import { useAlertDrawer } from '@/contexts/alert-drawer'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'
import { formatRelativeDate } from '@/lib/utils/format'
import type { GeopoliticalEvent, EventSeverity } from '@/lib/types'

const SEVERITY_ORDER: Record<EventSeverity, number> = {
  critical: 0,
  high: 1,
  moderate: 2,
  low: 3,
}

const severityBorderClass: Record<EventSeverity, string> = {
  critical: 'border-l-red-500',
  high: 'border-l-orange-500',
  moderate: 'border-l-amber-500',
  low: 'border-l-blue-500',
}

const severityGroups: { label: string; severity: EventSeverity; labelClass: string }[] = [
  { label: 'Critical', severity: 'critical', labelClass: 'text-red-400' },
  { label: 'High', severity: 'high', labelClass: 'text-orange-400' },
  { label: 'Moderate', severity: 'moderate', labelClass: 'text-amber-400' },
  { label: 'Other', severity: 'low', labelClass: 'text-blue-400' },
]

export function AlertDrawer() {
  const { open, unreadCount, closeDrawer, markAllRead } = useAlertDrawer()
  const [events, setEvents] = useState<GeopoliticalEvent[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Fetch top events when drawer opens
  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch('/api/events')
      .then((r) => r.json())
      .then((data: GeopoliticalEvent[]) => {
        const sorted = [...data]
          .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
          .slice(0, 12)
        setEvents(sorted)
      })
      .catch(() => {/* keep previous events on error */})
      .finally(() => setLoading(false))
  }, [open])

  const handleAlertClick = (eventId: string) => {
    router.push(`/events/${eventId}`)
    closeDrawer()
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={closeDrawer} />
      )}

      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 z-50 w-80 flex flex-col',
          'bg-[var(--color-bg-surface)] border-l border-[var(--color-border-strong)]',
          'shadow-2xl transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-3 px-4 py-4 border-b border-[var(--color-border)] flex-shrink-0"
          style={{ paddingTop: 'calc(var(--topbar-height) + 12px)' }}
        >
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Alerts</h2>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] text-[var(--color-accent-blue)] hover:text-blue-300 font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
                Mark read
              </button>
            )}
            <button
              onClick={closeDrawer}
              className="p-1 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-5 h-5 text-[var(--color-text-tertiary)] animate-spin" strokeWidth={1.5} />
            </div>
          ) : events.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-xs text-[var(--color-text-tertiary)]">No events loaded</p>
            </div>
          ) : (
            severityGroups.map(({ label, severity, labelClass }) => {
              const items = events.filter((e) =>
                severity === 'low' ? e.severity === 'low' : e.severity === severity
              )
              if (items.length === 0) return null

              return (
                <div key={severity}>
                  <div className="px-4 py-2 sticky top-0 bg-[var(--color-bg-surface)]/95 backdrop-blur-sm border-b border-[var(--color-border)]">
                    <span className={cn('text-[10px] font-semibold uppercase tracking-widest', labelClass)}>
                      {label}
                    </span>
                  </div>
                  {items.map((event, i) => (
                    <button
                      key={event.id}
                      onClick={() => handleAlertClick(event.id)}
                      className={cn(
                        'w-full text-left px-4 py-3.5 border-b border-[var(--color-border)] border-l-2',
                        'hover:bg-[var(--color-bg-elevated)] transition-colors duration-100',
                        severityBorderClass[event.severity],
                        i < unreadCount ? 'bg-[var(--color-bg-elevated)]/40' : ''
                      )}
                    >
                      <p
                        className={cn(
                          'text-xs font-semibold leading-snug text-left mb-1',
                          i < unreadCount
                            ? 'text-[var(--color-text-primary)]'
                            : 'text-[var(--color-text-secondary)]'
                        )}
                      >
                        {event.title}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed line-clamp-2 text-left mb-1.5">
                        {event.summary}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant={`event-${event.eventType}`} size="sm">
                          {event.eventType}
                        </Badge>
                        <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono">
                          {formatRelativeDate(event.date)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--color-border)] flex-shrink-0">
          <button
            onClick={() => { router.push('/events'); closeDrawer() }}
            className="w-full text-center text-xs text-[var(--color-accent-blue)] hover:text-blue-300 font-medium transition-colors"
          >
            View all events →
          </button>
        </div>
      </div>
    </>
  )
}
