'use client'

import { useState, useTransition } from 'react'
import {
  Rss, Globe, Shield, TrendingUp, Users, Plus, Trash2,
  CheckCircle2, XCircle, Loader2, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Panel } from '@/components/ui/Panel'
import { cn } from '@/lib/utils/cn'

interface FeedRow {
  id: string
  key: string
  name: string
  url: string
  category: string
  domain: string
  reliability: string
  enabled: boolean
  custom: boolean
  tags: string[]
  bias: string | null
}

interface SourcesViewProps {
  initialFeeds: FeedRow[]
}

const DOMAIN_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  general:     { label: 'General / Geopolitical', icon: Globe,      color: 'text-blue-400' },
  cyber:       { label: 'Cyber Intelligence',     icon: Shield,     color: 'text-violet-400' },
  trade:       { label: 'Trade & Economics',       icon: TrendingUp, color: 'text-emerald-400' },
  humanitarian:{ label: 'Humanitarian',            icon: Users,      color: 'text-amber-400' },
  conflict:    { label: 'Conflict & Alerts',       icon: AlertCircle,color: 'text-red-400' },
}

const CATEGORY_LABEL: Record<string, string> = {
  rss:        'RSS',
  gdelt:      'GDELT',
  ucdp:       'UCDP API',
  reliefweb:  'ReliefWeb API',
  gdacs:      'GDACS',
}

const RELIABILITY_VARIANT: Record<string, string> = {
  high:   'risk-low',
  medium: 'risk-moderate',
  low:    'risk-high',
}

