'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Globe,
  Flag,
  Map,
  Zap,
  Target,
  Star,
  Settings,
  ShieldAlert,
  Database,
  Users,
  ChevronRight,
  ChevronLeft,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useSidebar } from '@/contexts/sidebar'
import { useWatchlist } from '@/contexts/watchlist'

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
  { label: 'Actors', href: '/actors', icon: Users },
  { label: 'Forecasts', href: '/forecasts', icon: Target },
  { label: 'Watchlist', href: '/watchlist', icon: Star },
]

const adminNav: NavItem[] = [
  { label: 'Ingestion', href: '/admin', icon: Database },
  { label: 'Settings', href: '/settings', icon: Settings },
]

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  admin: { label: 'Admin', className: 'bg-red-500/15 text-red-400 border-red-500/25' },
  analyst: { label: 'Analyst', className: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  viewer: { label: 'Viewer', className: 'bg-gray-500/15 text-gray-400 border-gray-500/25' },
}

function NavLink({
  item,
  isActive,
  collapsed,
  badge,
}: {
  item: NavItem
  isActive: boolean
  collapsed: boolean
  badge?: number
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
      <div className="relative flex-shrink-0">
        <Icon
          className={cn(
            'w-4 h-4 transition-colors duration-150',
            isActive
              ? 'text-[var(--color-accent-blue)]'
              : 'text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]'
          )}
          strokeWidth={isActive ? 2 : 1.75}
        />
        {badge != null && badge > 0 && collapsed && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-[8px] font-bold text-white flex items-center justify-center leading-none">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      {!collapsed && (
        <>
          <span className="flex-1 min-w-0 truncate">{item.label}</span>
          {badge != null && badge > 0 && (
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-1.5 py-0.5 leading-none">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
          {isActive && !badge && (
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
  const { totalCount: watchlistCount } = useWatchlist()
  const { data: session } = useSession()
  const role = (session?.user as { role?: string } | undefined)?.role ?? null

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
              badge={item.href === '/watchlist' && watchlistCount > 0 ? watchlistCount : undefined}
            />
          ))}
        </nav>

        {/* Admin nav — shown only to admin role */}
        {role === 'admin' && (
          <div className={cn('border-t border-[var(--color-border)] py-3 space-y-0.5', collapsed ? 'px-1' : 'px-2')}>
            {!collapsed && (
              <div className="px-2 pb-2">
                <span className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-widest">
                  System
                </span>
              </div>
            )}
            {adminNav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={isActive(item.href)}
                collapsed={collapsed}
              />
            ))}
          </div>
        )}

        {/* Collapse toggle + role badge */}
        <div className={cn('border-t border-[var(--color-border)] py-3', collapsed ? 'flex justify-center' : 'px-4 flex items-center justify-between')}>
          {!collapsed && (
            <div className="space-y-0.5">
              <p className="text-[10px] text-[var(--color-text-tertiary)] font-mono">v0.7.0 — Phase 7</p>
              {role && ROLE_BADGE[role] && (
                <span
                  className={cn(
                    'inline-flex text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border',
                    ROLE_BADGE[role].className
                  )}
                >
                  {ROLE_BADGE[role].label}
                </span>
              )}
            </div>
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
