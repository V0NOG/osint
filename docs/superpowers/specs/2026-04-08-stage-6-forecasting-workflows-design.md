# Stage 6: Forecasting Workflows — Design Spec
**Date:** 2026-04-08
**Phase:** 6 of 9 (CLAUDE.md build order)
**Status:** Approved

---

## Overview

Stage 6 adds three forecasting workflow features:

1. **Probability history chart** — visual line chart on the forecast detail page
2. **Forecast creation wizard** — 4-step form at `/forecasts/new`
3. **Resolution modal** — mark a forecast resolved YES/NO from its detail page

All data remains mock-only. Forms are production-ready for backend wiring in Stage 7.

---

## Architecture

### New Files

| Path | Purpose |
|---|---|
| `app/forecasts/new/page.tsx` | Wizard page route |
| `components/forecast/wizard/ForecastWizard.tsx` | Wizard shell — step state, sidebar, navigation |
| `components/forecast/wizard/StepQuestion.tsx` | Step 1: title, question, target date, region, countries |
| `components/forecast/wizard/StepProbability.tsx` | Step 2: probability slider, confidence, rationale |
| `components/forecast/wizard/StepCriteria.tsx` | Step 3: resolution criteria, uncertainty notes |
| `components/forecast/wizard/StepEvidence.tsx` | Step 4: evidence items, tags |
| `components/forecast/ProbabilityChart.tsx` | Recharts line chart — probability over time |
| `components/forecast/ResolveModal.tsx` | Resolution modal — outcome, date, final note |
| `components/ui/Modal.tsx` | Reusable modal shell (backdrop + centered card) |

### Modified Files

| Path | Change |
|---|---|
| `app/forecasts/[id]/page.tsx` | Add ProbabilityChart above rationale; add ResolveModal + Resolve button in hero |
| `components/forecast/ForecastsView.tsx` | Add "New Forecast" button linking to `/forecasts/new` |

### New Dependencies

| Package | Purpose |
|---|---|
| `recharts` | Line chart for probability history |

---

## 1. Probability History Chart

### Component: `ProbabilityChart`

```tsx
interface ProbabilityChartProps {
  history: ForecastHistoryEntry[]
}
```

Renders a Recharts `LineChart` with an area fill showing probability over time.

### Placement

First panel in the forecast detail main column, directly below the hero banner and above the Rationale panel. Panel header: `"Probability History"` with revision count subtitle (`"{N} revisions"`). Top-right of the panel header shows the current probability and direction badge (e.g. `↓ 2pp` from the second-to-last history entry).

### Chart Spec

- **X-axis:** Dates from `history[].date`, formatted as `MMM 'YY` (e.g. `Oct '25`). Ticks shown at each revision point.
- **Y-axis:** Percentage 0–100. Dynamic range: padded 10 percentage points above the max observed value and below the min observed value, so the line fills the chart space. Min floor is 0, max ceiling is 100.
- **Line:** Blue (`#3b82f6`), 2px stroke, rounded joins. Each revision is a dot (`r=4`, fill `#60a5fa`, stroke `#0d1929`).
- **Area fill:** Blue gradient from `rgba(59,130,246,0.2)` at the line to `rgba(59,130,246,0)` at the bottom.
- **Grid:** Horizontal dashed lines only (`stroke="#1e3a5f"`, `strokeDasharray="3 3"`). No vertical grid lines.
- **Tooltip:** On hover, shows: probability (`{N}%`), confidence level (colored), and `changeReason` truncated to 80 characters with ellipsis.
- **Tooltip style:** Dark background (`#0d1929`), border `#1e3a5f`, monospace probability number.

### Y-axis range calculation

```ts
const minVal = Math.max(0, Math.min(...history.map(h => h.probability)) - 10)
const maxVal = Math.min(100, Math.max(...history.map(h => h.probability)) + 10)
```

### No-data state

If `history.length < 2`, render a dim placeholder: `"Not enough history to chart"`.

---

## 2. Forecast Creation Wizard

### Route

`app/forecasts/new/page.tsx` — server component wrapper, renders `<ForecastWizard />`.

### State Type

```ts
interface ForecastDraft {
  // Step 1
  title: string
  question: string
  targetDate: string
  timeHorizon: string
  region: string
  countries: string[]

  // Step 2
  probability: number
  confidenceLevel: ConfidenceLevel
  rationale: string
  confidenceNotes: string

  // Step 3
  resolutionCriteria: string
  uncertaintyNotes: string

  // Step 4
  evidence: DraftEvidence[]
  tags: string[]
}

interface DraftEvidence {
  id: string  // generated client-side: crypto.randomUUID()
  title: string
  description: string
  direction: 'supporting' | 'opposing' | 'neutral'
  weight: 'strong' | 'moderate' | 'weak'
}
```

Initial draft: all strings empty, `probability: 50`, `confidenceLevel: 'medium'`, `countries: []`, `evidence: []`, `tags: []`.

### Layout

Two-column: left sidebar (200px fixed) + main form area (flex-1). Max width `1000px`, centered.

**Sidebar:**
- "NEW FORECAST" label at top (small caps, dim)
- Four step rows. Each row: step number circle + step name. Active step: blue left border accent, blue number circle, white label. Completed step: green checkmark icon replacing number, dim label. Pending step: dim border circle, dim label.
- Bottom of sidebar: `"Step {N} of 4"` dim text.

