# Stage 5: Detail Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the five detail/profile pages — country, event, region list, region detail, and forecast — by creating the missing region detail route and refining existing pages to match the approved design.

**Architecture:** All pages are Next.js server components using mock data. The existing country, event, and forecast pages are substantially implemented; the primary new work is the region detail page (`/regions/[slug]`). Country and forecast pages need layout refinements to match the approved brainstorm design. No new shared components are needed — `Panel`, `Badge`, `Card`, and `Link` from the existing design system cover all patterns.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide icons, existing design tokens (`var(--color-*)`)

---

## File Map

| File | Status | Work |
|---|---|---|
| `app/regions/[slug]/page.tsx` | Create | Full region detail page — new route |
| `app/regions/page.tsx` | Modify | Wrap region cards in `<Link>` to `/regions/[slug]` |
| `app/countries/[slug]/page.tsx` | Modify | Move risk bars into hero; swap key actors → main col, active forecasts → sidebar; replace "What Changed" with Quick Stats |
| `app/forecasts/[id]/page.tsx` | Modify | Replace "big number left / question right" layout with inline probability row under title+question |

---

### Task 1: Region detail page

**Files:**
- Create: `app/regions/[slug]/page.tsx`

- [ ] **Step 1: Type-check baseline**

```bash
cd /Users/connor/Documents/osint && npx tsc --noEmit 2>&1 | head -20
```

Expected: no output (clean).

- [ ] **Step 2: Create the region detail page**

Create `app/regions/[slug]/page.tsx` with the full implementation:

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Activity, Clock, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Panel } from '@/components/ui/Panel'
import { ForecastCard } from '@/components/forecast/ForecastCard'
import { mockRegions } from '@/lib/mock-data/regions'
import { mockCountries } from '@/lib/mock-data/countries'
import { mockForecasts } from '@/lib/mock-data/forecasts'
import { formatDate } from '@/lib/utils/format'
import { getRiskColor, getRiskTextClass } from '@/lib/utils/risk'

interface PageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  return mockRegions.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const region = mockRegions.find((r) => r.slug === params.slug)
  return { title: region?.name ?? 'Region' }
}

