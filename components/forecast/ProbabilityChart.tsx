'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Panel } from '@/components/ui/Panel'
import { cn } from '@/lib/utils/cn'
import type { ForecastHistoryEntry } from '@/lib/types/forecast'

interface ProbabilityChartProps {
  history: ForecastHistoryEntry[]
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: '#4ade80',
  medium: '#fbbf24',
  low: '#f87171',
}

function formatAxisDate(dateStr: string): string {
  const d = new Date(dateStr)
  const month = d.toLocaleString('en-US', { month: 'short' })
  const year = String(d.getFullYear()).slice(2)
  return `${month} '${year}`
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ForecastHistoryEntry }> }) {
  if (!active || !payload?.length) return null
  const entry = payload[0].payload
  const truncated =
    entry.changeReason.length > 80
      ? entry.changeReason.slice(0, 80) + '…'
      : entry.changeReason

  return (
    <div
      style={{
        background: '#0d1929',
        border: '1px solid #1e3a5f',
        borderRadius: 6,
        padding: '8px 12px',
        maxWidth: 220,
      }}
    >
      <div
        style={{
          fontFamily: 'monospace',
          fontWeight: 700,
          color: '#60a5fa',
          fontSize: 16,
          marginBottom: 2,
        }}
      >
        {entry.probability}%
      </div>
      <div
        style={{
          color: CONFIDENCE_COLORS[entry.confidenceLevel] ?? '#9ca3af',
          fontSize: 10,
          fontWeight: 600,
          textTransform: 'uppercase',
          marginBottom: 4,
          letterSpacing: '0.08em',
        }}
      >
        {entry.confidenceLevel} confidence
      </div>
      <div style={{ color: '#9ca3af', fontSize: 11, lineHeight: 1.4 }}>{truncated}</div>
    </div>
  )
}

export function ProbabilityChart({ history }: ProbabilityChartProps) {
  if (history.length < 2) {
    return (
      <Panel title="Probability History" subtitle="No chart available">
        <div className="px-5 py-8 text-center">
          <p className="text-xs text-[var(--color-text-tertiary)]">
            Not enough history to chart
          </p>
        </div>
      </Panel>
    )
  }

  const sorted = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const probs = sorted.map((h) => h.probability)
  const minVal = Math.max(0, Math.min(...probs) - 10)
  const maxVal = Math.min(100, Math.max(...probs) + 10)

  const latest = sorted[sorted.length - 1]
  const previous = sorted[sorted.length - 2]
  const diff = latest.probability - previous.probability

  const directionBadge = (
    <span
      className={cn(
        'text-xs font-mono font-semibold',
        diff > 0 ? 'text-red-400' : diff < 0 ? 'text-green-400' : 'text-[var(--color-text-tertiary)]'
      )}
    >
      {diff > 0 ? `↑ +${diff}pp` : diff < 0 ? `↓ ${diff}pp` : '→ no change'}
    </span>
  )

  return (
    <Panel
      title="Probability History"
      subtitle={`${sorted.length} revisions`}
      action={directionBadge}
    >
      <div className="px-4 pt-4 pb-2">
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={sorted} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="#1e3a5f"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatAxisDate}
              tick={{ fill: '#4b5563', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              domain={[minVal, maxVal]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: '#4b5563', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1e3a5f', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="probability"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#probGradient)"
              dot={{ r: 4, fill: '#60a5fa', stroke: '#0d1929', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#93c5fd', stroke: '#0d1929', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}