**Main form area:**
- Step title (`h2`) + brief description subtitle
- Form fields for the current step
- Back / Next (or "Create Forecast") buttons at the bottom right. Back is secondary (ghost), Next is primary (blue filled).

### Step 1 — Question

Fields:
- **Title** — text input, required. Placeholder: `"e.g. Russia-Ukraine ceasefire before Q3 2026"`
- **Formal question** — textarea (4 rows), required. Placeholder: `"Will...before [date]?"` — frame as a binary yes/no question.
- **Target date** — date input, required.
- **Time horizon** — text input, required. Placeholder: `"e.g. Q2 2026"` — free text label.
- **Region** — single select from `mockRegions` (display name, value = region id), required.
- **Countries** — multi-select checkboxes from `mockCountries`, optional. Flat scrollable list (max-height ~160px) with a text filter input above it. Filtering is client-side against country name.

Validation on Next: title, question, targetDate, timeHorizon, region must be non-empty.

### Step 2 — Probability

Fields:
- **Probability** — range slider 0–100. Large live display of the current value (`{N}%`) in blue monospace above the slider, colored by `scoreToRiskLevel` thresholds. Below the slider: dim label `"0% — impossible · 50% — uncertain · 100% — certain"`.
- **Confidence level** — three-button toggle: LOW (red) / MEDIUM (amber) / HIGH (green). Required.
- **Rationale** — textarea (6 rows), required. Placeholder: `"Why was this probability assessed?"`.
- **Confidence notes** — textarea (3 rows), optional. Placeholder: `"What limits your confidence?"`.

Validation on Next: rationale must be non-empty.

### Step 3 — Criteria

Fields:
- **Resolution criteria** — textarea (6 rows), required. Placeholder: `"Resolves YES if: ..."`. Label note: `"Be precise. Ambiguous criteria make forecasts impossible to resolve."`.
- **Uncertainty notes** — textarea (4 rows), required. Placeholder: `"What could change this probability significantly?"`.

Validation on Next: both fields non-empty.

### Step 4 — Evidence & Tags

**Evidence section:**
- List of added evidence items, each showing title, direction badge, weight badge, and a remove (×) button.
- "Add evidence" form (always visible below the list): title input, description textarea (2 rows), direction toggle (Supporting / Opposing / Neutral), weight toggle (Strong / Moderate / Weak), "Add" button. Clicking Add appends to the list and clears the mini-form. Evidence is optional.

**Tags section:**
- Free-text tag input: type a tag and press Enter or comma to add. Each tag renders as a chip with an × to remove. Tags are optional.

**Submit button:** "Create Forecast" (primary blue, full width at bottom).

### On Submit

Show a full-page success state (replaces the form):
- Large checkmark icon
- `"Forecast created"` heading
- The forecast title in dim text below
- Two buttons: `"View all forecasts"` → `/forecasts` and `"Create another"` → resets the form

No actual persistence — mock data is read-only until Stage 7. The success state makes the workflow feel complete.

### "New Forecast" entry point

Add a `"+ New Forecast"` button to the top-right of the `ForecastsView` header row (alongside the `h1`). Links to `/forecasts/new`.

---

## 3. Resolution Modal

### Component: `ResolveModal`

```tsx
interface ResolveModalProps {
  forecast: Forecast
  isOpen: boolean
  onClose: () => void
  onResolve: (outcome: ResolveOutcome) => void
}

interface ResolveOutcome {
  result: 'yes' | 'no'
  resolutionDate: string
  analystNote: string
  sourceUrl?: string
}
```

### Trigger

A `"Resolve"` button appears in the forecast detail hero, visible only when `forecast.status === 'active'`. Styled as a secondary outlined button (blue border, blue text). Positioned at the end of the status/badges row.

### Modal Layout

Uses `Modal` shell component. Width: `max-w-lg`. Title: `"Resolve Forecast"`.

**Fields:**
1. **Outcome** — Large YES / NO two-button toggle. YES: green background when selected. NO: red background when selected. Required.
2. **Resolution date** — date input, defaults to today's date (`new Date().toISOString().slice(0, 10)`). Required.
3. **Final analyst note** — textarea (4 rows), required. Placeholder: `"Describe the outcome and how the resolution criteria were satisfied."`.
4. **Resolution source** — text input, optional. Placeholder: `"URL to primary source (optional)"`.

**Buttons:** Cancel (ghost) + "Confirm Resolution" (primary, disabled until outcome and note are filled).

### On Confirm

Updates local React state in the forecast detail page:
- `status` → `'resolved'`
- Appends a new `ForecastHistoryEntry` to `history`: `{ date: resolutionDate, probability: forecast.probability, confidenceLevel: forecast.confidenceLevel, changeReason: analystNote }`
- Closes the modal
- The Resolve button disappears (status is no longer `active`)
- A brief success toast: `"Forecast resolved as {YES/NO}"`

### `Modal` Shell Component

```tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg'
}
```

Renders: fixed backdrop (`bg-black/60 backdrop-blur-sm`), centered card (`bg-[var(--color-bg-surface)]`, rounded-xl, border). Closes on backdrop click or Escape key. Traps focus.

---

## Out of Scope for Stage 6

- Actual data persistence (backend wiring deferred to Stage 7)
- Forecast editing (edit existing forecast fields) — deferred
- Forecast duplication/clone workflow — deferred
- Evidence source linking from the creation wizard to the event/source index — deferred
- Probability history chart tooltips with full revision text — deferred (truncation is sufficient)