export function SourcesView({ initialFeeds }: SourcesViewProps) {
  const [feeds, setFeeds]     = useState<FeedRow[]>(initialFeeds)
  const [adding, setAdding]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [isPending, startTransition] = useTransition()

  // Group by domain
  const byDomain = feeds.reduce<Record<string, FeedRow[]>>((acc, f) => {
    acc[f.domain] = acc[f.domain] ?? []
    acc[f.domain].push(f)
    return acc
  }, {})

  const domainOrder = ['general', 'cyber', 'trade', 'humanitarian', 'conflict']
  const enabledCount = feeds.filter((f) => f.enabled).length

  async function handleToggle(key: string, enabled: boolean) {
    setError(null)
    setFeeds((prev) => prev.map((f) => f.key === key ? { ...f, enabled } : f))
    const res = await fetch('/api/sources', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, enabled }),
    })
    if (!res.ok) {
      setFeeds((prev) => prev.map((f) => f.key === key ? { ...f, enabled: !enabled } : f))
      setError('Failed to update feed')
    }
  }

  async function handleDelete(key: string) {
    setError(null)
    const prev = feeds.find((f) => f.key === key)
    setFeeds((f) => f.filter((x) => x.key !== key))
    const res = await fetch(`/api/sources?key=${encodeURIComponent(key)}`, { method: 'DELETE' })
    if (!res.ok) {
      if (prev) setFeeds((f) => [...f, prev])
      setError('Failed to delete feed')
    }
  }

  function toggleSection(domain: string) {
    setCollapsed((c) => ({ ...c, [domain]: !c[domain] }))
  }

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Rss className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Ingestion Sources</h1>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {enabledCount} of {feeds.length} sources enabled — toggle per-feed or add custom RSS
          </p>
        </div>
        <button
          onClick={() => setAdding((a) => !a)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] transition-all duration-150"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          Add Feed
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20 mb-4 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Add custom feed form */}
      {adding && <AddFeedForm onAdd={(feed) => { setFeeds((f) => [...f, feed]); setAdding(false) }} onClose={() => setAdding(false)} />}

      {/* Domain sections */}
      <div className="space-y-4">
        {domainOrder.map((domain) => {
          const domainFeeds = byDomain[domain] ?? []
          if (domainFeeds.length === 0) return null
          const meta = DOMAIN_META[domain]
          const Icon = meta.icon
          const isCollapsed = collapsed[domain]
          const enabledInDomain = domainFeeds.filter((f) => f.enabled).length

          return (
            <div key={domain} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
              {/* Section header */}
              <button
                onClick={() => toggleSection(domain)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-[var(--color-bg-elevated)]/40 transition-colors duration-150"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn('w-4 h-4', meta.color)} strokeWidth={1.75} />
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">{meta.label}</span>
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">{enabledInDomain}/{domainFeeds.length}</span>
                </div>
                {isCollapsed ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
                )}
              </button>

              {!isCollapsed && (
                <div className="divide-y divide-[var(--color-border)]">
                  {domainFeeds.map((feed) => (
                    <FeedRow
                      key={feed.key}
                      feed={feed}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FeedRow({
  feed,
  onToggle,
  onDelete,
}: {
  feed: FeedRow
  onToggle: (key: string, enabled: boolean) => void
  onDelete: (key: string) => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-elevated)]/30 transition-colors duration-150">
      {/* Toggle */}
      <button
        onClick={() => onToggle(feed.key, !feed.enabled)}
        className={cn(
          'flex-shrink-0 w-8 h-4 rounded-full transition-colors duration-200 relative',
          feed.enabled ? 'bg-blue-500' : 'bg-white/10'
        )}
        aria-label={feed.enabled ? 'Disable feed' : 'Enable feed'}
      >
        <span className={cn(
          'absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all duration-200',
          feed.enabled ? 'left-[calc(100%-0.875rem)]' : 'left-0.5'
        )} />
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            'text-xs font-medium truncate',
            feed.enabled ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'
          )}>
            {feed.name}
          </span>
          <Badge variant={RELIABILITY_VARIANT[feed.reliability] as Parameters<typeof Badge>[0]['variant']} size="sm">
            {feed.reliability}
          </Badge>
          <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] bg-white/5 px-1.5 py-0.5 rounded">
            {CATEGORY_LABEL[feed.category] ?? feed.category}
          </span>
          {feed.custom && (
            <Badge variant="status-draft" size="sm">custom</Badge>
          )}
        </div>
        <p className="text-[10px] text-[var(--color-text-tertiary)] truncate mt-0.5 font-mono">
          {feed.url}
        </p>
      </div>

      {/* Tags */}
      <div className="hidden md:flex items-center gap-1 flex-shrink-0">
        {feed.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-[9px] font-mono text-[var(--color-text-tertiary)] bg-white/5 px-1 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>

      {/* Delete (custom only) */}
      {feed.custom && (
        <button
          onClick={() => onDelete(feed.key)}
          className="flex-shrink-0 p-1 rounded hover:bg-red-500/10 text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors duration-150"
          aria-label="Delete feed"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
        </button>
      )}
    </div>
  )
}

function AddFeedForm({
  onAdd,
  onClose,
}: {
  onAdd: (feed: FeedRow) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: '',
    url: '',
    domain: 'general' as FeedRow['domain'],
    reliability: 'medium',
    tags: '',
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErr(null)
    const res = await fetch('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      }),
    })
    if (!res.ok) {
      const data = await res.json()
      setErr(data.error ?? 'Failed to add feed')
    } else {
      const feed = await res.json()
      onAdd(feed)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl">
      <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-3">Add Custom RSS Feed</p>
      {err && <p className="text-[11px] text-red-400 mb-2">{err}</p>}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[10px] text-[var(--color-text-tertiary)] mb-1">Feed name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="My Custom Feed"
            className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div>
          <label className="block text-[10px] text-[var(--color-text-tertiary)] mb-1">RSS URL *</label>
          <input
            required
            type="url"
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="https://example.com/feed.xml"
            className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div>
          <label className="block text-[10px] text-[var(--color-text-tertiary)] mb-1">Domain</label>
          <select
            value={form.domain}
            onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
            className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-blue-500/50"
          >
            <option value="general">General / Geopolitical</option>
            <option value="cyber">Cyber Intelligence</option>
            <option value="trade">Trade & Economics</option>
            <option value="humanitarian">Humanitarian</option>
            <option value="conflict">Conflict & Alerts</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-[var(--color-text-tertiary)] mb-1">Tags (comma-separated)</label>
          <input
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="security, analysis"
            className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-xs font-medium text-blue-400 hover:bg-blue-500/25 transition-all duration-150 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" strokeWidth={2} />}
          Add Feed
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
