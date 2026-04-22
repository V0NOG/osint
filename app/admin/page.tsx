import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Database, Activity, Calendar, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { getRecentEvents } from '@/lib/db/events'
import { IngestionPanel } from '@/components/admin/IngestionPanel'
import { ForecastGenerationPanel } from '@/components/admin/ForecastGenerationPanel'
import { ResetPanel } from '@/components/admin/ResetPanel'
import Link from 'next/link'
import { formatRelativeDate } from '@/lib/utils/format'

export const metadata = { title: 'Admin — Ingestion' }

// Do not cache this page — show live data
export const dynamic = 'force-dynamic'

const eventTypeLabels: Record<string, string> = {
  military: 'Military',
  diplomatic: 'Diplomatic',
  economic: 'Economic',
  political: 'Political',
  humanitarian: 'Humanitarian',
  cyber: 'Cyber',
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role?: string })?.role !== 'admin') {
    redirect('/auth/signin')
  }

  const recentEvents = await getRecentEvents(30)

  // Count events ingested in last 24h
  const oneDayAgo = new Date(Date.now() - 86_400_000)
  const last24h = recentEvents.filter(
    (e) => new Date(e.createdAt ?? e.date) > oneDayAgo
  ).length

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Database className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
              Ingestion Control
            </h1>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Manage and trigger source ingestion pipelines
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
            <Activity className="w-3.5 h-3.5 text-green-400" strokeWidth={1.75} />
            <span className="text-xs font-mono text-[var(--color-text-secondary)]">
              {last24h} events in last 24h
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left: ingestion controls */}
        <div className="space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
              Pipeline Sources
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mb-4">
              Trigger ingestion from one or all configured sources. Duplicate events are
              automatically skipped using URL-based deduplication.
            </p>
            <IngestionPanel />
          </div>

          {/* AI forecast generation */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
              AI Forecasting
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mb-4">
              Use Claude to automatically generate structured forecasts from recent events.
            </p>
            <ForecastGenerationPanel />
          </div>

          {/* Danger zone */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
              Danger Zone
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mb-4">
              Wipe ingested events and generated forecasts to start fresh.
            </p>
            <ResetPanel />
          </div>

          {/* Setup instructions */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5">
            <h3 className="text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider mb-3">
              Environment Variables
            </h3>
            <div className="space-y-2">
              {[
                {
                  key: 'INGEST_API_KEY',
                  desc: 'Bearer token required to call POST /api/ingest (optional in dev)',
                  required: false,
                },
                {
                  key: 'ANTHROPIC_API_KEY',
                  desc: 'Required for AI forecast generation — get from console.anthropic.com',
                  required: true,
                },
              ].map((env) => (
                <div
                  key={env.key}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)]"
                >
                  <code className="text-[11px] font-mono text-blue-300 flex-shrink-0 mt-0.5">
                    {env.key}
                  </code>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[var(--color-text-secondary)]">{env.desc}</p>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${
                      env.required
                        ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                        : 'bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-tertiary)]'
                    }`}
                  >
                    {env.required ? 'required' : 'optional'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: recent events */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Recently Ingested
            </h2>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">
              {recentEvents.length} events
            </span>
          </div>

          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
            {recentEvents.length === 0 ? (
              <div className="p-8 text-center">
                <Zap className="w-8 h-8 text-[var(--color-text-tertiary)] mx-auto mb-2 opacity-40" strokeWidth={1} />
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  No events yet. Run the ingestion pipeline to populate data.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {recentEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--color-bg-elevated)] transition-colors duration-150 group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors leading-snug truncate mb-1">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={`event-${event.eventType}`} size="sm">
                          {eventTypeLabels[event.eventType] ?? event.eventType}
                        </Badge>
                        <Badge variant={`severity-${event.severity}`} size="sm">
                          {event.severity}
                        </Badge>
                        <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-tertiary)]">
                          <Calendar className="w-2.5 h-2.5" />
                          {formatRelativeDate(event.date)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
