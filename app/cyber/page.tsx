import Link from 'next/link'
import { Shield, ExternalLink, Zap, AlertTriangle, Radio } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Panel } from '@/components/ui/Panel'
import { getEvents } from '@/lib/db/events'
import { CYBER_FEEDS } from '@/lib/ingestion/adapters/sources'
import { formatRelativeDate } from '@/lib/utils/format'

export const metadata = {
  title: 'Cyber Intelligence',
}

const SEVERITY_CLASS: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  moderate: 'text-amber-400',
  low: 'text-blue-400',
}

const THREAT_STATS = [
  { label: 'Active APT Groups', value: '47', delta: '+3 this month' },
  { label: 'Critical CVEs (30d)', value: '218', delta: '+12% vs prior month' },
  { label: 'Nation-State Incidents', value: '31', delta: 'YTD 2026' },
  { label: 'Ransomware Campaigns', value: '89', delta: 'Active globally' },
]

export default async function CyberPage() {
  const allEvents = await getEvents({ eventType: 'cyber', limit: 40 })

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <Shield className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Cyber Intelligence</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25 uppercase tracking-wider">
            Domain
          </span>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Nation-state cyber operations, critical infrastructure threats, APT activity, and global vulnerability tracking.
        </p>
      </div>

      {/* Threat stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {THREAT_STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-4"
          >
            <div className="text-2xl font-bold text-[var(--color-text-primary)] font-mono mb-0.5">
              {stat.value}
            </div>
            <div className="text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
              {stat.label}
            </div>
            <div className="text-[10px] text-[var(--color-text-tertiary)]">{stat.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        {/* Events feed */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Cyber Events</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-[11px] text-[var(--color-text-tertiary)]">{allEvents.length} events</span>
          </div>

          {allEvents.length === 0 ? (
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-10 text-center">
              <Shield className="w-8 h-8 text-[var(--color-text-tertiary)] mx-auto mb-3" strokeWidth={1.25} />
              <p className="text-sm text-[var(--color-text-secondary)]">No cyber events ingested yet.</p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                Enable cyber feeds in{' '}
                <Link href="/admin" className="text-[var(--color-accent-blue)] hover:underline">
                  Ingestion
                </Link>{' '}
                to populate this feed.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {allEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group block bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-4 hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-strong)] transition-all duration-150"
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="event-cyber" size="sm">Cyber</Badge>
                      <span className={`text-[11px] font-medium ${SEVERITY_CLASS[event.severity]}`}>
                        {event.severity}
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono flex-shrink-0">
                      {formatRelativeDate(event.date)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-blue)] leading-snug transition-colors line-clamp-2">
                    {event.title}
                  </p>
                  {event.summary && (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                      {event.summary}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Active feed sources */}
          <Panel title="Cyber Feeds" subtitle={`${CYBER_FEEDS.length} sources`}>
            <div className="divide-y divide-[var(--color-border)]">
              {CYBER_FEEDS.map((feed) => (
                <div key={feed.key} className="px-5 py-3 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--color-text-primary)] leading-snug">
                      {feed.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant={`reliability-${feed.reliability}`} size="sm">
                        {feed.reliability}
                      </Badge>
                    </div>
                  </div>
                  <a
                    href={feed.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-1 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                  </a>
                </div>
              ))}
            </div>
          </Panel>

          {/* Alert categories */}
          <Panel title="Threat Categories">
            <div className="px-5 py-4 space-y-2.5">
              {[
                { label: 'Nation-State Operations', icon: AlertTriangle, color: 'text-red-400' },
                { label: 'Ransomware & Extortion', icon: Shield, color: 'text-orange-400' },
                { label: 'Critical Infrastructure', icon: Zap, color: 'text-amber-400' },
                { label: 'Espionage & Data Theft', icon: Radio, color: 'text-blue-400' },
                { label: 'Supply Chain Attacks', icon: Shield, color: 'text-purple-400' },
              ].map(({ label, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${color}`} strokeWidth={1.75} />
                  <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
