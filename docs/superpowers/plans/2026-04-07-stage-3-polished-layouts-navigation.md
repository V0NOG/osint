# Stage 3: Polished Layouts and Navigation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up the four interactive systems that are currently placeholder — command palette, filter controls, alert drawer, and sidebar collapse — to make the app feel like a complete product.

**Architecture:** Three React contexts (`SidebarContext`, `CommandPaletteContext`, `AlertDrawerContext`) are mounted in `AppShell`. List pages split into thin server wrappers (keeping `metadata`) + client view components (holding filter state). The sidebar width CSS variable is set dynamically on the root shell div so all margins track correctly.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, lucide-react, React context API

---

## File Map

**New files:**
- `contexts/sidebar.tsx` — collapsed state + toggle + localStorage persistence
- `contexts/command-palette.tsx` — open/close state
- `contexts/alert-drawer.tsx` — open/close + unread count
- `components/layout/CommandPalette.tsx` — ⌘K modal
- `components/layout/AlertDrawer.tsx` — right slide-in panel
- `components/ui/FilterChipBar.tsx` — reusable chip toggle bar
- `components/country/CountriesView.tsx` — client component with country filter state
- `components/event/EventsView.tsx` — client component with event filter state
- `components/forecast/ForecastsView.tsx` — client component with forecast filter state

**Modified files:**
- `components/layout/AppShell.tsx` — add providers, render CommandPalette + AlertDrawer, set CSS var
- `components/layout/Sidebar.tsx` — collapse toggle, icons-only collapsed state
- `components/layout/TopBar.tsx` — wire bell + search, fix breadcrumbs, live clock, refresh spin
- `app/countries/page.tsx` — delegate to CountriesView
- `app/events/page.tsx` — delegate to EventsView
- `app/forecasts/page.tsx` — delegate to ForecastsView

---

## Task 1: Create the three contexts

**Files:**
- Create: `contexts/sidebar.tsx`
- Create: `contexts/command-palette.tsx`
- Create: `contexts/alert-drawer.tsx`

- [ ] **Step 1: Create `contexts/sidebar.tsx`**

```tsx
'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface SidebarContextValue {
  collapsed: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('geopol:sidebar-collapsed')
    if (stored === 'true') setCollapsed(true)
  }, [])

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('geopol:sidebar-collapsed', String(next))
      return next
    })
  }

  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}
```

- [ ] **Step 2: Create `contexts/command-palette.tsx`**

```tsx
'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface CommandPaletteContextValue {
  open: boolean
  openPalette: () => void
  closePalette: () => void
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null)

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <CommandPaletteContext.Provider
      value={{
        open,
        openPalette: () => setOpen(true),
        closePalette: () => setOpen(false),
      }}
    >
      {children}
    </CommandPaletteContext.Provider>
  )
}

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext)
  if (!ctx) throw new Error('useCommandPalette must be used within CommandPaletteProvider')
  return ctx
}
```

- [ ] **Step 3: Create `contexts/alert-drawer.tsx`**

```tsx
'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface AlertDrawerContextValue {
  open: boolean
  unreadCount: number
  openDrawer: () => void
  closeDrawer: () => void
  markAllRead: () => void
}

const AlertDrawerContext = createContext<AlertDrawerContextValue | null>(null)

export function AlertDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(4)

  return (
    <AlertDrawerContext.Provider
      value={{
        open,
        unreadCount,
        openDrawer: () => setOpen(true),
        closeDrawer: () => setOpen(false),
        markAllRead: () => setUnreadCount(0),
      }}
    >
      {children}
    </AlertDrawerContext.Provider>
  )
}

export function useAlertDrawer() {
  const ctx = useContext(AlertDrawerContext)
  if (!ctx) throw new Error('useAlertDrawer must be used within AlertDrawerProvider')
  return ctx
}
```

- [ ] **Step 4: Type-check**

```bash
npm run type-check
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add contexts/
git commit -m "feat: add sidebar, command palette, and alert drawer contexts"
```

---

## Task 2: Update AppShell to mount contexts and global UI

**Files:**
- Modify: `components/layout/AppShell.tsx`

- [ ] **Step 1: Replace `AppShell.tsx` with the new version**

