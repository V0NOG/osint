'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
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
  type LucideIcon,
} from 'lucide-react'
import { useCommandPalette } from '@/contexts/command-palette'
import { mockCountries } from '@/lib/mock-data/countries'
import { mockEvents } from '@/lib/mock-data/events'
import { mockForecasts } from '@/lib/mock-data/forecasts'
import { cn } from '@/lib/utils/cn'
import { getRiskTextClass } from '@/lib/utils/risk'

interface PaletteResult {
  id: string
  group: 'pages' | 'countries' | 'events' | 'forecasts'
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
  { id: 'page-settings', group: 'pages', label: 'Settings', href: '/settings', Icon: Settings },
]

const GROUP_LABELS: Record<string, string> = {
  pages: 'Pages',
  countries: 'Countries',
  events: 'Events',
  forecasts: 'Forecasts',
}

function buildResults(query: string): PaletteResult[] {
  const q = query.toLowerCase().trim()

  if (!q) return PAGE_RESULTS

  const results: PaletteResult[] = []

  // Pages
  const matchedPages = PAGE_RESULTS.filter((p) => p.label.toLowerCase().includes(q))
  results.push(...matchedPages)

  // Countries (cap at 5)
  const countryResults: PaletteResult[] = mockCountries
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso2.toLowerCase().includes(q) ||
        c.iso3.toLowerCase().includes(q)
    )
    .slice(0, 5)
    .map((c) => ({
      id: `country-${c.id}`,
      group: 'countries' as const,
      label: c.name,
      sublabel: c.capital,
      rightLabel: `${c.riskLevel} · ${c.overallRiskScore}`,
      rightClass: getRiskTextClass(c.riskLevel),
      href: `/countries/${c.slug}`,
      Icon: Flag,
    }))
  results.push(...countryResults)

  // Events (cap at 5)
  const eventResults: PaletteResult[] = mockEvents
    .filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    )
    .slice(0, 5)
    .map((e) => ({
      id: `event-${e.id}`,
      group: 'events' as const,
      label: e.title,
      sublabel: e.date,
      rightLabel: e.severity,
      rightClass:
        e.severity === 'critical'
          ? 'text-red-400'
          : e.severity === 'high'
          ? 'text-orange-400'
          : e.severity === 'moderate'
          ? 'text-amber-400'
          : 'text-blue-400',
      href: `/events/${e.id}`,
      Icon: Zap,
    }))
  results.push(...eventResults)

  // Forecasts (cap at 5)
  const forecastResults: PaletteResult[] = mockForecasts
    .filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.question.toLowerCase().includes(q) ||
        (f.tags ?? []).some((t) => t.toLowerCase().includes(q))
    )
    .slice(0, 5)
    .map((f) => ({
      id: `forecast-${f.id}`,
      group: 'forecasts' as const,
      label: f.title,
      sublabel: f.region,
      rightLabel: `${f.probability}%`,
      rightClass:
        f.probability >= 70
          ? 'text-red-400'
          : f.probability >= 50
          ? 'text-orange-400'
          : f.probability >= 30
          ? 'text-amber-400'
          : 'text-green-400',
      href: `/forecasts/${f.id}`,
      Icon: Target,
    }))
  results.push(...forecastResults)

  return results
}

export function CommandPalette() {
  const { open, openPalette, closePalette } = useCommandPalette()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const results = useMemo(() => buildResults(query), [query])

  // Reset on open
  useEffect(() => {
    if (!open) return
    setQuery('')
    setActiveIndex(0)
    const t = setTimeout(() => inputRef.current?.focus(), 10)
    return () => clearTimeout(t)
  }, [open])

  // ⌘K global shortcut
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

  // Group results for rendering
  const groups = ['pages', 'countries', 'events', 'forecasts'] as const
  const grouped = groups
    .map((g) => ({ group: g, items: results.filter((r) => r.group === g) }))
    .filter((g) => g.items.length > 0)

  // Flat counter for keyboard activeIndex tracking
  let resultIndex = 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={closePalette}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-[560px] mx-4 bg-[var(--color-bg-surface)] border border-[var(--color-border-strong)] rounded-xl shadow-2xl overflow-hidden animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border)]">
          <Search className="w-4 h-4 text-[var(--color-text-tertiary)] flex-shrink-0" strokeWidth={1.75} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
          {results.length === 0 ? (
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
                        <span
                          className={cn(
                            'text-[11px] font-mono flex-shrink-0',
                            result.rightClass ?? 'text-[var(--color-text-tertiary)]'
                          )}
                        >
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

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-[var(--color-border)] flex items-center gap-4 text-[var(--color-text-tertiary)]">
          <span className="text-[10px]">↑↓ navigate</span>
          <span className="text-[10px]">↵ open</span>
          <span className="text-[10px]">ESC close</span>
        </div>
      </div>
    </div>
  )
}
