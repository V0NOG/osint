# Stage 6: Forecasting Workflows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a probability history chart, a 4-step forecast creation wizard, and a resolve-forecast modal to the geopolitical OSINT platform.

**Architecture:** `ProbabilityChart` is a 'use client' Recharts component inserted into the forecast detail page. The forecast detail page is refactored into a `ForecastDetailView` client component to support resolve-modal state. The creation wizard lives at `/forecasts/new` and uses a shared `ForecastWizard` shell with four step sub-components. A reusable `Modal` shell is added to `components/ui/`.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Recharts (new dependency), Lucide icons, existing `Panel`/`Badge` primitives.

---

## File Map

| Status | Path | Purpose |
|---|---|---|
| Create | `components/ui/Modal.tsx` | Reusable modal shell |
| Create | `components/forecast/ProbabilityChart.tsx` | Recharts area chart — probability over time |
| Create | `components/forecast/ForecastDetailView.tsx` | Client component extracted from forecast detail page |
| Create | `components/forecast/ResolveModal.tsx` | Resolve-forecast modal |
| Create | `app/forecasts/new/page.tsx` | Wizard page route |
| Create | `components/forecast/wizard/ForecastWizard.tsx` | Wizard shell — step state, sidebar, navigation, success state |
| Create | `components/forecast/wizard/StepQuestion.tsx` | Step 1: title, question, target date, region, countries |
| Create | `components/forecast/wizard/StepProbability.tsx` | Step 2: probability slider, confidence, rationale |
| Create | `components/forecast/wizard/StepCriteria.tsx` | Step 3: resolution criteria, uncertainty notes |
| Create | `components/forecast/wizard/StepEvidence.tsx` | Step 4: evidence items, tags |
| Modify | `app/forecasts/[id]/page.tsx` | Slim down to server wrapper + pass data to ForecastDetailView |
| Modify | `components/forecast/ForecastsView.tsx` | Add "+ New Forecast" button |

---

### Task 1: Install recharts and create Modal shell

**Files:**
- Modify: `package.json` (via npm install)
- Create: `components/ui/Modal.tsx`

- [ ] **Step 1: Install recharts**

```bash
cd /Users/connor/Documents/osint && npm install recharts
```

Expected output: `added N packages` with no errors.

- [ ] **Step 2: Verify TypeScript can see recharts types**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors (recharts ships its own types).

- [ ] **Step 3: Create `components/ui/Modal.tsx`**

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg'
}

const maxWidthClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Card */}
      <div
        ref={dialogRef}
        className={cn(
          'relative w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl',
          maxWidthClass[maxWidth]
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 id="modal-title" className="text-sm font-semibold text-[var(--color-text-primary)]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Type check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/ui/Modal.tsx package.json package-lock.json
git commit -m "feat: add recharts dependency and Modal shell component"
```

---

### Task 2: ProbabilityChart component

**Files:**
- Create: `components/forecast/ProbabilityChart.tsx`

**Context:** Uses Recharts `AreaChart`. The `history` array entries are `{ date: string, probability: number, confidenceLevel: 'low' | 'medium' | 'high', changeReason: string }`. X-axis shows dates formatted as `"Oct '25"`. Y-axis is dynamic: padded 10pp above max and 10pp below min, floored at 0, ceilinged at 100. Custom tooltip shows probability, confidence (colored), and truncated `changeReason`. The `Panel` component (from `components/ui/Panel.tsx`) wraps the chart — it accepts a `title`, `subtitle`, and `action` prop (the action renders in the top-right of the header).

- [ ] **Step 1: Create `components/forecast/ProbabilityChart.tsx`**

```tsx
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
import type { ForecastHistoryEntry } from '@/lib/types'

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
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/forecast/ProbabilityChart.tsx
git commit -m "feat: ProbabilityChart component with Recharts area chart"
```

---

### Task 3: Refactor forecast detail page — ForecastDetailView + ProbabilityChart + ResolveModal

**Files:**
- Create: `components/forecast/ResolveModal.tsx`
- Create: `components/forecast/ForecastDetailView.tsx`
- Modify: `app/forecasts/[id]/page.tsx`

**Context:** The current `app/forecasts/[id]/page.tsx` is a server component containing all UI. To add modal state (`useState`), it must be split: the server page keeps `generateStaticParams`, `generateMetadata`, and data resolution; a new `ForecastDetailView` client component holds all JSX and state. The `Modal` component is in `components/ui/Modal.tsx`. The `ProbabilityChart` is in `components/forecast/ProbabilityChart.tsx`. Types: `Forecast` and `ForecastHistoryEntry` from `@/lib/types`. `Country` and `Event` from `@/lib/types`. The `Panel`, `Badge` components live in `components/ui/`. `formatDate` and `formatNumber` are in `lib/utils/format`. `cn` is in `lib/utils/cn`. The existing page imports: `ArrowLeft, ChevronUp, ChevronDown, Scale` from lucide-react.

- [ ] **Step 1: Create `components/forecast/ResolveModal.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils/cn'
import type { Forecast } from '@/lib/types'

export interface ResolveOutcome {
  result: 'yes' | 'no'
  resolutionDate: string
  analystNote: string
  sourceUrl?: string
}

interface ResolveModalProps {
  forecast: Forecast
  isOpen: boolean
  onClose: () => void
  onResolve: (outcome: ResolveOutcome) => void
}

export function ResolveModal({ forecast, isOpen, onClose, onResolve }: ResolveModalProps) {
  const today = new Date().toISOString().slice(0, 10)
  const [result, setResult] = useState<'yes' | 'no' | null>(null)
  const [resolutionDate, setResolutionDate] = useState(today)
  const [analystNote, setAnalystNote] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')

  const canSubmit = result !== null && analystNote.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit || !result) return
    onResolve({
      result,
      resolutionDate,
      analystNote: analystNote.trim(),
      sourceUrl: sourceUrl.trim() || undefined,
    })
  }

  const handleClose = () => {
    setResult(null)
    setAnalystNote('')
    setSourceUrl('')
    setResolutionDate(today)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Resolve Forecast" maxWidth="lg">
      {/* Forecast title reminder */}
      <p className="text-xs text-[var(--color-text-tertiary)] mb-5 leading-relaxed">
        {forecast.title}
      </p>

      {/* Outcome toggle */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          Outcome
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setResult('yes')}
            className={cn(
              'flex-1 py-3 rounded-lg text-sm font-bold tracking-wide border transition-colors',
              result === 'yes'
                ? 'bg-green-500/20 border-green-500/40 text-green-300'
                : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-green-500/30 hover:text-green-400'
            )}
          >
            YES
          </button>
          <button
            onClick={() => setResult('no')}
            className={cn(
              'flex-1 py-3 rounded-lg text-sm font-bold tracking-wide border transition-colors',
              result === 'no'
                ? 'bg-red-500/20 border-red-500/40 text-red-300'
                : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-red-500/30 hover:text-red-400'
            )}
          >
            NO
          </button>
        </div>
      </div>

      {/* Resolution date */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          Resolution Date
        </label>
        <input
          type="date"
          value={resolutionDate}
          onChange={(e) => setResolutionDate(e.target.value)}
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-blue-500/50"
        />
      </div>

      {/* Final analyst note */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          Final Analyst Note <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={4}
          value={analystNote}
          onChange={(e) => setAnalystNote(e.target.value)}
          placeholder="Describe the outcome and how the resolution criteria were satisfied."
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed"
        />
      </div>

      {/* Resolution source */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          Resolution Source <span className="text-[var(--color-text-tertiary)]">(optional)</span>
        </label>
        <input
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="URL to primary source (optional)"
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500/50"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
        <button
          onClick={handleClose}
          className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            canSubmit
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] cursor-not-allowed border border-[var(--color-border)]'
          )}
        >
          Confirm Resolution
        </button>
      </div>
    </Modal>
  )
}
```

- [ ] **Step 2: Create `components/forecast/ForecastDetailView.tsx`**

This is the existing `app/forecasts/[id]/page.tsx` content extracted into a client component, with:
1. `'use client'` at top
2. `useState` for modal open/close, local status, and local history
3. `ProbabilityChart` inserted as first panel in main column (before "Analyst Rationale")
4. `ResolveModal` rendered at bottom of return
5. "Resolve" button in hero when `localStatus === 'active'`
6. Simple toast div fixed at bottom-right

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronUp, ChevronDown, Scale } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Panel } from '@/components/ui/Panel'
import { EventCard } from '@/components/event/EventCard'
import { ProbabilityChart } from '@/components/forecast/ProbabilityChart'
import { ResolveModal, type ResolveOutcome } from '@/components/forecast/ResolveModal'
import { formatDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { Forecast, Country, GeopoliticalEvent, ForecastHistoryEntry } from '@/lib/types'

interface ForecastDetailViewProps {
  forecast: Forecast
  countries: Country[]
  relatedEvents: GeopoliticalEvent[]
}

function ProbabilityBar({ probability }: { probability: number }) {
  return (
    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
        style={{ width: `${probability}%` }}
      />
    </div>
  )
}

function HistoryDiff({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous
  if (Math.abs(diff) < 1)
    return <span className="text-[var(--color-text-tertiary)] text-xs">→ No change</span>
  if (diff > 0)
    return (
      <span className="text-red-400 text-xs font-medium flex items-center gap-0.5">
        <ChevronUp className="w-3 h-3" />
        +{diff}pp
      </span>
    )
  return (
    <span className="text-green-400 text-xs font-medium flex items-center gap-0.5">
      <ChevronDown className="w-3 h-3" />
      {diff}pp
    </span>
  )
}

export function ForecastDetailView({ forecast, countries, relatedEvents }: ForecastDetailViewProps) {
  const [localStatus, setLocalStatus] = useState(forecast.status)
  const [localHistory, setLocalHistory] = useState<ForecastHistoryEntry[]>(forecast.history)
  const [resolveModalOpen, setResolveModalOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const handleResolve = (outcome: ResolveOutcome) => {
    setLocalStatus('resolved')
    setLocalHistory((prev) => [
      ...prev,
      {
        date: outcome.resolutionDate,
        probability: forecast.probability,
        confidenceLevel: forecast.confidenceLevel,
        changeReason: outcome.analystNote,
      },
    ])
    setResolveModalOpen(false)
    const msg = `Forecast resolved as ${outcome.result.toUpperCase()}`
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const sortedHistory = [...localHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const confidenceTextColors = {
    high: 'text-green-400',
    medium: 'text-amber-400',
    low: 'text-red-400',
  }

  const evidenceDirectionColors = {
    supporting: 'text-green-400 bg-green-500/8 border-green-500/15',
    opposing: 'text-red-400 bg-red-500/8 border-red-500/15',
    neutral: 'text-[var(--color-text-tertiary)] bg-white/3 border-[var(--color-border)]',
  }

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      {/* Back nav */}
      <Link
        href="/forecasts"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] mb-5 transition-colors duration-150"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Forecasts
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Main content */}
        <div className="space-y-4">
          {/* Forecast header */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6">
            {/* Status + time horizon badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant={`status-${localStatus}`} size="md">{localStatus}</Badge>
              <span className="text-[10px] font-medium text-[var(--color-text-tertiary)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded px-2 py-0.5 uppercase tracking-wider">
                {forecast.timeHorizon}
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)]">·</span>
              <span className="text-xs text-[var(--color-text-tertiary)]">Updated {formatDate(forecast.lastUpdated)}</span>
              {localStatus === 'active' && (
                <>
                  <span className="text-xs text-[var(--color-text-tertiary)]">·</span>
                  <button
                    onClick={() => setResolveModalOpen(true)}
                    className="text-xs font-medium text-blue-400 border border-blue-500/30 rounded px-2 py-0.5 hover:bg-blue-500/10 transition-colors"
                  >
                    Resolve
                  </button>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold text-[var(--color-text-primary)] leading-snug mb-2">
              {forecast.title}
            </h1>

            {/* Inline probability row */}
            <div className="flex items-center gap-4 bg-black/20 rounded-lg px-4 py-3 mb-3">
              <div className="flex-shrink-0">
                <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">Probability</div>
                <div className="text-3xl font-bold font-mono tabular-nums leading-none text-blue-400">
                  {forecast.probability}<span className="text-xl">%</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <ProbabilityBar probability={forecast.probability} />
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">Confidence</div>
                <div className={cn('text-sm font-semibold uppercase tracking-wide', confidenceTextColors[forecast.confidenceLevel])}>
                  {forecast.confidenceLevel}
                </div>
              </div>
              <div className="flex-shrink-0 text-right border-l border-[var(--color-border)] pl-4">
                <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">Revision</div>
                <div className="text-sm font-mono text-[var(--color-text-secondary)]">v{forecast.versionNumber}</div>
              </div>
            </div>

            {/* Question */}
            <p className="text-sm text-[var(--color-text-tertiary)] leading-relaxed italic">
              &ldquo;{forecast.question}&rdquo;
            </p>
          </div>

          {/* Probability chart — NEW */}
          <ProbabilityChart history={localHistory} />

          {/* Rationale */}
          <Panel title="Analyst Rationale" subtitle="Why this probability was assessed">
            <div className="px-5 py-4">
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {forecast.rationale}
              </p>
            </div>
          </Panel>

          {/* Confidence notes + uncertainty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel title="Confidence Notes">
              <div className="px-5 py-4">
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {forecast.confidenceNotes}
                </p>
              </div>
            </Panel>
            <Panel title="Uncertainty Factors">
              <div className="px-5 py-4">
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {forecast.uncertaintyNotes}
                </p>
              </div>
            </Panel>
          </div>

          {/* Evidence */}
          {forecast.evidence && forecast.evidence.length > 0 && (
            <Panel title="Evidence" subtitle="Key information weighed in this assessment">
              <div className="divide-y divide-[var(--color-border)]">
                {forecast.evidence.map((item) => (
                  <div key={item.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border mt-0.5',
                          evidenceDirectionColors[item.direction]
                        )}
                      >
                        {item.direction}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-xs font-semibold text-[var(--color-text-primary)]">
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-[var(--color-text-tertiary)] flex-shrink-0">
                            {item.weight} weight
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                          {item.description}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1.5">
                          Added {formatDate(item.addedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Resolution criteria */}
          <Panel title="Resolution Criteria">
            <div className="px-5 py-4">
              <div className="flex items-start gap-2.5">
                <Scale className="w-4 h-4 text-[var(--color-text-tertiary)] flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {forecast.resolutionCriteria}
                </p>
              </div>
            </div>
          </Panel>

          {/* Version history */}
          <Panel title="Revision History" subtitle={`${localHistory.length} versions`}>
            <div className="divide-y divide-[var(--color-border)]">
              {sortedHistory.map((entry, i) => (
                <div key={i} className="px-5 py-3.5">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-semibold text-[var(--color-text-primary)] tabular-nums">
                        {entry.probability}%
                      </span>
                      {i < sortedHistory.length - 1 && (
                        <HistoryDiff
                          current={entry.probability}
                          previous={sortedHistory[i + 1].probability}
                        />
                      )}
                      <span
                        className={cn(
                          'text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded',
                          entry.confidenceLevel === 'high'
                            ? 'text-green-400 bg-green-500/10'
                            : entry.confidenceLevel === 'medium'
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-red-400 bg-red-500/10'
                        )}
                      >
                        {entry.confidenceLevel} conf.
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--color-text-tertiary)] font-mono flex-shrink-0">
                      {formatDate(entry.date)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {entry.changeReason}
                  </p>
                  {entry.analystNote && (
                    <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1 italic">
                      {entry.analystNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          {/* Related events */}
          {relatedEvents.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                Related Events
              </h2>
              <div className="space-y-2.5">
                {relatedEvents.map((event) => (
                  <EventCard key={event.id} event={event} variant="compact" />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Countries */}
          {countries.length > 0 && (
            <Panel title="Countries">
              <div className="divide-y divide-[var(--color-border)]">
                {countries.map((country) => (
                  <Link
                    key={country.id}
                    href={`/countries/${country.slug}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-[var(--color-bg-elevated)] transition-colors duration-150 group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-4 rounded-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-[var(--color-text-tertiary)] font-mono">
                          {country.iso2}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors truncate">
                        {country.name}
                      </span>
                    </div>
                    <Badge variant={`risk-${country.riskLevel}`} size="sm">
                      {country.riskLevel}
                    </Badge>
                  </Link>
                ))}
              </div>
            </Panel>
          )}

          {/* Forecast metadata */}
          <Panel title="Forecast Metadata">
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">ID</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">{forecast.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Status</span>
                <Badge variant={`status-${localStatus}`} size="sm">{localStatus}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Version</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">v{forecast.versionNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Region</span>
                <span className="text-xs text-[var(--color-text-secondary)]">{forecast.region}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Target</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">{forecast.targetDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Created</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">{forecast.createdAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Revisions</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">{localHistory.length}</span>
              </div>
            </div>
          </Panel>

          {/* Tags */}
          {forecast.tags && forecast.tags.length > 0 && (
            <Panel title="Tags">
              <div className="px-5 py-4 flex flex-wrap gap-1.5">
                {forecast.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-1 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>

      {/* Resolve modal */}
      <ResolveModal
        forecast={forecast}
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        onResolve={handleResolve}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--color-bg-surface)] border border-green-500/30 rounded-lg px-4 py-3 text-sm text-green-300 font-medium shadow-xl">
          {toast}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Replace `app/forecasts/[id]/page.tsx` with a slim server wrapper**

```tsx
import { notFound } from 'next/navigation'
import { mockForecasts } from '@/lib/mock-data/forecasts'
import { mockEvents } from '@/lib/mock-data/events'
import { mockCountries } from '@/lib/mock-data/countries'
import { ForecastDetailView } from '@/components/forecast/ForecastDetailView'
import type { Country, GeopoliticalEvent } from '@/lib/types'

interface PageProps {
  params: { id: string }
}

export async function generateStaticParams() {
  return mockForecasts.map((f) => ({ id: f.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const forecast = mockForecasts.find((f) => f.id === params.id)
  return { title: forecast?.title ?? 'Forecast' }
}

export default function ForecastDetailPage({ params }: PageProps) {
  const forecast = mockForecasts.find((f) => f.id === params.id)
  if (!forecast) notFound()

  const countries = forecast.countries
    .map((id) => mockCountries.find((c) => c.id === id))
    .filter((c): c is Country => c !== undefined)

  const relatedEvents = mockEvents
    .filter((e) => forecast.relatedEvents?.includes(e.id))
    .slice(0, 3) as GeopoliticalEvent[]

  return <ForecastDetailView forecast={forecast} countries={countries} relatedEvents={relatedEvents} />
}
```

- [ ] **Step 4: Type check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors. If you see `Type 'Event' is not assignable`, check that `Event` is exported from `@/lib/types` — it should be in `lib/types/events.ts` and re-exported via `lib/types/index.ts`.

- [ ] **Step 5: Commit**

```bash
git add components/forecast/ResolveModal.tsx components/forecast/ForecastDetailView.tsx app/forecasts/\[id\]/page.tsx
git commit -m "feat: forecast detail — ProbabilityChart, ResolveModal, ForecastDetailView refactor"
```

---

### Task 4: Forecast creation wizard

**Files:**
- Create: `app/forecasts/new/page.tsx`
- Create: `components/forecast/wizard/ForecastWizard.tsx`
- Create: `components/forecast/wizard/StepQuestion.tsx`
- Create: `components/forecast/wizard/StepProbability.tsx`
- Create: `components/forecast/wizard/StepCriteria.tsx`
- Create: `components/forecast/wizard/StepEvidence.tsx`

**Context:** `mockRegions` is from `@/lib/mock-data/regions` — each has `{ id, name }`. `mockCountries` is from `@/lib/mock-data/countries` — each has `{ id, name }`. `ConfidenceLevel` is `'low' | 'medium' | 'high'` from `@/lib/types`. `cn` is from `@/lib/utils/cn`. `getProbabilityColor` is from `@/lib/utils/risk` — returns a Tailwind text class based on probability thresholds. All steps receive `draft: ForecastDraft`, `onChange: (updates: Partial<ForecastDraft>) => void`, and (except StepEvidence) `errors: Record<string, string>`.

- [ ] **Step 1: Create `app/forecasts/new/page.tsx`**

```tsx
import { ForecastWizard } from '@/components/forecast/wizard/ForecastWizard'

export const metadata = {
  title: 'New Forecast',
}

export default function NewForecastPage() {
  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <ForecastWizard />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/forecast/wizard/StepQuestion.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { mockRegions } from '@/lib/mock-data/regions'
import { mockCountries } from '@/lib/mock-data/countries'
import { cn } from '@/lib/utils/cn'
import type { ForecastDraft } from './ForecastWizard'

interface StepQuestionProps {
  draft: ForecastDraft
  onChange: (updates: Partial<ForecastDraft>) => void
  errors: Record<string, string>
}

export function StepQuestion({ draft, onChange, errors }: StepQuestionProps) {
  const [countryFilter, setCountryFilter] = useState('')

  const filteredCountries = mockCountries.filter((c) =>
    c.name.toLowerCase().includes(countryFilter.toLowerCase())
  )

  const toggleCountry = (id: string) => {
    const next = draft.countries.includes(id)
      ? draft.countries.filter((c) => c !== id)
      : [...draft.countries, id]
    onChange({ countries: next })
  }

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Forecast Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Russia-Ukraine ceasefire before Q3 2026"
          className={cn(
            'w-full bg-[var(--color-bg-elevated)] border rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none transition-colors',
            errors.title ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--color-border)] focus:border-blue-500/50'
          )}
        />
        {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
      </div>

      {/* Formal question */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Formal Question <span className="text-red-400">*</span>
        </label>
        <p className="text-[11px] text-[var(--color-text-tertiary)] mb-1.5">Frame as a binary yes/no question with a clear measurable outcome.</p>
        <textarea
          rows={3}
          value={draft.question}
          onChange={(e) => onChange({ question: e.target.value })}
          placeholder="Will...before [date]?"
          className={cn(
            'w-full bg-[var(--color-bg-elevated)] border rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none resize-none leading-relaxed transition-colors',
            errors.question ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--color-border)] focus:border-blue-500/50'
          )}
        />
        {errors.question && <p className="text-xs text-red-400 mt-1">{errors.question}</p>}
      </div>

      {/* Target date + time horizon */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
            Target Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={draft.targetDate}
            onChange={(e) => onChange({ targetDate: e.target.value })}
            className={cn(
              'w-full bg-[var(--color-bg-elevated)] border rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none transition-colors',
              errors.targetDate ? 'border-red-500/50' : 'border-[var(--color-border)] focus:border-blue-500/50'
            )}
          />
          {errors.targetDate && <p className="text-xs text-red-400 mt-1">{errors.targetDate}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
            Time Horizon <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={draft.timeHorizon}
            onChange={(e) => onChange({ timeHorizon: e.target.value })}
            placeholder="e.g. Q2 2026"
            className={cn(
              'w-full bg-[var(--color-bg-elevated)] border rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none transition-colors',
              errors.timeHorizon ? 'border-red-500/50' : 'border-[var(--color-border)] focus:border-blue-500/50'
            )}
          />
          {errors.timeHorizon && <p className="text-xs text-red-400 mt-1">{errors.timeHorizon}</p>}
        </div>
      </div>

      {/* Region */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Region <span className="text-red-400">*</span>
        </label>
        <select
          value={draft.region}
          onChange={(e) => onChange({ region: e.target.value })}
          className={cn(
            'w-full bg-[var(--color-bg-elevated)] border rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none transition-colors appearance-none',
            errors.region ? 'border-red-500/50' : 'border-[var(--color-border)] focus:border-blue-500/50'
          )}
        >
          <option value="">Select a region…</option>
          {mockRegions.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        {errors.region && <p className="text-xs text-red-400 mt-1">{errors.region}</p>}
      </div>

      {/* Countries */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Countries <span className="text-[var(--color-text-tertiary)] font-normal normal-case">(optional)</span>
        </label>
        <input
          type="text"
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          placeholder="Filter countries…"
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-t-lg px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500/50 transition-colors"
        />
        <div className="overflow-y-auto max-h-40 bg-[var(--color-bg-elevated)] border border-t-0 border-[var(--color-border)] rounded-b-lg divide-y divide-[var(--color-border)]">
          {filteredCountries.map((c) => (
            <label key={c.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.countries.includes(c.id)}
                onChange={() => toggleCountry(c.id)}
                className="accent-blue-500"
              />
              <span className="text-xs text-[var(--color-text-secondary)]">{c.name}</span>
            </label>
          ))}
        </div>
        {draft.countries.length > 0 && (
          <p className="text-[11px] text-blue-400 mt-1">{draft.countries.length} selected</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `components/forecast/wizard/StepProbability.tsx`**

```tsx
'use client'

import { cn } from '@/lib/utils/cn'
import { getProbabilityColor } from '@/lib/utils/risk'
import type { ConfidenceLevel } from '@/lib/types'
import type { ForecastDraft } from './ForecastWizard'

interface StepProbabilityProps {
  draft: ForecastDraft
  onChange: (updates: Partial<ForecastDraft>) => void
  errors: Record<string, string>
}

const CONFIDENCE_LEVELS: { value: ConfidenceLevel; label: string; activeClass: string }[] = [
  { value: 'low', label: 'LOW', activeClass: 'bg-red-500/20 border-red-500/40 text-red-300' },
  { value: 'medium', label: 'MEDIUM', activeClass: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
  { value: 'high', label: 'HIGH', activeClass: 'bg-green-500/20 border-green-500/40 text-green-300' },
]

export function StepProbability({ draft, onChange, errors }: StepProbabilityProps) {
  return (
    <div className="space-y-6">
      {/* Probability slider */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
          Probability
        </label>
        <div className="text-center mb-3">
          <span className={cn('text-5xl font-bold font-mono tabular-nums', getProbabilityColor(draft.probability))}>
            {draft.probability}
          </span>
          <span className={cn('text-3xl font-bold font-mono', getProbabilityColor(draft.probability))}>%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={draft.probability}
          onChange={(e) => onChange({ probability: Number(e.target.value) })}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-[var(--color-text-tertiary)]">0% — impossible</span>
          <span className="text-[10px] text-[var(--color-text-tertiary)]">50% — uncertain</span>
          <span className="text-[10px] text-[var(--color-text-tertiary)]">100% — certain</span>
        </div>
      </div>

      {/* Confidence level */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          Confidence Level
        </label>
        <div className="flex gap-2">
          {CONFIDENCE_LEVELS.map(({ value, label, activeClass }) => (
            <button
              key={value}
              onClick={() => onChange({ confidenceLevel: value })}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wider border transition-colors',
                draft.confidenceLevel === value
                  ? activeClass
                  : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-border-strong)]'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Rationale */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Rationale <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={5}
          value={draft.rationale}
          onChange={(e) => onChange({ rationale: e.target.value })}
          placeholder="Why was this probability assessed? Summarise the key drivers."
          className={cn(
            'w-full bg-[var(--color-bg-elevated)] border rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none resize-none leading-relaxed transition-colors',
            errors.rationale ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--color-border)] focus:border-blue-500/50'
          )}
        />
        {errors.rationale && <p className="text-xs text-red-400 mt-1">{errors.rationale}</p>}
      </div>

      {/* Confidence notes */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Confidence Notes <span className="text-[var(--color-text-tertiary)] font-normal normal-case">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={draft.confidenceNotes}
          onChange={(e) => onChange({ confidenceNotes: e.target.value })}
          placeholder="What limits your confidence in this assessment?"
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none resize-none leading-relaxed focus:border-blue-500/50 transition-colors"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `components/forecast/wizard/StepCriteria.tsx`**

```tsx
'use client'

import { cn } from '@/lib/utils/cn'
import type { ForecastDraft } from './ForecastWizard'

interface StepCriteriaProps {
  draft: ForecastDraft
  onChange: (updates: Partial<ForecastDraft>) => void
  errors: Record<string, string>
}

export function StepCriteria({ draft, onChange, errors }: StepCriteriaProps) {
  return (
    <div className="space-y-6">
      {/* Resolution criteria */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Resolution Criteria <span className="text-red-400">*</span>
        </label>
        <p className="text-[11px] text-amber-400/80 mb-1.5">
          Be precise. Ambiguous criteria make forecasts impossible to resolve.
        </p>
        <textarea
          rows={6}
          value={draft.resolutionCriteria}
          onChange={(e) => onChange({ resolutionCriteria: e.target.value })}
          placeholder="Resolves YES if: ..."
          className={cn(
            'w-full bg-[var(--color-bg-elevated)] border rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none resize-none leading-relaxed transition-colors font-mono',
            errors.resolutionCriteria ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--color-border)] focus:border-blue-500/50'
          )}
        />
        {errors.resolutionCriteria && <p className="text-xs text-red-400 mt-1">{errors.resolutionCriteria}</p>}
      </div>

      {/* Uncertainty notes */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Uncertainty Notes <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={4}
          value={draft.uncertaintyNotes}
          onChange={(e) => onChange({ uncertaintyNotes: e.target.value })}
          placeholder="What could change this probability significantly? What are you most uncertain about?"
          className={cn(
            'w-full bg-[var(--color-bg-elevated)] border rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none resize-none leading-relaxed transition-colors',
            errors.uncertaintyNotes ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--color-border)] focus:border-blue-500/50'
          )}
        />
        {errors.uncertaintyNotes && <p className="text-xs text-red-400 mt-1">{errors.uncertaintyNotes}</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create `components/forecast/wizard/StepEvidence.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { ForecastDraft, DraftEvidence } from './ForecastWizard'

interface StepEvidenceProps {
  draft: ForecastDraft
  onChange: (updates: Partial<ForecastDraft>) => void
}

type Direction = DraftEvidence['direction']
type Weight = DraftEvidence['weight']

const DIRECTIONS: { value: Direction; label: string; activeClass: string }[] = [
  { value: 'supporting', label: 'Supporting', activeClass: 'bg-green-500/20 border-green-500/40 text-green-300' },
  { value: 'opposing', label: 'Opposing', activeClass: 'bg-red-500/20 border-red-500/40 text-red-300' },
  { value: 'neutral', label: 'Neutral', activeClass: 'bg-[var(--color-bg-elevated)] border-[var(--color-border-strong)] text-[var(--color-text-secondary)]' },
]

const WEIGHTS: { value: Weight; label: string }[] = [
  { value: 'strong', label: 'Strong' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'weak', label: 'Weak' },
]

const DIRECTION_DISPLAY_CLASS: Record<Direction, string> = {
  supporting: 'text-green-400 bg-green-500/10 border-green-500/20',
  opposing: 'text-red-400 bg-red-500/10 border-red-500/20',
  neutral: 'text-[var(--color-text-tertiary)] bg-white/5 border-[var(--color-border)]',
}

const EMPTY_FORM = { title: '', description: '', direction: 'supporting' as Direction, weight: 'moderate' as Weight }

export function StepEvidence({ draft, onChange }: StepEvidenceProps) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [tagInput, setTagInput] = useState('')

  const addEvidence = () => {
    if (!form.title.trim()) return
    const item: DraftEvidence = { ...form, id: crypto.randomUUID(), title: form.title.trim(), description: form.description.trim() }
    onChange({ evidence: [...draft.evidence, item] })
    setForm(EMPTY_FORM)
  }

  const removeEvidence = (id: string) => {
    onChange({ evidence: draft.evidence.filter((e) => e.id !== id) })
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim().replace(/,$/, '')
      if (tag && !draft.tags.includes(tag)) {
        onChange({ tags: [...draft.tags, tag] })
      }
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    onChange({ tags: draft.tags.filter((t) => t !== tag) })
  }

  return (
    <div className="space-y-6">
      {/* Evidence list */}
      {draft.evidence.length > 0 && (
        <div className="space-y-2">
          {draft.evidence.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg">
              <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border flex-shrink-0 mt-0.5', DIRECTION_DISPLAY_CLASS[item.direction])}>
                {item.direction}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">{item.title}</p>
                {item.description && <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 leading-relaxed">{item.description}</p>}
              </div>
              <span className="text-[10px] text-[var(--color-text-tertiary)] flex-shrink-0 mt-0.5">{item.weight}</span>
              <button onClick={() => removeEvidence(item.id)} className="text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add evidence form */}
      <div className="border border-[var(--color-border)] rounded-lg p-4 space-y-3">
        <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Add Evidence</p>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Evidence title"
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500/50 transition-colors"
        />
        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Brief description (optional)"
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none resize-none leading-relaxed focus:border-blue-500/50 transition-colors"
        />
        <div className="grid grid-cols-2 gap-3">
          {/* Direction */}
          <div>
            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1.5">Direction</p>
            <div className="flex flex-col gap-1">
              {DIRECTIONS.map(({ value, label, activeClass }) => (
                <button
                  key={value}
                  onClick={() => setForm((f) => ({ ...f, direction: value }))}
                  className={cn(
                    'text-xs py-1.5 rounded border transition-colors text-left px-2',
                    form.direction === value ? activeClass : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-border-strong)]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {/* Weight */}
          <div>
            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1.5">Weight</p>
            <div className="flex flex-col gap-1">
              {WEIGHTS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setForm((f) => ({ ...f, weight: value }))}
                  className={cn(
                    'text-xs py-1.5 rounded border transition-colors text-left px-2',
                    form.weight === value
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                      : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-border-strong)]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={addEvidence}
          disabled={!form.title.trim()}
          className={cn(
            'w-full py-2 rounded-lg text-xs font-semibold transition-colors',
            form.title.trim()
              ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30'
              : 'bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] cursor-not-allowed'
          )}
        >
          + Add
        </button>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Tags <span className="text-[var(--color-text-tertiary)] font-normal normal-case">(optional — press Enter or comma to add)</span>
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {draft.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
              {tag}
              <button onClick={() => removeTag(tag)} className="text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="e.g. russia-ukraine, ceasefire"
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500/50 transition-colors"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create `components/forecast/wizard/ForecastWizard.tsx`**

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { StepQuestion } from './StepQuestion'
import { StepProbability } from './StepProbability'
import { StepCriteria } from './StepCriteria'
import { StepEvidence } from './StepEvidence'
import type { ConfidenceLevel } from '@/lib/types'

export interface DraftEvidence {
  id: string
  title: string
  description: string
  direction: 'supporting' | 'opposing' | 'neutral'
  weight: 'strong' | 'moderate' | 'weak'
}

export interface ForecastDraft {
  title: string
  question: string
  targetDate: string
  timeHorizon: string
  region: string
  countries: string[]
  probability: number
  confidenceLevel: ConfidenceLevel
  rationale: string
  confidenceNotes: string
  resolutionCriteria: string
  uncertaintyNotes: string
  evidence: DraftEvidence[]
  tags: string[]
}

const INITIAL_DRAFT: ForecastDraft = {
  title: '',
  question: '',
  targetDate: '',
  timeHorizon: '',
  region: '',
  countries: [],
  probability: 50,
  confidenceLevel: 'medium',
  rationale: '',
  confidenceNotes: '',
  resolutionCriteria: '',
  uncertaintyNotes: '',
  evidence: [],
  tags: [],
}

const STEPS = [
  { label: 'Question', description: 'Define what you are forecasting' },
  { label: 'Probability', description: 'Assess the likelihood and rationale' },
  { label: 'Criteria', description: 'Define how this forecast resolves' },
  { label: 'Evidence & Tags', description: 'Add supporting evidence and tags' },
]

export function ForecastWizard() {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<ForecastDraft>(INITIAL_DRAFT)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateDraft = (updates: Partial<ForecastDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }))
  }

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {}
    if (stepIndex === 0) {
      if (!draft.title.trim()) newErrors.title = 'Required'
      if (!draft.question.trim()) newErrors.question = 'Required'
      if (!draft.targetDate) newErrors.targetDate = 'Required'
      if (!draft.timeHorizon.trim()) newErrors.timeHorizon = 'Required'
      if (!draft.region) newErrors.region = 'Required'
    }
    if (stepIndex === 1) {
      if (!draft.rationale.trim()) newErrors.rationale = 'Required'
    }
    if (stepIndex === 2) {
      if (!draft.resolutionCriteria.trim()) newErrors.resolutionCriteria = 'Required'
      if (!draft.uncertaintyNotes.trim()) newErrors.uncertaintyNotes = 'Required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep(step)) return
    setErrors({})
    setStep((s) => s + 1)
  }

  const handleBack = () => {
    setErrors({})
    setStep((s) => s - 1)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-10">
        <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-green-400" strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Forecast created</h2>
        <p className="text-sm text-[var(--color-text-tertiary)] mb-8 max-w-xs">{draft.title}</p>
        <div className="flex items-center gap-3">
          <Link
            href="/forecasts"
            className="px-4 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            View all forecasts
          </Link>
          <button
            onClick={() => { setDraft(INITIAL_DRAFT); setStep(0); setSubmitted(false) }}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition-colors"
          >
            Create another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[600px]">
      {/* Sidebar */}
      <div className="w-[200px] flex-shrink-0 border-r border-[var(--color-border)] p-4 flex flex-col">
        <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest mb-5">
          New Forecast
        </p>
        <div className="flex flex-col gap-1 flex-1">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                i === step && 'bg-blue-500/10 border-l-2 border-blue-500 ml-[-1px]',
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold border',
                  i === step && 'bg-blue-600 border-blue-600 text-white',
                  i < step && 'bg-green-500/15 border-green-500/40',
                  i > step && 'border-[var(--color-border)] text-[var(--color-text-tertiary)]'
                )}
              >
                {i < step ? <Check className="w-3 h-3 text-green-400" /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  i === step ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'
                )}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[var(--color-text-tertiary)]">Step {step + 1} of {STEPS.length}</p>
      </div>

      {/* Main form area */}
      <div className="flex-1 p-8 flex flex-col min-h-0">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{STEPS[step].label}</h2>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-0.5">{STEPS[step].description}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {step === 0 && <StepQuestion draft={draft} onChange={updateDraft} errors={errors} />}
          {step === 1 && <StepProbability draft={draft} onChange={updateDraft} errors={errors} />}
          {step === 2 && <StepCriteria draft={draft} onChange={updateDraft} errors={errors} />}
          {step === 3 && <StepEvidence draft={draft} onChange={updateDraft} />}
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--color-border)] mt-6">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] transition-colors"
            >
              ← Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => setSubmitted(true)}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition-colors"
            >
              Create Forecast
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Type check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors. Common issue: `crypto.randomUUID()` — this is available in modern browsers and Node 19+. If you see a type error for it, add `"lib": ["ES2022", "DOM"]` to `tsconfig.json` compilerOptions (it should already be there).

- [ ] **Step 8: Commit**

```bash
git add app/forecasts/new/page.tsx components/forecast/wizard/
git commit -m "feat: forecast creation wizard with 4-step form and success state"
```

---

### Task 5: Wire "New Forecast" button in ForecastsView

**Files:**
- Modify: `components/forecast/ForecastsView.tsx`

**Context:** `ForecastsView.tsx` is a client component. The header row is at lines 97–107 of the current file. The `h1` is inside a `<div>` at line 99 with a flex column. The outer container at line 97 has `flex items-start gap-4 mb-4`. Add a `<Link>` button to the right of this row. Import `Link` from `next/link` and `Plus` from `lucide-react`.

- [ ] **Step 1: Add `Link` and `Plus` imports to `ForecastsView.tsx`**

The current import line is:
```tsx
import { Target } from 'lucide-react'
```

Change to:
```tsx
import { Target, Plus } from 'lucide-react'
```

And add after the existing `import` block:
```tsx
import Link from 'next/link'
```

- [ ] **Step 2: Update the header row in `ForecastsView.tsx`**

Find this block (around line 97):
```tsx
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
```

Replace with:
```tsx
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Target className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Forecasts</h1>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {mockForecasts.length} structured forecasts — {activeCount} active
          </p>
        </div>
        <Link
          href="/forecasts/new"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          New Forecast
        </Link>
      </div>
```

- [ ] **Step 3: Type check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/forecast/ForecastsView.tsx
git commit -m "feat: add New Forecast button to forecasts list page"
```