```tsx
'use client'

import { SidebarProvider, useSidebar } from '@/contexts/sidebar'
import { CommandPaletteProvider } from '@/contexts/command-palette'
import { AlertDrawerProvider } from '@/contexts/alert-drawer'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { CommandPalette } from './CommandPalette'
import { AlertDrawer } from './AlertDrawer'

interface AppShellProps {
  children: React.ReactNode
}

function ShellLayout({ children }: AppShellProps) {
  const { collapsed } = useSidebar()
  const sidebarWidth = collapsed ? 'var(--sidebar-collapsed-width)' : '240px'

  return (
    <div
      className="min-h-screen bg-[var(--color-bg-base)]"
      style={{ '--sidebar-width': sidebarWidth } as React.CSSProperties}
    >
      <Sidebar />
      <TopBar />
      <main
        className="min-h-screen overflow-x-hidden transition-[margin-left] duration-200 ease-in-out"
        style={{
          marginLeft: 'var(--sidebar-width)',
          paddingTop: 'var(--topbar-height)',
        }}
      >
        <div className="animate-fade-in">{children}</div>
      </main>
      <CommandPalette />
      <AlertDrawer />
    </div>
  )
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <CommandPaletteProvider>
        <AlertDrawerProvider>
          <ShellLayout>{children}</ShellLayout>
        </AlertDrawerProvider>
      </CommandPaletteProvider>
    </SidebarProvider>
  )
}
```

Note: `CommandPalette` and `AlertDrawer` don't exist yet — create stub files so the import resolves.

- [ ] **Step 2: Create stub `components/layout/CommandPalette.tsx`**

```tsx
'use client'

export function CommandPalette() {
  return null
}
```

- [ ] **Step 3: Create stub `components/layout/AlertDrawer.tsx`**

```tsx
'use client'

export function AlertDrawer() {
  return null
}
```

- [ ] **Step 4: Type-check**

```bash
npm run type-check
```

Expected: no errors

- [ ] **Step 5: Verify app still loads**

```bash
npm run dev
```

Open http://localhost:3000 — app should look identical to before.

- [ ] **Step 6: Commit**

```bash
git add components/layout/AppShell.tsx components/layout/CommandPalette.tsx components/layout/AlertDrawer.tsx
git commit -m "feat: wire contexts into AppShell, add stub global UI components"
```

---

## Task 3: Sidebar collapse

**Files:**
- Modify: `components/layout/Sidebar.tsx`

- [ ] **Step 1: Replace `Sidebar.tsx` with collapse-aware version**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Globe,
  Flag,
  Map,
  Zap,
  Target,
  Star,
  Settings,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useSidebar } from '@/contexts/sidebar'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const primaryNav: NavItem[] = [
  { label: 'World', href: '/world', icon: Globe },
  { label: 'Countries', href: '/countries', icon: Flag },
  { label: 'Regions', href: '/regions', icon: Map },
  { label: 'Events', href: '/events', icon: Zap },
  { label: 'Forecasts', href: '/forecasts', icon: Target },
  { label: 'Watchlist', href: '/watchlist', icon: Star },
]

function NavLink({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem
  isActive: boolean
  collapsed: boolean
}) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center gap-3 rounded-r-md text-sm font-medium transition-all duration-150 group relative',
        collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5',
        isActive ? 'sidebar-item-active' : 'sidebar-item'
      )}
    >
      <Icon
        className={cn(
          'w-4 h-4 flex-shrink-0 transition-colors duration-150',
          isActive
            ? 'text-[var(--color-accent-blue)]'
            : 'text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]'
        )}
        strokeWidth={isActive ? 2 : 1.75}
      />
      {!collapsed && (
        <>
          <span className="flex-1 min-w-0 truncate">{item.label}</span>
          {isActive && (
            <ChevronRight className="w-3 h-3 text-[var(--color-accent-blue)] opacity-60 flex-shrink-0" />
          )}
        </>
      )}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebar()

  const isActive = (href: string) => {
    if (href === '/world') return pathname === '/world' || pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-[width] duration-200 ease-in-out"
      style={{ width: 'var(--sidebar-width)' }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[var(--color-bg-surface)] border-r border-[var(--color-border)]" />

      {/* Content */}
      <div className="relative flex flex-col h-full overflow-hidden">
        {/* Brand */}
        <div
          className={cn(
            'flex items-center gap-2.5 py-5 border-b border-[var(--color-border)] transition-all duration-200',
            collapsed ? 'px-0 justify-center' : 'px-4'
          )}
        >
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          {!collapsed && (
            <div>
              <span className="text-sm font-bold text-[var(--color-text-primary)] tracking-wider uppercase">
                GeoPol
              </span>
              <div className="text-[10px] text-[var(--color-text-tertiary)] font-medium uppercase tracking-widest -mt-0.5">
                OSINT Platform
              </div>
            </div>
          )}
        </div>

        {/* Status indicator */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-base)]">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow flex-shrink-0" />
            <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium uppercase tracking-wider">
              Live monitoring
            </span>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-base)]">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow" />
          </div>
        )}

        {/* Primary navigation */}
        <nav className={cn('flex-1 py-3 space-y-0.5 overflow-y-auto', collapsed ? 'px-1' : 'px-2')}>
          {!collapsed && (
            <div className="px-2 pb-2">
              <span className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-widest">
                Intelligence
              </span>
            </div>
          )}
          {primaryNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Settings */}
        <div className={cn('border-t border-[var(--color-border)] py-3', collapsed ? 'px-1' : 'px-2')}>
          <NavLink
            item={{ label: 'Settings', href: '/settings', icon: Settings }}
            isActive={isActive('/settings')}
            collapsed={collapsed}
          />
        </div>

        {/* Collapse toggle */}
        <div className={cn('border-t border-[var(--color-border)] py-3', collapsed ? 'flex justify-center' : 'px-4 flex items-center justify-between')}>
          {!collapsed && (
            <p className="text-[10px] text-[var(--color-text-tertiary)] font-mono">v0.1.0 — Phase 1</p>
          )}
          <button
            onClick={toggle}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] transition-all duration-150"
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: no errors

