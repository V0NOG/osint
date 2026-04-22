'use client'

import { usePathname } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import { SidebarProvider, useSidebar } from '@/contexts/sidebar'
import { ThemeProvider } from '@/contexts/theme'
import { CommandPaletteProvider } from '@/contexts/command-palette'
import { AlertDrawerProvider } from '@/contexts/alert-drawer'
import { WatchlistProvider } from '@/contexts/watchlist'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { CommandPalette } from './CommandPalette'
import { AlertDrawer } from './AlertDrawer'

interface AppShellProps {
  children: React.ReactNode
}

function ShellLayout({ children }: AppShellProps) {
  const { collapsed } = useSidebar()
  const sidebarWidth = collapsed ? '64px' : '240px'

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
  const pathname = usePathname()
  const isAuthRoute = pathname.startsWith('/auth/')

  if (isAuthRoute) {
    return <SessionProvider>{children}</SessionProvider>
  }

  return (
    <SessionProvider>
      <ThemeProvider>
        <SidebarProvider>
          <CommandPaletteProvider>
            <AlertDrawerProvider>
              <WatchlistProvider>
                <ShellLayout>{children}</ShellLayout>
              </WatchlistProvider>
            </AlertDrawerProvider>
          </CommandPaletteProvider>
        </SidebarProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
