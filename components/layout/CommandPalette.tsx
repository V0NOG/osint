'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Globe,
  Flag,
  Zap,
  Target,
  Settings,
  Map,
  Star,
  Database,
  Rss,
  Loader2,
  type LucideIcon,
} from 'lucide-react'
import { useCommandPalette } from '@/contexts/command-palette'
import { cn } from '@/lib/utils/cn'
import { getRiskTextClass } from '@/lib/utils/risk'

interface PaletteResult {
  id: string
  group: 'pages' | 'countries' | 'events' | 'forecasts' | 'regions'
  label: string
  sublabel?: string
  rightLabel?: string
  rightClass?: string
  href: string
  Icon: LucideIcon
}

const PAGE_RESULTS: PaletteResult[] = [
  { id: 'page-world', group: 'pages', label: 'World Overview', href: '/world', Icon: Globe },
  { id: 'page-countries', group: 'pages', label: 'Countries', href: '/countries', Icon: Flag },
  { id: 'page-regions', group: 'pages', label: 'Regions', href: '/regions', Icon: Map },
  { id: 'page-events', group: 'pages', label: 'Events', href: '/events', Icon: Zap },
  { id: 'page-forecasts', group: 'pages', label: 'Forecasts', href: '/forecasts', Icon: Target },
  { id: 'page-watchlist', group: 'pages', label: 'Watchlist', href: '/watchlist', Icon: Star },
  { id: 'page-sources', group: 'pages', label: 'Sources', href: '/sources', Icon: Rss },
  { id: 'page-admin', group: 'pages', label: 'Ingestion Control', href: '/admin', Icon: Database },
  { id: 'page-settings', group: 'pages', label: 'Settings', href: '/settings', Icon: Settings },
]

const GROUP_LABELS: Record<string, string> = {
  pages: 'Pages',
  countries: 'Countries',
  regions: 'Regions',
  events: 'Events',
  forecasts: 'Forecasts',
}

const GROUP_ORDER = ['pages', 'countries', 'regions', 'events', 'forecasts'] as const

const SEVERITY_CLASS: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  moderate: 'text-amber-400',
  low: 'text-blue-400',
}