- [ ] **Step 3: Verify sidebar collapse in browser**

```bash
npm run dev
```

Click the chevron button at the bottom of the sidebar. It should:
- Animate to icon-only mode (64px wide)
- Main content margin should follow
- Reload the page — collapsed state should persist (localStorage)

- [ ] **Step 4: Commit**

```bash
git add components/layout/Sidebar.tsx
git commit -m "feat: add sidebar collapse with localStorage persistence"
```

---

## Task 4: TopBar improvements

**Files:**
- Modify: `components/layout/TopBar.tsx`

- [ ] **Step 1: Replace `TopBar.tsx`**

```tsx
'use client'

import { useState, useEffect } from 'react'
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
    setSpinning(true)
    setTimeout(() => setSpinning(false), 600)
  }

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
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: no errors

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Check:
- Clock shows current UTC time and updates every minute
- Clicking the search bar does nothing yet (CommandPalette is still a stub)
- Clicking bell does nothing yet (AlertDrawer is still a stub)
- Navigating to `/countries/russia` shows breadcrumb `Countries / Russia`
- Navigating to an event detail shows `Events / [event title]`
- Sidebar collapse causes TopBar `left` to animate correctly

- [ ] **Step 4: Commit**

```bash
git add components/layout/TopBar.tsx
git commit -m "feat: wire TopBar bell/search, fix detail breadcrumbs, add live clock"
```

---

## Task 5: CommandPalette component

**Files:**
- Modify: `components/layout/CommandPalette.tsx`

- [ ] **Step 1: Replace the stub with the full implementation**

```tsx
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
  const { open, closePalette } = useCommandPalette()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const results = useMemo(() => buildResults(query), [query])

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  // ⌘K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (open) closePalette()
        else {
          // openPalette is called via the TopBar button; this handles the global shortcut
          // We need to import openPalette here too — easiest: re-export from context
          // Actually the context provider manages this; we dispatch a custom event instead
          window.dispatchEvent(new CustomEvent('geopol:open-palette'))
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, closePalette])

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

  // Reset activeIndex when results change
  useEffect(() => {
    setActiveIndex(0)
  }, [query])

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
        onKeyDown={handleKeyDown}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border)]">
          <Search className="w-4 h-4 text-[var(--color-text-tertiary)] flex-shrink-0" strokeWidth={1.75} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
```

- [ ] **Step 2: Wire the global ⌘K shortcut in `contexts/command-palette.tsx`**

The `CommandPalette` component dispatches `geopol:open-palette` when ⌘K is pressed and the palette is closed. The `CommandPaletteProvider` needs to listen for this event. Replace `contexts/command-palette.tsx`:

```tsx
'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface CommandPaletteContextValue {
  open: boolean
  openPalette: () => void
  closePalette: () => void
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null)

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  const openPalette = () => setOpen(true)
  const closePalette = () => setOpen(false)

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('geopol:open-palette', handler)
    return () => window.removeEventListener('geopol:open-palette', handler)
  }, [])

  return (
    <CommandPaletteContext.Provider value={{ open, openPalette, closePalette }}>
      {children}
    </CommandPaletteContext.Provider>
  )
}

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext)
  if (!ctx) throw new Error('useCommandPalette must be used within CommandPaletteProvider')
  return ctx
}
```

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```

Expected: no errors

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Check:
- Press ⌘K anywhere — modal appears with centered overlay + backdrop blur
- Type "russia" — Countries group shows Russia result
- ↑↓ arrows navigate the list
- ↵ navigates to the country page and closes the modal
- ESC closes the modal
- Clicking outside the panel closes it
- Empty query shows Pages group as quick-nav

