import { Settings, Database, Monitor, Bell, User, ChevronRight, Shield, Globe, RefreshCw } from 'lucide-react'
import { Panel } from '@/components/ui/Panel'
import { Badge } from '@/components/ui/Badge'

export const metadata = {
  title: 'Settings',
}

function SettingRow({
  label,
  description,
  value,
  action,
  badge,
}: {
  label: string
  description?: string
  value?: string
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
          <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {value && (
          <span className="text-xs text-[var(--color-text-tertiary)]">{value}</span>
        )}
        {action ?? (
          <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
        )}
      </div>
    </div>
  )
}

function Toggle({ enabled = false }: { enabled?: boolean }) {
  return (
    <div
      className={`relative w-8 h-4.5 rounded-full transition-colors duration-200 ${
        enabled ? 'bg-blue-600' : 'bg-[var(--color-bg-overlay)]'
      } border border-[var(--color-border-strong)]`}
    >
      <div
        className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? 'translate-x-3.5' : 'translate-x-0.5'
        }`}
      />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-[800px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <Settings className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Settings</h1>
      </div>

      {/* Platform info banner */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-4 mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4.5 h-4.5 text-blue-400" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">GeoPol OSINT Platform</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">v0.1.0 — Phase 1 Build</p>
          </div>
        </div>
        <Badge variant="status-draft">Beta</Badge>
      </div>

      <div className="space-y-4">
        {/* Data Sources */}
        <Panel
          title="Data Sources"
          subtitle="Configure intelligence data ingestion"
          action={
            <Badge variant="default">Planned</Badge>
          }
        >
          <div className="divide-y divide-[var(--color-border)]">
            <SettingRow
              label="Primary OSINT Feed"
              description="RSS and API-based ingestion from verified open-source outlets"
              value="Not configured"
              badge={<Badge variant="status-draft" size="sm">Phase 3</Badge>}
            />
            <SettingRow
              label="Conflict Monitor"
              description="ACLED, UCDP, and Crisis Group automated data pulls"
              value="Not configured"
              badge={<Badge variant="status-draft" size="sm">Phase 3</Badge>}
            />
            <SettingRow
              label="Economic Indicators"
              description="IMF, World Bank, and central bank data feeds"
              value="Not configured"
              badge={<Badge variant="status-draft" size="sm">Phase 3</Badge>}
            />
            <SettingRow
              label="Social Media Monitoring"
              description="Keyword and actor tracking across public social platforms"
              value="Not configured"
              badge={<Badge variant="status-draft" size="sm">Phase 4</Badge>}
            />
            <SettingRow
              label="Mock Data Mode"
              description="Using seeded mock data for all platform views"
              action={<Toggle enabled={true} />}
            />
          </div>
        </Panel>

        {/* Display */}
        <Panel title="Display" subtitle="Appearance and layout preferences">
          <div className="divide-y divide-[var(--color-border)]">
            <SettingRow
              label="Theme"
              description="Interface color scheme"
              value="Dark (default)"
              action={
                <select className="text-xs bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded px-2 py-1 text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-border-strong)]">
                  <option>Dark</option>
                  <option>Light (coming soon)</option>
                </select>
              }
            />
            <SettingRow
              label="Density"
              description="Information density in list views"
              action={
                <select className="text-xs bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded px-2 py-1 text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-border-strong)]">
                  <option>Comfortable</option>
                  <option>Compact</option>
                  <option>Spacious</option>
                </select>
              }
            />
            <SettingRow
              label="Sidebar"
              description="Navigation sidebar behavior"
              value="Fixed (240px)"
            />
            <SettingRow
              label="Animation"
              description="UI transition and animation effects"
              action={<Toggle enabled={true} />}
            />
            <SettingRow
              label="3D Globe"
              description="Enable WebGL globe rendering (Phase 2)"
              action={<Toggle enabled={false} />}
              badge={<Badge variant="status-draft" size="sm">Phase 2</Badge>}
            />
          </div>
        </Panel>

        {/* Notifications */}
        <Panel title="Notifications" subtitle="Alert and update preferences">
          <div className="divide-y divide-[var(--color-border)]">
            <SettingRow
              label="Critical Risk Alerts"
              description="Notify when a country risk level reaches critical"
              action={<Toggle enabled={true} />}
            />
            <SettingRow
              label="Forecast Changes"
              description="Notify on significant probability shifts (±10pp)"
              action={<Toggle enabled={true} />}
            />
            <SettingRow
              label="New Events"
              description="Notify on new high-severity events"
              action={<Toggle enabled={false} />}
            />
            <SettingRow
              label="Watchlist Updates"
              description="Notify on changes to watchlisted items"
              action={<Toggle enabled={true} />}
            />
            <SettingRow
              label="Notification Delivery"
              description="How you receive notifications"
              value="In-app only"
              badge={<Badge variant="status-draft" size="sm">Email coming</Badge>}
            />
          </div>
        </Panel>

        {/* Account */}
        <Panel title="Account" subtitle="User account and access settings">
          <div className="divide-y divide-[var(--color-border)]">
            <SettingRow
              label="Account Type"
              description="Your current access tier"
              value="Analyst (Beta)"
            />
            <SettingRow
              label="API Access"
              description="Programmatic access to platform data"
              value="Not enabled"
              badge={<Badge variant="status-draft" size="sm">Phase 5</Badge>}
            />
            <SettingRow
              label="Export Data"
              description="Download forecast data and assessments"
              value="CSV / JSON"
              badge={<Badge variant="status-draft" size="sm">Phase 3</Badge>}
            />
            <SettingRow
              label="Collaboration"
              description="Multi-user team workspaces"
              value="Not available"
              badge={<Badge variant="status-draft" size="sm">Future</Badge>}
            />
          </div>
        </Panel>
      </div>

      {/* Build info */}
      <div className="mt-6 p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl">
        <p className="text-[11px] text-[var(--color-text-tertiary)] font-mono leading-relaxed">
          GeoPol OSINT Platform v0.1.0-beta — Phase 1 Build<br />
          Next.js 14 · TypeScript · Tailwind CSS<br />
          Mock data mode: active · Last refresh: 2026-04-01T09:42:00Z
        </p>
      </div>
    </div>
  )
}
