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
  const sidebarWidth = collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'

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