- [ ] **Step 5: Commit**

```bash
git add components/layout/CommandPalette.tsx contexts/command-palette.tsx
git commit -m "feat: implement command palette with keyboard navigation and grouped results"
```

---

## Task 6: AlertDrawer component

**Files:**
- Modify: `components/layout/AlertDrawer.tsx`

- [ ] **Step 1: Replace the stub with the full implementation**

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { X, Bell, CheckCheck } from 'lucide-react'
import { useAlertDrawer } from '@/contexts/alert-drawer'
import { mockEvents } from '@/lib/mock-data/events'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'
import { formatRelativeDate } from '@/lib/utils/format'
import type { EventSeverity } from '@/lib/types'

// Top 8 events sorted by severity as the alert feed
const SEVERITY_ORDER: Record<EventSeverity, number> = {
  critical: 0,
  high: 1,
  moderate: 2,
  low: 3,
}

const alertFeed = [...mockEvents]
  .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
  .slice(0, 8)

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
  const router = useRouter()

  const handleAlertClick = (eventId: string) => {
    router.push(`/events/${eventId}`)
    closeDrawer()
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer */}
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
                title="Mark all read"
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

        {/* Alert list */}
        <div className="flex-1 overflow-y-auto">
          {severityGroups.map(({ label, severity, labelClass }) => {
            const items = alertFeed.filter((e) => {
              if (severity === 'low') return e.severity === 'low'
              return e.severity === severity
            })
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
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span
                        className={cn(
                          'text-xs font-semibold leading-snug text-left',
                          i < unreadCount
                            ? 'text-[var(--color-text-primary)]'
                            : 'text-[var(--color-text-secondary)]'
                        )}
                      >
                        {event.title}
                      </span>
                    </div>
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
          })}
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
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: no errors

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Check:
- Click the bell icon — drawer slides in from the right
- Alerts are grouped by severity with colored left borders
- Click "Mark read" — red badge on bell disappears
- Click an alert — navigates to event page and closes drawer
- Click outside the drawer or the X button — drawer closes
- Sidebar collapse still works correctly alongside the drawer

- [ ] **Step 4: Commit**

```bash
git add components/layout/AlertDrawer.tsx
git commit -m "feat: implement alert drawer with severity grouping and read state"
```

---

## Task 7: FilterChipBar component

**Files:**
- Create: `components/ui/FilterChipBar.tsx`

- [ ] **Step 1: Create `components/ui/FilterChipBar.tsx`**

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface ChipDef {
  value: string
  label: string
  /** Tailwind classes applied to the chip when active */
  activeClass: string
}

export interface DropdownOption {
  value: string
  label: string
}

interface FilterDropdownProps {
  label: string
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
}

