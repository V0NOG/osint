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
        <div
          className={cn(
            'border-b border-[var(--color-border)] bg-[var(--color-bg-base)]',
            collapsed ? 'flex justify-center py-2.5' : 'flex items-center gap-2 px-4 py-2.5'
          )}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow flex-shrink-0" />
          {!collapsed && (
            <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium uppercase tracking-wider">
              Live monitoring
            </span>
          )}
        </div>

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
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
