'use client'

import { Bell, Search, Clock, RefreshCw } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

const pathLabels: Record<string, { title: string; breadcrumbs: string[] }> = {
  '/world': { title: 'World Overview', breadcrumbs: ['World'] },
  '/countries': { title: 'Countries', breadcrumbs: ['Countries'] },
  '/regions': { title: 'Regions', breadcrumbs: ['Regions'] },
  '/events': { title: 'Events', breadcrumbs: ['Events'] },
  '/forecasts': { title: 'Forecasts', breadcrumbs: ['Forecasts'] },
  '/watchlist': { title: 'Watchlist', breadcrumbs: ['Watchlist'] },
  '/settings': { title: 'Settings', breadcrumbs: ['Settings'] },
}

function getPageMeta(pathname: string) {
  // Exact match first
  if (pathLabels[pathname]) return pathLabels[pathname]

  // Prefix match for nested routes
  const prefix = Object.keys(pathLabels)
    .filter((key) => pathname.startsWith(key) && key !== '/')
    .sort((a, b) => b.length - a.length)[0]

  if (prefix) {
    const base = pathLabels[prefix]
    return {
      title: base.title,
      breadcrumbs: [...base.breadcrumbs, '...'],
    }
  }

  return { title: 'GeoPol', breadcrumbs: [] }
}

export function TopBar() {
  const pathname = usePathname()
  const meta = getPageMeta(pathname)
  const now = new Date('2026-04-01T09:42:00')
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  })

  return (
    <header
      className="fixed right-0 top-0 z-30 flex items-center gap-4 px-5 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]/90 backdrop-blur-sm"
      style={{
        left: 'var(--sidebar-width)',
        height: 'var(--topbar-height)',
      }}
    >
      {/* Page title */}
      <div className="flex-shrink-0">
        <h1 className="text-sm font-semibold text-[var(--color-text-primary)]">{meta.title}</h1>
        {meta.breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            {meta.breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-[var(--color-text-tertiary)] text-[10px]">/</span>}
                <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium">{crumb}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto">
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md',
            'bg-[var(--color-bg-elevated)] border border-[var(--color-border)]',
            'text-[var(--color-text-tertiary)] cursor-text',
            'hover:border-[var(--color-border-strong)] transition-colors duration-150'
          )}
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
          <span className="text-xs">
            Search countries, events, forecasts...
          </span>
          <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded border border-[var(--color-border)] font-mono opacity-60">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Last updated */}
        <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
          <Clock className="w-3 h-3" strokeWidth={1.5} />
          <span className="text-[10px] font-mono">{timeStr} UTC</span>
        </div>

        {/* Refresh */}
        <button
          className={cn(
            'p-1.5 rounded-md transition-colors duration-150',
            'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]',
            'hover:bg-[var(--color-bg-elevated)]'
          )}
          title="Refresh data"
        >
          <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
        </button>

        {/* Alerts bell */}
        <button
          className={cn(
            'relative p-1.5 rounded-md transition-colors duration-150',
            'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            'hover:bg-[var(--color-bg-elevated)]'
          )}
          title="Alerts"
        >
          <Bell className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  )
}
