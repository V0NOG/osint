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
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

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

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-r-md text-sm font-medium transition-all duration-150 group relative',
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
      <span className="flex-1 min-w-0 truncate">{item.label}</span>
      {isActive && (
        <ChevronRight className="w-3 h-3 text-[var(--color-accent-blue)] opacity-60 flex-shrink-0" />
      )}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/world') return pathname === '/world' || pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col"
      style={{ width: 'var(--sidebar-width)' }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[var(--color-bg-surface)] border-r border-[var(--color-border)]" />

      {/* Content */}
      <div className="relative flex flex-col h-full">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[var(--color-border)]">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <span className="text-sm font-bold text-[var(--color-text-primary)] tracking-wider uppercase">
              GeoPol
            </span>
            <div className="text-[10px] text-[var(--color-text-tertiary)] font-medium uppercase tracking-widest -mt-0.5">
              OSINT Platform
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-base)]">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow flex-shrink-0" />
          <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium uppercase tracking-wider">
            Live monitoring
          </span>
        </div>

        {/* Primary navigation */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          <div className="px-2 pb-2">
            <span className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-widest">
              Intelligence
            </span>
          </div>
          {primaryNav.map((item) => (
            <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
          ))}
        </nav>

        {/* Divider + Settings */}
        <div className="border-t border-[var(--color-border)] px-2 py-3">
          <NavLink
            item={{ label: 'Settings', href: '/settings', icon: Settings }}
            isActive={isActive('/settings')}
          />
        </div>

        {/* Version footer */}
        <div className="px-4 py-3 border-t border-[var(--color-border)]">
          <p className="text-[10px] text-[var(--color-text-tertiary)] font-mono">
            v0.1.0 — Phase 1
          </p>
        </div>
      </div>
    </aside>
  )
}
