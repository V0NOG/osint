'use client'

import { useState, useEffect } from 'react'
import { Settings, Monitor, Bell, User, Shield, Database, RefreshCw, Check } from 'lucide-react'
import { Panel } from '@/components/ui/Panel'
import { Badge } from '@/components/ui/Badge'
import { useTheme } from '@/contexts/theme'
import { useSidebar } from '@/contexts/sidebar'
import { cn } from '@/lib/utils/cn'

const NOTIF_KEY = 'geopol:notifications'

interface NotifPrefs {
  criticalAlerts: boolean
  forecastChanges: boolean
  newHighSeverity: boolean
  watchlistUpdates: boolean
}

const DEFAULT_NOTIF: NotifPrefs = {
  criticalAlerts: true,
  forecastChanges: true,
  newHighSeverity: false,
  watchlistUpdates: true,
}

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative w-8 h-4 rounded-full transition-colors duration-200 flex-shrink-0',
        enabled ? 'bg-blue-600' : 'bg-[var(--color-bg-overlay)]',
        'border border-[var(--color-border-strong)]'
      )}
      aria-checked={enabled}
      role="switch"
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200',
          enabled ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  )
}

function SettingRow({
  label,
  description,
  action,
  badge,
}: {
  label: string
  description?: string
  action?: React.ReactNode
  badge?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-[var(--color-bg-elevated)]/50 transition-colors duration-150">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-xs font-medium text-[var(--color-text-primary)]">{label}</p>
          {badge}
        </div>
        {description && (
          <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">{action}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { theme, toggle: toggleTheme } = useTheme()
  const { collapsed, toggle: toggleSidebar } = useSidebar()
  const [notif, setNotif] = useState<NotifPrefs>(DEFAULT_NOTIF)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIF_KEY)
      if (stored) setNotif(JSON.parse(stored))
    } catch {}
  }, [])

  const setNotifKey = (key: keyof NotifPrefs) => (v: boolean) => {
    const next = { ...notif, [key]: v }
    setNotif(next)
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next))
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="p-6 max-w-[800px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Settings</h1>
        </div>
        {saved && (
          <div className="flex items-center gap-1.5 text-green-400 text-xs animate-fade-in">
            <Check className="w-3.5 h-3.5" strokeWidth={2} />
            Saved
          </div>
        )}
      </div>

      {/* Platform banner */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-4 mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4.5 h-4.5 text-blue-400" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">GeoPol OSINT Platform</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">Next.js · Prisma · PostgreSQL · Live ingestion</p>
          </div>
        </div>
        <Badge variant="status-draft">Beta</Badge>
      </div>

      <div className="space-y-4">
        {/* Display */}
        <Panel title="Display" subtitle="Appearance and layout preferences" >
          <div className="divide-y divide-[var(--color-border)]">
            <SettingRow
              label="Theme"
              description="Toggle between dark and light mode"
              action={
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-text-tertiary)]">
                    {theme === 'dark' ? 'Dark' : 'Light'}
                  </span>
                  <Toggle enabled={theme === 'light'} onChange={() => toggleTheme()} />
                </div>
              }
            />
            <SettingRow
              label="Sidebar"
              description="Collapse the navigation sidebar to icon-only mode"
              action={
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-text-tertiary)]">
                    {collapsed ? 'Collapsed' : 'Expanded'}
                  </span>
                  <Toggle enabled={collapsed} onChange={() => toggleSidebar()} />
                </div>
              }
            />
          </div>
        </Panel>

        {/* Data sources */}
        <Panel title="Data Sources" subtitle="Live ingestion from open-source intelligence feeds">
          <div className="divide-y divide-[var(--color-border)]">
            <SettingRow
              label="RSS Feeds"
              description="Reuters, BBC, Al Jazeera, AP, Foreign Policy, Bellingcat, and 20+ geopolitics outlets"
              badge={<Badge variant="status-active" size="sm">Active</Badge>}
              action={<span className="text-[10px] text-[var(--color-text-tertiary)] font-mono">26 feeds</span>}
            />
            <SettingRow
              label="Cyber Intelligence"
              description="The Record, CyberScoop, Krebs, CISA, Dark Reading, Bleeping Computer"
              badge={<Badge variant="status-active" size="sm">Active</Badge>}
              action={<span className="text-[10px] text-[var(--color-text-tertiary)] font-mono">8 feeds</span>}
            />
            <SettingRow
              label="Trade & Economics"
              description="WTO, IMF, Financial Times, WSJ, Politico EU"
              badge={<Badge variant="status-active" size="sm">Active</Badge>}
              action={<span className="text-[10px] text-[var(--color-text-tertiary)] font-mono">5 feeds</span>}
            />
            <SettingRow
              label="Humanitarian"
              description="GDACS, UN Peace & Security, UN Humanitarian, ICRC, MSF"
              badge={<Badge variant="status-active" size="sm">Active</Badge>}
              action={<span className="text-[10px] text-[var(--color-text-tertiary)] font-mono">5 feeds</span>}
            />
            <SettingRow
              label="ReliefWeb (OCHA)"
              description="UN humanitarian conflict reports — requires RELIEFWEB_APPNAME env var"
              badge={
                process.env.NEXT_PUBLIC_RELIEFWEB_ENABLED === 'true'
                  ? <Badge variant="status-active" size="sm">Active</Badge>
                  : <Badge variant="status-draft" size="sm">Optional</Badge>
              }
              action={
                <a
                  href="https://apidoc.reliefweb.int"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-400 hover:underline"
                >
                  Register
                </a>
              }
            />
            <SettingRow
              label="UCDP Conflict Data"
              description="Uppsala Conflict Data Program — requires UCDP_API_TOKEN env var"
              badge={<Badge variant="status-draft" size="sm">Optional</Badge>}
              action={
                <a
                  href="https://ucdp.uu.se"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-400 hover:underline"
                >
                  Register
                </a>
              }
            />
            <SettingRow
              label="Manage Sources"
              description="Toggle individual feeds and add custom RSS sources"
              action={
                <a
                  href="/sources"
                  className="text-[10px] text-blue-400 hover:underline"
                >
                  Open Sources →
                </a>
              }
            />
          </div>
        </Panel>

        {/* Notifications */}
        <Panel title="Notifications" subtitle="In-app alert preferences">
          <div className="divide-y divide-[var(--color-border)]">
            <SettingRow
              label="Critical Risk Alerts"
              description="Show alert when a country reaches critical risk level"
              action={<Toggle enabled={notif.criticalAlerts} onChange={setNotifKey('criticalAlerts')} />}
            />
            <SettingRow
              label="Forecast Changes"
              description="Alert on significant probability shifts (±10 percentage points)"
              action={<Toggle enabled={notif.forecastChanges} onChange={setNotifKey('forecastChanges')} />}
            />
            <SettingRow
              label="High-Severity Events"
              description="Alert when new high or critical severity events are ingested"
              action={<Toggle enabled={notif.newHighSeverity} onChange={setNotifKey('newHighSeverity')} />}
            />
            <SettingRow
              label="Watchlist Updates"
              description="Notify when watchlisted countries or forecasts change"
              action={<Toggle enabled={notif.watchlistUpdates} onChange={setNotifKey('watchlistUpdates')} />}
            />
          </div>
        </Panel>

        {/* Account */}
        <Panel title="Account" subtitle="Session and access information">
          <div className="divide-y divide-[var(--color-border)]">
            <SettingRow
              label="Sign Out"
              description="End your current session"
              action={
                <a
                  href="/api/auth/signout"
                  className="text-[10px] text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors"
                >
                  Sign out
                </a>
              }
            />
            <SettingRow
              label="Admin Panel"
              description="Ingestion triggers, forecast generation, data reset"
              action={
                <a href="/admin" className="text-[10px] text-blue-400 hover:underline">
                  Open Admin →
                </a>
              }
            />
          </div>
        </Panel>
      </div>

      <div className="mt-6 p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl">
        <p className="text-[11px] text-[var(--color-text-tertiary)] font-mono leading-relaxed">
          GeoPol OSINT Platform — Beta Build<br />
          Next.js 14 · TypeScript · Tailwind CSS · Prisma · PostgreSQL<br />
          Database: live · Ingestion: active · Forecasts: AI-assisted
        </p>
      </div>
    </div>
  )
}
