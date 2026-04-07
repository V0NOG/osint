'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Search, Clock, RefreshCw } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { useCommandPalette } from '@/contexts/command-palette'
import { useAlertDrawer } from '@/contexts/alert-drawer'
import { mockCountries } from '@/lib/mock-data/countries'
import { mockEvents } from '@/lib/mock-data/events'
import { mockForecasts } from '@/lib/mock-data/forecasts'

function resolvePageMeta(pathname: string): { title: string; breadcrumbs: string[] } {
  // Static routes
  const staticLabels: Record<string, { title: string; breadcrumbs: string[] }> = {
    '/world': { title: 'World Overview', breadcrumbs: ['World'] },
    '/countries': { title: 'Countries', breadcrumbs: ['Countries'] },
    '/regions': { title: 'Regions', breadcrumbs: ['Regions'] },
    '/events': { title: 'Events', breadcrumbs: ['Events'] },
    '/forecasts': { title: 'Forecasts', breadcrumbs: ['Forecasts'] },
    '/watchlist': { title: 'Watchlist', breadcrumbs: ['Watchlist'] },
    '/settings': { title: 'Settings', breadcrumbs: ['Settings'] },
  }

  if (staticLabels[pathname]) return staticLabels[pathname]

  // Country detail
  const countryMatch = pathname.match(/^\/countries\/([^/]+)$/)
  if (countryMatch) {
    const country = mockCountries.find((c) => c.slug === countryMatch[1])
    if (country) return { title: country.name, breadcrumbs: ['Countries', country.name] }
  }

  // Event detail
  const eventMatch = pathname.match(/^\/events\/([^/]+)$/)
  if (eventMatch) {
    const event = mockEvents.find((e) => e.id === eventMatch[1])
    if (event) return { title: event.title, breadcrumbs: ['Events', event.title] }
  }

  // Forecast detail
  const forecastMatch = pathname.match(/^\/forecasts\/([^/]+)$/)
  if (forecastMatch) {
    const forecast = mockForecasts.find((f) => f.id === forecastMatch[1])
    if (forecast) return { title: forecast.title, breadcrumbs: ['Forecasts', forecast.title] }
  }

  return { title: 'GeoPol', breadcrumbs: [] }
}

export function TopBar() {
  const pathname = usePathname()
  const meta = resolvePageMeta(pathname)
  const { openPalette } = useCommandPalette()
  const { openDrawer, unreadCount } = useAlertDrawer()

  const [timeStr, setTimeStr] = useState('')
  const [spinning, setSpinning] = useState(false)
  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const update = () => {
      setTimeStr(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'UTC',
        })
      )
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  const handleRefresh = () => {
    if (spinTimerRef.current) clearTimeout(spinTimerRef.current)
    setSpinning(true)
    spinTimerRef.current = setTimeout(() => setSpinning(false), 600)
  }

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current)
    }
  }, [])

  return (
    <header
      className="fixed right-0 top-0 z-30 flex items-center gap-4 px-5 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]/90 backdrop-blur-sm transition-[left] duration-200 ease-in-out"
      style={{
        left: 'var(--sidebar-width)',
        height: 'var(--topbar-height)',
      }}
    >
      {/* Page title + breadcrumbs */}
      <div className="flex-shrink-0 min-w-0">
        <h1 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
          {meta.title}
        </h1>
        {meta.breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1 mt-0.5 overflow-hidden">
            {meta.breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1 min-w-0">
                {i > 0 && (
                  <span className="text-[var(--color-text-tertiary)] text-[10px] flex-shrink-0">
                    /
                  </span>
                )}
                <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium truncate">
                  {crumb}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Search / command palette trigger */}
      <div className="flex-1 max-w-md mx-auto">
        <button
          onClick={openPalette}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-md text-left',
            'bg-[var(--color-bg-elevated)] border border-[var(--color-border)]',
            'text-[var(--color-text-tertiary)] cursor-pointer',
            'hover:border-[var(--color-border-strong)] transition-colors duration-150'
          )}
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
          <span className="text-xs flex-1">Search countries, events, forecasts...</span>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--color-border)] font-mono opacity-60">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Clock */}
        <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
          <Clock className="w-3 h-3" strokeWidth={1.5} />
          <span className="text-[10px] font-mono">{timeStr} UTC</span>
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className={cn(
            'p-1.5 rounded-md transition-colors duration-150',
            'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]',
            'hover:bg-[var(--color-bg-elevated)]'
          )}
          title="Refresh data"
        >
          <RefreshCw
            className={cn('w-3.5 h-3.5', spinning && 'animate-spin')}
            strokeWidth={1.75}
          />
        </button>

        {/* Alerts bell */}
        <button
          onClick={openDrawer}
          className={cn(
            'relative p-1.5 rounded-md transition-colors duration-150',
            'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            'hover:bg-[var(--color-bg-elevated)]'
          )}
          title="Alerts"
        >
          <Bell className="w-3.5 h-3.5" strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          )}
        </button>
      </div>
    </header>
  )
}