export default function RegionDetailPage({ params }: PageProps) {
  const region = mockRegions.find((r) => r.slug === params.slug)
  if (!region) notFound()

  const memberCountries = region.countries
    .map((id) => mockCountries.find((c) => c.id === id))
    .filter(Boolean)

  const activeForecasts = mockForecasts.filter((f) => f.region === region.id)

  const riskColor = getRiskColor(region.riskLevel)

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      {/* Back nav */}
      <Link
        href="/regions"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] mb-5 transition-colors duration-150"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Regions
      </Link>

      {/* Hero */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-5 relative overflow-hidden">
        {/* Background accent */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
          style={{ backgroundColor: riskColor }}
        />

        <div className="relative flex items-start justify-between gap-6 mb-5">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-[var(--color-text-tertiary)] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1.5">
                {region.name}
              </h1>
              <Badge variant={`risk-${region.riskLevel}`} size="md">
                {region.riskLevel} risk
              </Badge>
            </div>
          </div>

          {/* Risk score */}
          <div className="text-right flex-shrink-0">
            <div
              className="text-4xl font-bold font-mono tabular-nums leading-none"
              style={{ color: riskColor }}
            >
              {region.overallRiskScore}
            </div>
            <div className="text-[11px] text-[var(--color-text-tertiary)] font-medium uppercase tracking-wider mt-1">
              Risk Score
            </div>
          </div>
        </div>

        {/* Key tensions */}
        {region.keyTensions.length > 0 && (
          <div className="relative">
            <h3 className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
              Key Tensions
            </h3>
            <ul className="space-y-1.5">
              {region.keyTensions.map((tension, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: riskColor, opacity: 0.7 }}
                  />
                  <span className="text-sm text-[var(--color-text-secondary)]">{tension}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Main column */}
        <div className="space-y-5">
          {/* Overview */}
          <Panel title="Overview">
            <div className="px-5 py-4">
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {region.summary}
              </p>
            </div>
          </Panel>

          {/* Member countries */}
          <section>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
              Member Countries
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {memberCountries.map((country) => country && (
                <Link
                  key={country.id}
                  href={`/countries/${country.slug}`}
                  className="flex items-center justify-between gap-3 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-3.5 hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-strong)] transition-all duration-150 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-6 rounded-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] font-mono">
                        {country.iso2}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-text-primary)] truncate">
                        {country.name}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-tertiary)]">
                        {country.alertCount} alerts · {country.activeForecastCount} forecasts
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span
                      className="text-lg font-bold font-mono tabular-nums leading-none"
                      style={{ color: getRiskColor(country.riskLevel) }}
                    >
                      {country.overallRiskScore}
                    </span>
                    <Badge variant={`risk-${country.riskLevel}`} size="sm">
                      {country.riskLevel}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* At a glance */}
          <Panel title="At a Glance">
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Countries</span>
                <span className="text-xs font-mono font-semibold text-[var(--color-text-secondary)]">
                  {region.countries.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
                  <AlertTriangle className="w-3 h-3" strokeWidth={1.5} />
                  <span className="text-xs">Active Events</span>
                </div>
                <span className="text-xs font-mono font-semibold text-[var(--color-text-secondary)]">
                  {region.activeEventCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
                  <Activity className="w-3 h-3" strokeWidth={1.5} />
                  <span className="text-xs">Active Forecasts</span>
                </div>
                <span className="text-xs font-mono font-semibold text-[var(--color-text-secondary)]">
                  {region.activeForecastCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
                  <Clock className="w-3 h-3" strokeWidth={1.5} />
                  <span className="text-xs">Updated</span>
                </div>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                  {formatDate(region.lastUpdated)}
                </span>
              </div>
            </div>
          </Panel>

          {/* Active forecasts */}
          {activeForecasts.length > 0 && (
            <Panel
              title="Active Forecasts"
              subtitle={`${activeForecasts.length} forecast${activeForecasts.length !== 1 ? 's' : ''}`}
            >
              <div className="divide-y divide-[var(--color-border)]">
                {activeForecasts.map((forecast) => (
                  <Link
                    key={forecast.id}
                    href={`/forecasts/${forecast.id}`}
                    className="flex items-start justify-between gap-3 px-5 py-3.5 hover:bg-[var(--color-bg-elevated)] transition-colors duration-150 group"
                  >
                    <p className="text-xs font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors leading-snug line-clamp-2 flex-1">
                      {forecast.title}
                    </p>
                    <span className={`text-sm font-bold font-mono tabular-nums flex-shrink-0 ${getRiskTextClass(forecast.confidenceLevel === 'high' ? 'low' : forecast.confidenceLevel === 'medium' ? 'moderate' : 'high')}`}>
                      {forecast.probability}%
                    </span>
                  </Link>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Type-check**

```bash
cd /Users/connor/Documents/osint && npx tsc --noEmit 2>&1 | head -30
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
cd /Users/connor/Documents/osint && git add app/regions/\[slug\]/page.tsx && git commit -m "feat: add region detail page (/regions/[slug])"
```

---

### Task 2: Link region list cards to detail pages

**Files:**
- Modify: `app/regions/page.tsx`

The region list currently renders each region as a plain `<div>`. Wrap each region card in a `<Link>` so users can navigate to the region detail page.

- [ ] **Step 1: Update regions page**

In `app/regions/page.tsx`, replace the outer `<div>` wrapping each region card with a `<Link>`. The `Link` import is already present. Change line 34 from:

```tsx
            <div
              key={region.id}
              className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)] transition-all duration-150"
            >
```

to:

```tsx
            <Link
              key={region.id}
              href={`/regions/${region.slug}`}
              className="block bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)] transition-all duration-150"
            >
```

And replace the closing `</div>` at line 122 with `</Link>`.

- [ ] **Step 2: Type-check**

```bash
cd /Users/connor/Documents/osint && npx tsc --noEmit 2>&1 | head -20
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /Users/connor/Documents/osint && git add app/regions/page.tsx && git commit -m "feat: link region cards to region detail pages"
```

---

### Task 3: Refine country profile layout

**Files:**
- Modify: `app/countries/[slug]/page.tsx`

Three changes to match the approved design:
1. Move risk category bars into the hero banner (remove the standalone "Risk Breakdown" section)
2. Move Key Actors from the right sidebar to the left main column
3. Replace the right sidebar "What Changed" panel (hardcoded fake data) with a "Quick Stats" panel (region, capital, population, last updated)

- [ ] **Step 1: Move risk bars into hero and restructure columns**

Replace the entire file content of `app/countries/[slug]/page.tsx` with:

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Activity, MapPin, Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { EventCard } from '@/components/event/EventCard'
import { ForecastCard } from '@/components/forecast/ForecastCard'
import { Panel } from '@/components/ui/Panel'
import { mockCountries } from '@/lib/mock-data/countries'
import { mockEvents } from '@/lib/mock-data/events'
import { mockForecasts } from '@/lib/mock-data/forecasts'
import { mockActors } from '@/lib/mock-data/actors'
import { formatDate, formatNumber } from '@/lib/utils/format'
import { getRiskColor } from '@/lib/utils/risk'

interface PageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  return mockCountries.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const country = mockCountries.find((c) => c.slug === params.slug)
  return { title: country?.name ?? 'Country' }
}

const categoryLabels: Record<string, string> = {
  political: 'Political',
  military: 'Military',
  economic: 'Economic',
  social: 'Social',
  environmental: 'Environmental',
}

function RiskBreakdownBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 80 ? '#ef4444'
    : score >= 65 ? '#f97316'
    : score >= 50 ? '#f59e0b'
    : score >= 35 ? '#eab308'
    : '#22c55e'

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[var(--color-text-tertiary)] w-24 flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, backgroundColor: color, opacity: 0.85 }}
        />
      </div>
      <span
        className="text-xs font-bold font-mono tabular-nums w-8 text-right flex-shrink-0"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  )
}

export default function CountryDetailPage({ params }: PageProps) {
  const country = mockCountries.find((c) => c.slug === params.slug)
  if (!country) notFound()

  const relatedEvents = mockEvents
    .filter((e) => e.countries.includes(country.id))
    .slice(0, 4)

  const relatedForecasts = mockForecasts
    .filter((f) => f.countries.includes(country.id))
    .slice(0, 3)

  const keyActors = mockActors.filter((a) => country.keyActors.includes(a.id))

  const riskColor = getRiskColor(country.riskLevel)

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Back nav */}
      <Link
        href="/countries"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] mb-5 transition-colors duration-150"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Countries
      </Link>

      {/* Hero — includes name, score, summary, and risk category bars */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-5 relative overflow-hidden">
        {/* Background accent */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
          style={{ backgroundColor: riskColor }}
        />

        {/* Name row */}
        <div className="relative flex items-start justify-between gap-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-10 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-[var(--color-text-secondary)] font-mono">
                {country.iso2}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">
                {country.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
                  <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="text-xs">{country.capital}</span>
                </div>
                <span className="text-[var(--color-text-tertiary)] text-xs">·</span>
                <Badge variant={`risk-${country.riskLevel}`}>
                  {country.riskLevel} risk
                </Badge>
              </div>
            </div>
          </div>

          {/* Overall score */}
          <div className="text-right flex-shrink-0">
            <div
              className="text-4xl font-bold font-mono tabular-nums leading-none"
              style={{ color: riskColor }}
            >
              {country.overallRiskScore}
            </div>
            <div className="text-[11px] text-[var(--color-text-tertiary)] font-medium uppercase tracking-wider mt-1">
              Risk Score
            </div>
            <div className="flex items-center gap-3 mt-2 justify-end">
              <div className="flex items-center gap-1 text-[var(--color-text-tertiary)]">
                <AlertTriangle className="w-3 h-3" strokeWidth={1.5} />
                <span className="text-xs">{country.alertCount} alerts</span>
              </div>
              <div className="flex items-center gap-1 text-[var(--color-text-tertiary)]">
                <Activity className="w-3 h-3" strokeWidth={1.5} />
                <span className="text-xs">{country.activeForecastCount} forecasts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed relative mb-4">
          {country.summary}
        </p>

        {/* Risk category bars — inside the hero */}
        <div className="relative border-t border-[var(--color-border)] pt-4 space-y-2.5">
          {Object.entries(country.riskCategories).map(([key, score]) => (
            <RiskBreakdownBar
              key={key}
              label={categoryLabels[key] ?? key}
              score={score}
            />
          ))}
        </div>

        {/* Last updated */}
        <div className="flex items-center gap-1.5 mt-4 text-[var(--color-text-tertiary)] relative">
          <Clock className="w-3 h-3" strokeWidth={1.5} />
          <span className="text-[11px]">Updated {formatDate(country.lastUpdated)}</span>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Left column: events + key actors */}
        <div className="space-y-5">
          {/* Recent events */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Recent Events
              </h2>
              <Link
                href="/events"
                className="text-[11px] text-[var(--color-accent-blue)] hover:text-blue-300 font-medium transition-colors"
              >
                View all →
              </Link>
            </div>
            {relatedEvents.length > 0 ? (
              <div className="space-y-2.5">
                {relatedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-6 text-center">
                <p className="text-sm text-[var(--color-text-tertiary)]">No recent events found</p>
              </div>
            )}
          </section>

          {/* Key actors */}
          <Panel
            title="Key Actors"
            subtitle={`${keyActors.length} identified actor${keyActors.length !== 1 ? 's' : ''}`}
          >
            <div className="divide-y divide-[var(--color-border)]">
              {keyActors.length > 0 ? (
                keyActors.map((actor) => (
                  <div key={actor.id} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                        {actor.name}
                      </span>
                      <Badge
                        variant={
                          actor.riskContribution === 'high'
                            ? 'risk-high'
                            : actor.riskContribution === 'medium'
                            ? 'risk-moderate'
                            : 'risk-low'
                        }
                        size="sm"
                      >
                        {actor.riskContribution}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-tertiary)] mb-1.5 font-medium">
                      {actor.role}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed line-clamp-2">
                      {actor.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="px-5 py-4 text-xs text-[var(--color-text-tertiary)]">
                  No actors catalogued
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* Right column: active forecasts + quick stats */}
        <div className="space-y-4">
          {/* Active forecasts */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Active Forecasts
              </h2>
              <Link
                href="/forecasts"
                className="text-[11px] text-[var(--color-accent-blue)] hover:text-blue-300 font-medium transition-colors"
              >
                View all →
              </Link>
            </div>
            {relatedForecasts.length > 0 ? (
              <div className="space-y-2.5">
                {relatedForecasts.map((forecast) => (
                  <ForecastCard key={forecast.id} forecast={forecast} variant="compact" />
                ))}
              </div>
            ) : (
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-5 text-center">
                <p className="text-sm text-[var(--color-text-tertiary)]">No active forecasts</p>
              </div>
            )}
          </section>

          {/* Quick stats */}
          <Panel title="Quick Stats">
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Region</span>
                <Link
                  href={`/regions/${country.region}`}
                  className="text-xs font-medium text-[var(--color-accent-blue)] hover:text-blue-300 transition-colors"
                >
                  {country.region.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Capital</span>
                <span className="text-xs text-[var(--color-text-secondary)]">{country.capital}</span>
              </div>
              {country.population && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-tertiary)]">Population</span>
                  <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                    {formatNumber(country.population)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">ISO</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">{country.iso3}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-tertiary)]">Updated</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                  {formatDate(country.lastUpdated)}
                </span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/connor/Documents/osint && npx tsc --noEmit 2>&1 | head -30
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /Users/connor/Documents/osint && git add app/countries/\[slug\]/page.tsx && git commit -m "feat: refine country profile — risk bars in hero, key actors in main column, quick stats sidebar"
```

---

### Task 4: Update forecast detail to inline probability row

**Files:**
- Modify: `app/forecasts/[id]/page.tsx`

The current forecast header shows a large probability number to the left with the question to the right (layout A). Replace this with the approved design B: title + question text first, then an inline row showing probability % + bar + confidence level + revision number.

- [ ] **Step 1: Replace the forecast header section**

In `app/forecasts/[id]/page.tsx`, replace the forecast header block (lines 109–176) — the `<div className="bg-[var(--color-bg-surface)]...">` containing the status row, big probability, question, and confidence — with:

```tsx
          {/* Forecast header */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6">
            {/* Status + meta row */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <Badge variant={`status-${forecast.status}`} size="md">{forecast.status}</Badge>
              <span className="text-[var(--color-text-tertiary)] text-xs">·</span>
              <span className="text-xs text-[var(--color-text-tertiary)]">{forecast.timeHorizon}</span>
              <span className="text-[var(--color-text-tertiary)] text-xs">·</span>
              <span className="text-xs text-[var(--color-text-tertiary)]">v{forecast.versionNumber}</span>
            </div>

            {/* Title */}
            <h1 className="text-lg font-bold text-[var(--color-text-primary)] leading-snug mb-2">
              {forecast.title}
            </h1>

            {/* Question */}
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed italic mb-4">
              &ldquo;{forecast.question}&rdquo;
            </p>

            {/* Inline probability row */}
            <div className="flex items-center gap-4 p-3.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
              <div className="flex-shrink-0">
                <span className={`text-2xl font-bold font-mono tabular-nums leading-none ${probColor}`}>
                  {forecast.probability}%
                </span>
              </div>
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${forecast.probability}%`,
                    backgroundColor:
                      forecast.probability >= 70 ? '#ef4444'
                      : forecast.probability >= 50 ? '#f97316'
                      : forecast.probability >= 30 ? '#f59e0b'
                      : '#22c55e',
                    opacity: 0.8,
                  }}
                />
              </div>
              <div
                className={cn(
                  'flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border',
                  confidenceColors[forecast.confidenceLevel]
                )}
              >
                {forecast.confidenceLevel} conf.
              </div>
              <div className="flex-shrink-0 text-xs font-mono text-[var(--color-text-tertiary)]">
                v{forecast.versionNumber}
              </div>
            </div>
          </div>
```

Also remove the unused `ProbabilityBar` component function (lines 27–45) and the `Calendar` import since it's no longer used in the header. Keep the remaining imports and panels unchanged.

- [ ] **Step 2: Remove ProbabilityBar function and unused Calendar import**

Remove lines 3–45 (the `Calendar` import line and the `ProbabilityBar` function) and replace with just the remaining imports. The file starts at line 1 with:

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronUp, ChevronDown, BookOpen, Scale, AlertCircle, History, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Panel } from '@/components/ui/Panel'
import { EventCard } from '@/components/event/EventCard'
import { mockForecasts } from '@/lib/mock-data/forecasts'
import { mockEvents } from '@/lib/mock-data/events'
import { mockCountries } from '@/lib/mock-data/countries'
import { formatDate } from '@/lib/utils/format'
import { getProbabilityColor } from '@/lib/utils/risk'
import { cn } from '@/lib/utils/cn'
```

- [ ] **Step 3: Type-check**

```bash
cd /Users/connor/Documents/osint && npx tsc --noEmit 2>&1 | head -30
```

Expected: no output. If there are import errors for removed icons (BookOpen, History, Globe, AlertCircle), remove those from the import line too.

- [ ] **Step 4: Commit**

```bash
cd /Users/connor/Documents/osint && git add app/forecasts/\[id\]/page.tsx && git commit -m "feat: update forecast detail to inline probability row design"
```

---

## Self-Review Checklist

After all tasks:

```bash
cd /Users/connor/Documents/osint && npx tsc --noEmit && echo "✓ Clean"
```

Verify manually:
- [ ] `/regions` page — region cards link to `/regions/[slug]`
- [ ] `/regions/eastern-europe` — renders hero, key tensions, member countries, sidebar
- [ ] `/countries/russia` — risk bars inside hero, key actors in left column, quick stats + forecasts in sidebar
- [ ] `/forecasts/fc-001` — inline probability row below title+question
- [ ] `/events/evt-001` — unchanged, still renders correctly