export function FilterDropdown({ label, options, value, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
          'bg-[var(--color-bg-elevated)] border border-[var(--color-border)]',
          'text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]',
          open && 'border-[var(--color-border-strong)] text-[var(--color-text-primary)]'
        )}
      >
        {label}: {selected?.label ?? label}
        <ChevronDown
          className={cn('w-3 h-3 transition-transform duration-150', open && 'rotate-180')}
          strokeWidth={1.75}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 w-44 bg-[var(--color-bg-surface)] border border-[var(--color-border-strong)] rounded-lg shadow-xl overflow-hidden animate-fade-in">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={cn(
                'w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-left transition-colors duration-75',
                'hover:bg-[var(--color-bg-elevated)]',
                value === opt.value
                  ? 'text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-secondary)]'
              )}
            >
              {opt.label}
              {value === opt.value && (
                <Check className="w-3 h-3 text-[var(--color-accent-blue)]" strokeWidth={2} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface FilterChipBarProps {
  chips: ChipDef[]
  activeValues: Set<string>
  onToggle: (value: string) => void
  resultCount: number
  totalCount: number
  /** Optional dropdowns (Sort, Region etc.) rendered to the right of chips */
  dropdowns?: React.ReactNode
}

export function FilterChipBar({
  chips,
  activeValues,
  onToggle,
  resultCount,
  totalCount,
  dropdowns,
}: FilterChipBarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap px-4 py-2.5 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg mb-4">
      <div className="flex items-center gap-1.5 flex-wrap flex-1">
        {chips.map((chip) => {
          const isActive = activeValues.has(chip.value)
          return (
            <button
              key={chip.value}
              onClick={() => onToggle(chip.value)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-150',
                isActive
                  ? chip.activeClass
                  : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-secondary)]'
              )}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {dropdowns}
        {activeValues.size > 0 && (
          <span className="text-[11px] text-[var(--color-text-tertiary)] font-mono">
            {resultCount} of {totalCount}
          </span>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/ui/FilterChipBar.tsx
git commit -m "feat: add FilterChipBar and FilterDropdown reusable components"
```

---

## Task 8: Countries page with filters

**Files:**
- Create: `components/country/CountriesView.tsx`
- Modify: `app/countries/page.tsx`

- [ ] **Step 1: Create `components/country/CountriesView.tsx`**

```tsx
'use client'

import { useState, useMemo } from 'react'
import { Flag } from 'lucide-react'
import { CountryCard } from './CountryCard'
import { FilterChipBar, FilterDropdown } from '@/components/ui/FilterChipBar'
import { mockCountries } from '@/lib/mock-data/countries'
import type { RiskLevel } from '@/lib/types'

const RISK_LEVELS: RiskLevel[] = ['critical', 'high', 'elevated', 'moderate', 'low', 'minimal']

const RISK_CHIPS = RISK_LEVELS.map((level) => ({
  value: level,
  label: level.charAt(0).toUpperCase() + level.slice(1),
  activeClass: {
    critical: 'bg-red-500/20 border-red-500/40 text-red-300',
    high: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
    elevated: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    moderate: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
    low: 'bg-green-500/20 border-green-500/40 text-green-300',
    minimal: 'bg-gray-500/20 border-gray-500/40 text-gray-300',
  }[level],
}))

const SORT_OPTIONS = [
  { value: 'risk-desc', label: 'Risk Score ↓' },
  { value: 'risk-asc', label: 'Risk Score ↑' },
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
]

const REGION_OPTIONS = [
  { value: 'all', label: 'All Regions' },
  { value: 'eastern-europe', label: 'Eastern Europe' },
  { value: 'east-asia', label: 'East Asia' },
  { value: 'middle-east', label: 'Middle East' },
  { value: 'sub-saharan-africa', label: 'Sub-Saharan Africa' },
  { value: 'latin-america', label: 'Latin America' },
  { value: 'southeast-asia', label: 'Southeast Asia' },
]

const riskColors: Record<RiskLevel, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  elevated: 'text-amber-400',
  moderate: 'text-yellow-400',
  low: 'text-green-400',
  minimal: 'text-gray-400',
}

export function CountriesView() {
  const [activeRisk, setActiveRisk] = useState<Set<string>>(new Set())
  const [region, setRegion] = useState('all')
  const [sort, setSort] = useState('risk-desc')

  const toggleRisk = (value: string) => {
    setActiveRisk((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const filtered = useMemo(() => {
    let result = [...mockCountries]

    if (activeRisk.size > 0) {
      result = result.filter((c) => activeRisk.has(c.riskLevel))
    }

    if (region !== 'all') {
      result = result.filter((c) => c.region === region)
    }

    result.sort((a, b) => {
      if (sort === 'risk-desc') return b.overallRiskScore - a.overallRiskScore
      if (sort === 'risk-asc') return a.overallRiskScore - b.overallRiskScore
      if (sort === 'name-asc') return a.name.localeCompare(b.name)
      if (sort === 'name-desc') return b.name.localeCompare(a.name)
      return 0
    })

    return result
  }, [activeRisk, region, sort])

  // When filters are active, show a flat sorted list instead of grouped sections
  const isFiltered = activeRisk.size > 0 || region !== 'all'

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Flag className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Countries</h1>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {mockCountries.length} countries tracked across{' '}
            {new Set(mockCountries.map((c) => c.region)).size} regions
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <FilterChipBar
        chips={RISK_CHIPS}
        activeValues={activeRisk}
        onToggle={toggleRisk}
        resultCount={filtered.length}
        totalCount={mockCountries.length}
        dropdowns={
          <>
            <FilterDropdown
              label="Region"
              options={REGION_OPTIONS}
              value={region}
              onChange={setRegion}
            />
            <FilterDropdown
              label="Sort"
              options={SORT_OPTIONS}
              value={sort}
              onChange={setSort}
            />
          </>
        }
      />

      {isFiltered ? (
        // Flat filtered list
        <div>
          {filtered.length === 0 ? (
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-10 text-center">
              <p className="text-sm text-[var(--color-text-tertiary)]">
                No countries match the selected filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((country) => (
                <CountryCard key={country.id} country={country} />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Grouped by risk level (default view)
        <div className="space-y-6">
          {RISK_LEVELS.map((level) => {
            const countries = filtered.filter((c) => c.riskLevel === level)
            if (countries.length === 0) return null
            return (
              <section key={level}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`text-xs font-semibold uppercase tracking-wider ${riskColors[level]}`}>
                    {level} Risk
                  </div>
                  <div className="flex-1 h-px bg-[var(--color-border)]" />
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">
                    {countries.length} {countries.length === 1 ? 'country' : 'countries'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {countries.map((country) => (
                    <CountryCard key={country.id} country={country} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Replace `app/countries/page.tsx`**

```tsx
import { CountriesView } from '@/components/country/CountriesView'

export const metadata = {
  title: 'Countries',
}

export default function CountriesPage() {
  return <CountriesView />
}
```

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```

Expected: no errors

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Navigate to `/countries`:
- Chip row appears between header and list
- Clicking "Critical" filters to only critical-risk countries; grouped sections collapse to a flat list
- Clicking "Critical" again deselects it; grouped view returns
- Region dropdown filters by region
- Sort dropdown reorders results
- "X of 18" counter appears when filters are active

- [ ] **Step 5: Commit**

```bash
git add components/country/CountriesView.tsx app/countries/page.tsx
git commit -m "feat: add working filter controls to Countries page"
```

---

## Task 9: Events page with filters

**Files:**
- Create: `components/event/EventsView.tsx`
- Modify: `app/events/page.tsx`

- [ ] **Step 1: Create `components/event/EventsView.tsx`**

```tsx
'use client'

import { useState, useMemo } from 'react'
import { Zap } from 'lucide-react'
import { EventCard } from './EventCard'
import { FilterChipBar, FilterDropdown } from '@/components/ui/FilterChipBar'
import { Badge } from '@/components/ui/Badge'
import { mockEvents } from '@/lib/mock-data/events'
import type { EventType, EventSeverity } from '@/lib/types'

const EVENT_TYPES: EventType[] = ['military', 'diplomatic', 'economic', 'political', 'humanitarian', 'cyber']
const SEVERITIES: EventSeverity[] = ['critical', 'high', 'moderate', 'low']

const TYPE_CHIPS = EVENT_TYPES.map((type) => ({
  value: `type:${type}`,
  label: type.charAt(0).toUpperCase() + type.slice(1),
  activeClass: {
    military: 'bg-red-500/20 border-red-500/40 text-red-300',
    diplomatic: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
    economic: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    political: 'bg-violet-500/20 border-violet-500/40 text-violet-300',
    humanitarian: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    cyber: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
  }[type],
}))

const SEVERITY_CHIPS = SEVERITIES.map((sev) => ({
  value: `sev:${sev}`,
  label: sev.charAt(0).toUpperCase() + sev.slice(1),
  activeClass: {
    critical: 'bg-red-500/20 border-red-500/40 text-red-300',
    high: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
    moderate: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    low: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
  }[sev],
}))

const ALL_CHIPS = [...TYPE_CHIPS, ...SEVERITY_CHIPS]

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Date (newest)' },
  { value: 'date-asc', label: 'Date (oldest)' },
  { value: 'severity', label: 'Severity' },
]

const SEVERITY_ORDER: Record<EventSeverity, number> = { critical: 0, high: 1, moderate: 2, low: 3 }
const severityColors: Record<EventSeverity, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  moderate: 'text-amber-400',
  low: 'text-blue-400',
}

export function EventsView() {
  const [activeChips, setActiveChips] = useState<Set<string>>(new Set())
  const [sort, setSort] = useState('date-desc')

  const toggleChip = (value: string) => {
    setActiveChips((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const activeTypes = useMemo(
    () => new Set([...activeChips].filter((v) => v.startsWith('type:')).map((v) => v.slice(5))),
    [activeChips]
  )
  const activeSeverities = useMemo(
    () => new Set([...activeChips].filter((v) => v.startsWith('sev:')).map((v) => v.slice(4))),
    [activeChips]
  )

  const filtered = useMemo(() => {
    let result = [...mockEvents]

    if (activeTypes.size > 0) {
      result = result.filter((e) => activeTypes.has(e.eventType))
    }
    if (activeSeverities.size > 0) {
      result = result.filter((e) => activeSeverities.has(e.severity))
    }

    result.sort((a, b) => {
      if (sort === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sort === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime()
      if (sort === 'severity') return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
      return 0
    })

    return result
  }, [activeTypes, activeSeverities, sort])

  const isFiltered = activeChips.size > 0

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Zap className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Events</h1>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {mockEvents.length} events tracked
          </p>
        </div>
      </div>

      {/* Type distribution summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
        {EVENT_TYPES.map((type) => (
          <div
            key={type}
            className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-3 text-center"
          >
            <div className="text-lg font-bold font-mono tabular-nums text-[var(--color-text-primary)]">
              {mockEvents.filter((e) => e.eventType === type).length}
            </div>
            <div className="mt-1">
              <Badge variant={`event-${type}`} size="sm">
                {type}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <FilterChipBar
        chips={ALL_CHIPS}
        activeValues={activeChips}
        onToggle={toggleChip}
        resultCount={filtered.length}
        totalCount={mockEvents.length}
        dropdowns={
          <FilterDropdown
            label="Sort"
            options={SORT_OPTIONS}
            value={sort}
            onChange={setSort}
          />
        }
      />

      {isFiltered ? (
        <div>
          {filtered.length === 0 ? (
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-10 text-center">
              <p className="text-sm text-[var(--color-text-tertiary)]">
                No events match the selected filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {SEVERITIES.map((severity) => {
            const events = filtered.filter((e) => e.severity === severity)
            if (events.length === 0) return null
            return (
              <section key={severity}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`text-xs font-semibold uppercase tracking-wider ${severityColors[severity]}`}>
                    {severity} Severity
                  </div>
                  <div className="flex-1 h-px bg-[var(--color-border)]" />
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">
                    {events.length} {events.length === 1 ? 'event' : 'events'}
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Replace `app/events/page.tsx`**

```tsx
import { EventsView } from '@/components/event/EventsView'

export const metadata = {
  title: 'Events',
}

export default function EventsPage() {
  return <EventsView />
}
```

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```

Expected: no errors

- [ ] **Step 4: Verify in browser**

Navigate to `/events`:
- Chip bar shows type chips (Military, Diplomatic…) and severity chips (Critical, High…)
- Selecting "Military" shows only military events in a flat grid
- Selecting "Military" + "Cyber" shows events of either type (OR logic)
- Deselecting all returns the severity-grouped view

- [ ] **Step 5: Commit**

```bash
git add components/event/EventsView.tsx app/events/page.tsx
git commit -m "feat: add working filter controls to Events page"
```

---

## Task 10: Forecasts page with filters

**Files:**
- Create: `components/forecast/ForecastsView.tsx`
- Modify: `app/forecasts/page.tsx`

- [ ] **Step 1: Create `components/forecast/ForecastsView.tsx`**

```tsx
'use client'

import { useState, useMemo } from 'react'
import { Target } from 'lucide-react'
import { ForecastCard } from './ForecastCard'
import { FilterChipBar, FilterDropdown } from '@/components/ui/FilterChipBar'
import { Badge } from '@/components/ui/Badge'
import { mockForecasts } from '@/lib/mock-data/forecasts'
import type { ForecastStatus, ConfidenceLevel } from '@/lib/types'

const STATUSES: ForecastStatus[] = ['active', 'resolved', 'expired', 'draft']
const CONFIDENCE_LEVELS: ConfidenceLevel[] = ['high', 'medium', 'low']

const STATUS_CHIPS = STATUSES.map((status) => ({
  value: `status:${status}`,
  label: status.charAt(0).toUpperCase() + status.slice(1),
  activeClass: {
    active: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
    resolved: 'bg-green-500/20 border-green-500/40 text-green-300',
    expired: 'bg-gray-500/20 border-gray-500/40 text-gray-300',
    draft: 'bg-violet-500/20 border-violet-500/40 text-violet-300',
  }[status],
}))

const CONFIDENCE_CHIPS = CONFIDENCE_LEVELS.map((level) => ({
  value: `conf:${level}`,
  label: `${level.charAt(0).toUpperCase() + level.slice(1)} conf.`,
  activeClass: {
    high: 'bg-green-500/20 border-green-500/40 text-green-300',
    medium: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    low: 'bg-red-500/20 border-red-500/40 text-red-300',
  }[level],
}))

const ALL_CHIPS = [...STATUS_CHIPS, ...CONFIDENCE_CHIPS]

const SORT_OPTIONS = [
  { value: 'prob-desc', label: 'Probability ↓' },
  { value: 'prob-asc', label: 'Probability ↑' },
  { value: 'target-asc', label: 'Target Date' },
  { value: 'updated-desc', label: 'Last Updated' },
]

export function ForecastsView() {
  const [activeChips, setActiveChips] = useState<Set<string>>(new Set(['status:active']))
  const [sort, setSort] = useState('prob-desc')

  const toggleChip = (value: string) => {
    setActiveChips((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const activeStatuses = useMemo(
    () => new Set([...activeChips].filter((v) => v.startsWith('status:')).map((v) => v.slice(7))),
    [activeChips]
  )
  const activeConfs = useMemo(
    () => new Set([...activeChips].filter((v) => v.startsWith('conf:')).map((v) => v.slice(5))),
    [activeChips]
  )

  const filtered = useMemo(() => {
    let result = [...mockForecasts]

    if (activeStatuses.size > 0) {
      result = result.filter((f) => activeStatuses.has(f.status))
    }
    if (activeConfs.size > 0) {
      result = result.filter((f) => activeConfs.has(f.confidenceLevel))
    }

    result.sort((a, b) => {
      if (sort === 'prob-desc') return b.probability - a.probability
      if (sort === 'prob-asc') return a.probability - b.probability
      if (sort === 'target-asc')
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
      if (sort === 'updated-desc')
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      return 0
    })

    return result
  }, [activeStatuses, activeConfs, sort])

  const activeCount = mockForecasts.filter((f) => f.status === 'active').length
  const avgProb = Math.round(
    mockForecasts.reduce((sum, f) => sum + f.probability, 0) / mockForecasts.length
  )
  const lowConfCount = mockForecasts.filter((f) => f.confidenceLevel === 'low').length

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Target className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Forecasts</h1>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {mockForecasts.length} structured forecasts — {activeCount} active
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-400 mb-0.5">{activeCount}</div>
          <div className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">Active</div>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="text-2xl font-bold font-mono tabular-nums text-[var(--color-text-primary)] mb-0.5">{avgProb}%</div>
          <div className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">Avg. Probability</div>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mb-0.5">{lowConfCount}</div>
          <div className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">Low Confidence</div>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="text-2xl font-bold font-mono tabular-nums text-[var(--color-text-primary)] mb-0.5">
            {mockForecasts.reduce((sum, f) => sum + f.versionNumber, 0)}
          </div>
          <div className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">Total Revisions</div>
        </div>
      </div>

      {/* Filter bar */}
      <FilterChipBar
        chips={ALL_CHIPS}
        activeValues={activeChips}
        onToggle={toggleChip}
        resultCount={filtered.length}
        totalCount={mockForecasts.length}
        dropdowns={
          <FilterDropdown
            label="Sort"
            options={SORT_OPTIONS}
            value={sort}
            onChange={setSort}
          />
        }
      />

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-10 text-center">
          <p className="text-sm text-[var(--color-text-tertiary)]">
            No forecasts match the selected filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((forecast) => (
            <ForecastCard key={forecast.id} forecast={forecast} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Replace `app/forecasts/page.tsx`**

```tsx
import { ForecastsView } from '@/components/forecast/ForecastsView'

export const metadata = {
  title: 'Forecasts',
}

export default function ForecastsPage() {
  return <ForecastsView />
}
```

- [ ] **Step 3: Type-check and lint**

```bash
npm run type-check && npm run lint
```

Expected: no errors

- [ ] **Step 4: Verify in browser**

Navigate to `/forecasts`:
- "Active" chip is pre-selected (default state)
- Only active forecasts shown in a flat grid
- Clicking "Active" deselects — all forecasts shown
- Confidence chips filter by confidence level
- Sort dropdown reorders the grid
- Empty state shows if no forecasts match filters

- [ ] **Step 5: Final commit**

```bash
git add components/forecast/ForecastsView.tsx app/forecasts/page.tsx
git commit -m "feat: add working filter controls to Forecasts page"
```

---

## Verification Checklist

After all tasks are complete, do a full pass:

- [ ] ⌘K opens palette anywhere in the app
- [ ] Palette keyboard nav (↑↓↵ESC) works correctly
- [ ] Searching "russia" shows Russia in Countries group
- [ ] Clicking a palette result navigates and closes palette
- [ ] Bell icon opens alert drawer
- [ ] Alert drawer slides in from right; clicking outside closes it
- [ ] "Mark all read" removes the red badge from the bell
- [ ] Clicking an alert navigates to the event page
- [ ] Sidebar collapse toggles smoothly; state persists on reload
- [ ] TopBar `left` follows sidebar width during collapse animation
- [ ] Country detail page shows `Countries / Russia` breadcrumb (not `...`)
- [ ] Event detail page shows `Events / [title]` breadcrumb
- [ ] Forecast detail page shows `Forecasts / [title]` breadcrumb
- [ ] Clock shows correct UTC time
- [ ] Refresh button spins briefly on click
- [ ] Countries filter chips work; grouped view collapses to flat when active
- [ ] Events type + severity chips work with OR logic within groups
- [ ] Forecasts defaults to "Active" chip preselected
- [ ] `npm run type-check` passes with no errors
- [ ] `npm run lint` passes with no errors