export function CommandPalette() {
  const { open, openPalette, closePalette } = useCommandPalette()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PaletteResult[]>(PAGE_RESULTS)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  // Reset on open
  useEffect(() => {
    if (!open) return
    setQuery('')
    setResults(PAGE_RESULTS)
    setActiveIndex(0)
    const t = setTimeout(() => inputRef.current?.focus(), 10)
    return () => clearTimeout(t)
  }, [open])

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (open) closePalette()
        else openPalette()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, openPalette, closePalette])

  // Debounced search against real API
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    setActiveIndex(0)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim()) {
      setResults(PAGE_RESULTS)
      setLoading(false)
      return
    }

    // Filter pages immediately while API loads
    const matchedPages = PAGE_RESULTS.filter((p) =>
      p.label.toLowerCase().includes(value.toLowerCase())
    )
    setResults(matchedPages)
    setLoading(true)

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}&limit=5`)
        if (!res.ok) return
        const data = await res.json()

        const apiResults: PaletteResult[] = []

        for (const country of data.countries ?? []) {
          apiResults.push({
            id: `country-${country.id}`,
            group: 'countries',
            label: country.name,
            sublabel: country.capital ?? undefined,
            rightLabel: `${country.riskLevel} · ${country.overallRiskScore}`,
            rightClass: getRiskTextClass(country.riskLevel),
            href: `/countries/${country.slug}`,
            Icon: Flag,
          })
        }

        for (const region of data.regions ?? []) {
          apiResults.push({
            id: `region-${region.id}`,
            group: 'regions',
            label: region.name,
            sublabel: `${region.activeEventCount} events`,
            rightLabel: String(region.overallRiskScore),
            rightClass: getRiskTextClass(region.riskLevel),
            href: `/regions/${region.slug}`,
            Icon: Map,
          })
        }

        for (const event of data.events ?? []) {
          apiResults.push({
            id: `event-${event.id}`,
            group: 'events',
            label: event.title,
            sublabel: event.date,
            rightLabel: event.severity,
            rightClass: SEVERITY_CLASS[event.severity] ?? 'text-[var(--color-text-tertiary)]',
            href: `/events/${event.id}`,
            Icon: Zap,
          })
        }

        for (const forecast of data.forecasts ?? []) {
          apiResults.push({
            id: `forecast-${forecast.id}`,
            group: 'forecasts',
            label: forecast.title,
            sublabel: forecast.timeHorizon ?? undefined,
            rightLabel: `${forecast.probability}%`,
            rightClass:
              forecast.probability >= 70
                ? 'text-red-400'
                : forecast.probability >= 50
                ? 'text-orange-400'
                : forecast.probability >= 30
                ? 'text-amber-400'
                : 'text-green-400',
            href: `/forecasts/${forecast.id}`,
            Icon: Target,
          })
        }

        setResults([...matchedPages, ...apiResults])
      } catch {
        // On error keep the page results
      } finally {
        setLoading(false)
      }
    }, 220)
  }, [])

  const navigate = useCallback(
    (result: PaletteResult) => {
      router.push(result.href)
      closePalette()
    },
    [router, closePalette]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      const result = results[activeIndex]
      if (result) navigate(result)
    } else if (e.key === 'Escape') {
      closePalette()
    }
  }

  if (!open) return null

  const grouped = GROUP_ORDER
    .map((g) => ({ group: g, items: results.filter((r) => r.group === g) }))
    .filter((g) => g.items.length > 0)

  let resultIndex = 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={closePalette}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-[560px] mx-4 bg-[var(--color-bg-surface)] border border-[var(--color-border-strong)] rounded-xl shadow-2xl overflow-hidden animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border)]">
          {loading ? (
            <Loader2 className="w-4 h-4 text-[var(--color-text-tertiary)] flex-shrink-0 animate-spin" strokeWidth={1.75} />
          ) : (
            <Search className="w-4 h-4 text-[var(--color-text-tertiary)] flex-shrink-0" strokeWidth={1.75} />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search countries, events, forecasts..."
            className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--color-border)] font-mono text-[var(--color-text-tertiary)] flex-shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto py-1">
          {results.length === 0 && !loading ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-[var(--color-text-tertiary)]">
                No results for &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : (
            grouped.map(({ group, items }) => (
              <div key={group}>
                <div className="px-4 py-1.5">
                  <span className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-widest">
                    {GROUP_LABELS[group]}
                  </span>
                </div>
                {items.map((result) => {
                  const idx = resultIndex++
                  const isActive = idx === activeIndex
                  const { Icon } = result
                  return (
                    <button
                      key={result.id}
                      onClick={() => navigate(result)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75',
                        isActive
                          ? 'bg-[var(--color-bg-elevated)]'
                          : 'hover:bg-[var(--color-bg-elevated)]/50'
                      )}
                    >
                      <Icon
                        className="w-4 h-4 text-[var(--color-text-tertiary)] flex-shrink-0"
                        strokeWidth={1.5}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[var(--color-text-primary)] truncate">
                          {result.label}
                        </div>
                        {result.sublabel && (
                          <div className="text-[11px] text-[var(--color-text-tertiary)] truncate">
                            {result.sublabel}
                          </div>
                        )}
                      </div>
                      {result.rightLabel && (
                        <span className={cn('text-[11px] font-mono flex-shrink-0', result.rightClass ?? 'text-[var(--color-text-tertiary)]')}>
                          {result.rightLabel}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[var(--color-border)] flex items-center gap-4 text-[var(--color-text-tertiary)]">
          <span className="text-[10px]">↑↓ navigate</span>
          <span className="text-[10px]">↵ open</span>
          <span className="text-[10px]">ESC close</span>
          <span className="ml-auto text-[10px] font-mono opacity-50">⌘K</span>
        </div>
      </div>
    </div>
  )
}
