import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-base)]">
      <Sidebar />
      <TopBar />
      <main
        className="min-h-screen overflow-x-hidden"
        style={{
          marginLeft: 'var(--sidebar-width)',
          paddingTop: 'var(--topbar-height)',
        }}
      >
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  )
}
