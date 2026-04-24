import Link from 'next/link'
import { TrendingDown, ExternalLink, Zap, Globe, BarChart3, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Panel } from '@/components/ui/Panel'
import { getEvents } from '@/lib/db/events'
import { TRADE_FEEDS } from '@/lib/ingestion/adapters/sources'
import { formatRelativeDate } from '@/lib/utils/format'

export const metadata = {
  title: 'Trade Wars',
}

const SEVERITY_CLASS: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  moderate: 'text-amber-400',
  low: 'text-blue-400',
}

const TRADE_STATS = [
  { label: 'Active Sanctions Regimes', value: '34', delta: 'As of Q1 2026' },
  { label: 'Tariff Disputes at WTO', value: '61', delta: '+8 since Jan 2026' },
  { label: 'Bilateral FTAs in Force', value: '367', delta: 'Global total' },
  { label: 'Critical Supply Chains at Risk', value: '12', delta: 'High/Critical tier' },
]

const ACTIVE_FAULT_LINES = [
  { label: 'US–China Tech & Semiconductor Decoupling', severity: 'critical' },
  { label: 'EU Carbon Border Adjustment Mechanism', severity: 'high' },
  { label: 'Russia Energy Export Sanctions', severity: 'high' },
  { label: 'OPEC+ Production Coordination', severity: 'moderate' },
  { label: 'Dollar Weaponisation & De-dollarisation', severity: 'moderate' },
  { label: 'BRICS Expanded Trade Framework', severity: 'moderate' },
]

const SEVERITY_BADGE_MAP: Record<string, 'risk-critical' | 'risk-high' | 'risk-moderate' | 'risk-low'> = {
  critical: 'risk-critical',
  high: 'risk-high',
  moderate: 'risk-moderate',
  low: 'risk-low',
}

export default async function TradePage() {
  const allEvents = await getEvents({ eventType: 'economic', limit: 40 })
  const tradeEvents = allEvents.filter(
    (e) =>
      e.tags.some((t) =>
        ['trade', 'tariff', 'sanctions', 'wto', 'export-controls', 'supply-chain', 'economic-war'].includes(t)
      ) || e.title.toLowerCase().match(/trade|tariff|sanction|wto|export|import/)
  )
  const displayEvents = tradeEvents.length > 0 ? tradeEvents : allEvents

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <TrendingDown className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Trade Wars</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 uppercase tracking-wider">
            Domain
          </span>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Tariff conflicts, economic sanctions, supply chain disruptions, and geoeconomic power competition.
        </p>
      </div>

      {/* Trade stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {TRADE_STATS.map((stat) => (
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
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Trade & Economic Events</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-[11px] text-[var(--color-text-tertiary)]">{displayEvents.length} events</span>
          </div>

          {displayEvents.length === 0 ? (
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-10 text-center">
              <TrendingDown className="w-8 h-8 text-[var(--color-text-tertiary)] mx-auto mb-3" strokeWidth={1.25} />
              <p className="text-sm text-[var(--color-text-secondary)]">No trade events ingested yet.</p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                Enable trade feeds in{' '}
                <Link href="/admin" className="text-[var(--color-accent-blue)] hover:underline">
                  Ingestion
                </Link>{' '}
                to populate this feed.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group block bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-4 hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-strong)] transition-all duration-150"
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="event-economic" size="sm">Economic</Badge>
                      <span className={`text-[11px] font-medium ${SEVERITY_CLASS[event.severity]}`}>
                        {event.severity}
                      </span>
                      {event.tags.some((t) => ['trade', 'tariff', 'sanctions'].includes(t)) && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25 uppercase tracking-wider">
                          Trade
                        </span>
                      )}
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
          {/* Active fault lines */}
          <Panel title="Active Fault Lines">
            <div className="divide-y divide-[var(--color-border)]">
              {ACTIVE_FAULT_LINES.map(({ label, severity }) => (
                <div key={label} className="px-5 py-3 flex items-start justify-between gap-2">
                  <p className="text-xs text-[var(--color-text-secondary)] leading-snug flex-1">{label}</p>
                  <Badge variant={SEVERITY_BADGE_MAP[severity]} size="sm">
                    {severity}
                  </Badge>
                </div>
              ))}
            </div>
          </Panel>

          {/* Trade feed sources */}
          <Panel title="Trade Feeds" subtitle={`${TRADE_FEEDS.length} sources`}>
            <div className="divide-y divide-[var(--color-border)]">
              {TRADE_FEEDS.map((feed) => (
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

          {/* Key indicators */}
          <Panel title="Key Indicators">
            <div className="px-5 py-4 space-y-2.5">
              {[
                { label: 'Global Trade Volume Growth', icon: Globe, color: 'text-green-400', value: '+1.8% YoY' },
                { label: 'Tariff Escalation Risk', icon: AlertTriangle, color: 'text-red-400', value: 'Elevated' },
                { label: 'USD Reserve Share', icon: BarChart3, color: 'text-blue-400', value: '58.4%' },
                { label: 'Sanctions Coverage', icon: TrendingDown, color: 'text-orange-400', value: '15 major economies' },
              ].map(({ label, icon: Icon, color, value }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${color}`} strokeWidth={1.75} />
                    <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">{value}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
