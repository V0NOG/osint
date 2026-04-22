'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Search, Clock, RefreshCw, Sun, Moon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { useCommandPalette } from '@/contexts/command-palette'
import { useAlertDrawer } from '@/contexts/alert-drawer'
import { useTheme } from '@/contexts/theme'

// Static section labels
const SECTION_LABELS: Record<string, string> = {
  world: 'World Overview',
  countries: 'Countries',
  regions: 'Regions',
  events: 'Events',
  forecasts: 'Forecasts',
  actors: 'Actors',
  watchlist: 'Watchlist',
  settings: 'Settings',
  admin: 'Admin',
  auth: 'Sign In',
}

// What to call a single entity from each section
const DETAIL_LABELS: Record<string, string> = {
  countries: 'Country Profile',
  regions: 'Region',
  events: 'Event',
  forecasts: 'Forecast',
  actors: 'Actor',
}

function resolvePageMeta(pathname: string): { title: string; breadcrumbs: string[] } {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return { title: 'World Overview', breadcrumbs: ['World'] }
  }

  const section = segments[0]
  const sectionLabel = SECTION_LABELS[section] ?? section.charAt(0).toUpperCase() + section.slice(1)

  // Top-level section page (e.g. /events, /countries)
  if (segments.length === 1) {
    return { title: sectionLabel, breadcrumbs: [sectionLabel] }
  }

  // Detail page (e.g. /events/[id], /countries/[slug])
  const detailLabel = DETAIL_LABELS[section] ?? 'Detail'
  return { title: sectionLabel, breadcrumbs: [sectionLabel, detailLabel] }
}

export function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const meta = resolvePageMeta(pathname)
  const { openPalette } = useCommandPalette()
  const { openDrawer, unreadCount } = useAlertDrawer()
  const { theme, toggle: toggleTheme } = useTheme()

  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const tzAbbr = new Date()
    .toLocaleTimeString('en-US', { timeZoneName: 'short', timeZone: localTz })
    .split(' ')
    .pop() ?? localTz

  const [timeStr, setTimeStr] = useState('')
  const [spinning, setSpinning] = useState(false)
  const [refreshed, setRefreshed] = useState(false)
  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const update = () => {
      setTimeStr(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: localTz,
        })
      )
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [localTz])

  const handleRefresh = () => {
    if (spinTimerRef.current) clearTimeout(spinTimerRef.current)
    setSpinning(true)
    router.refresh()
    spinTimerRef.current = setTimeout(() => {
      setSpinning(false)
      setRefreshed(true)
      setTimeout(() => setRefreshed(false), 2000)
    }, 800)
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
        {meta.breadcrumbs.length > 1 && (
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
          <span className="text-[10px] font-mono">{timeStr} {tzAbbr}</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'p-1.5 rounded-md transition-colors duration-150',
            'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]',
            'hover:bg-[var(--color-bg-elevated)]'
          )}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark'
            ? <Sun className="w-3.5 h-3.5" strokeWidth={1.75} />
            : <Moon className="w-3.5 h-3.5" strokeWidth={1.75} />
          }
        </button>

        {/* Refresh */}
        <div className="flex items-center gap-1.5">
          {refreshed && (
            <span className="text-[10px] text-green-400 animate-fade-in font-medium">
              Updated
            </span>
          )}
          <button
            onClick={handleRefresh}
            className={cn(
              'p-1.5 rounded-md transition-colors duration-150',
              'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]',
              'hover:bg-[var(--color-bg-elevated)]',
              refreshed && 'text-green-400'
            )}
            title="Refresh data"
            disabled={spinning}
          >
            <RefreshCw
              className={cn('w-3.5 h-3.5', spinning && 'animate-spin')}
              strokeWidth={1.75}
            />
          </button>
        </div>

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
