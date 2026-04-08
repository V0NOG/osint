# Stage 5: Detail Pages — Design Spec
**Date:** 2026-04-08
**Phase:** 5 of 9 (CLAUDE.md build order)
**Status:** Approved

---

## Overview

Stage 5 builds out the five detail/profile pages that currently exist as placeholders:

1. **Country profile** — `/countries/[slug]`
2. **Event detail** — `/events/[id]`
3. **Region list** — `/regions`
4. **Region detail** — `/regions/[slug]` (new route)
5. **Forecast detail** — `/forecasts/[id]`

All pages share a `DetailLayout` shell component (breadcrumb + two-column grid). Each page has a custom hero section and main content panels suited to its data type. All data comes from the existing mock data layer — no new mock data is introduced.

---

## Architecture

### New Files

| Path | Purpose |
|---|---|
| `components/layout/DetailLayout.tsx` | Shared shell: breadcrumb nav + two-column grid (main + sidebar) |
| `components/country/CountryHero.tsx` | Hero section for country profile (risk score, summary, category bars) |
| `components/country/RiskCategoryBars.tsx` | Five risk category bars with gradient fill colored by score |
| `components/country/KeyActorsList.tsx` | Actor cards with initials avatar, role, risk contribution badge |
| `components/event/EventHero.tsx` | Hero for event detail (title, severity, type, date, location) |
| `components/event/SourcesList.tsx` | Source citations with reliability badges and external links |
| `components/region/RegionCard.tsx` | Card for region list: name, risk, key tensions, counts |
| `components/forecast/ForecastHero.tsx` | Inline probability row: % + bar + confidence + revision |
| `components/forecast/EvidencePanel.tsx` | Evidence list with supporting/opposing color coding and weight labels |

### Modified Files

| Path | Change |
|---|---|
| `app/countries/[slug]/page.tsx` | Full country profile implementation |
| `app/events/[id]/page.tsx` | Full event detail implementation |
| `app/regions/page.tsx` | Region list grid using RegionCard |
| `app/forecasts/[id]/page.tsx` | Full forecast detail implementation |

### New Routes

| Path | File |
|---|---|
| `/regions/[slug]` | `app/regions/[slug]/page.tsx` |

---

## 1. Shared Infrastructure

### `DetailLayout`

Reusable shell used by all five detail pages.

```tsx
interface DetailLayoutProps {
  breadcrumbs: { label: string; href?: string }[]
  children: React.ReactNode
  sidebar: React.ReactNode
}
```

Renders:
- Breadcrumb row: each item linked except the last (current page). Separator `·` between items.
- Two-column grid: `grid-cols-[1fr_280px]` gap-6. Main content on left, sidebar on right.
- On mobile (< md): single column, sidebar stacks below main.

### Breadcrumb examples

- Country: `Countries → Russia`
- Event: `Events → Russia launches largest drone barrage...`
- Region: `Regions → Eastern Europe`
- Forecast: `Forecasts → Russia-Ukraine ceasefire before Q3 2026`

---

## 2. Country Profile (`/countries/[slug]`)

Looks up country from `mockCountries` by `slug`. 404 if not found (`notFound()`).

### CountryHero

Full-width banner with left/right split:

**Left side:**
- ISO2 badge (monospace, dim border)
- Country name (large, bold)
- Risk level badge (e.g. `CRITICAL` in red)
- Region · Capital · Population (dim secondary line)
- Summary text (truncated to 3 lines on hero, full text in main column Assessment panel)

**Right side:**
- Risk score: large monospace number colored by risk level
- `RISK SCORE` label beneath
- Alert count + active forecast count (dim, below score)

**Below the split — RiskCategoryBars:**
- Five bars: Political, Military, Economic, Social, Environmental
- Laid out in a 2-column grid (5th bar spans or sits alone)
- Each bar: label left, score right (monospace, colored), gradient progress bar
- Bar color determined by score: ≥80 red, ≥65 orange, ≥50 amber, ≥35 yellow, else green

### Main column

1. **Assessment panel** — full summary text
2. **Key Actors panel** — `KeyActorsList`: join `country.keyActors[]` (array of actor ids) against `mockActors` to resolve name, role, and riskContribution. Each actor shows initials avatar (blue tinted), name, role, risk contribution badge. Links to `/actors/[id]` (placeholder route — link rendered but page not built in Stage 5)
3. **Recent Events panel** — events from `mockEvents` where `countries` includes this country's id. Shows up to 5. Each item: colored left border by severity, title, date + severity + type. Links to `/events/[id]`

### Sidebar

1. **Active Forecasts panel** — forecasts from `mockForecasts` where `countries` includes this country's id. Each item: title, time horizon, probability (monospace blue). Links to `/forecasts/[id]`
2. **Quick Stats panel** — Region (linked to `/regions/[slug]`), Capital, Population (formatted), Last Updated

---

## 3. Event Detail (`/events/[id]`)

Looks up event from `mockEvents` by `id`. 404 if not found.

### EventHero

Full-width banner:
- Severity badge + event type badge + date (top row)
- Title (large, bold)
- Location description (dim, with a pin-style prefix or just italic)

### Main column

1. **Summary panel** — full summary text
2. **Impact Assessment panel** — `impactAssessment` field. Label: `IMPACT ASSESSMENT`. Style: slightly highlighted background, like an analyst callout box.
3. **Sources panel** — `SourcesList`: each source shows title (linked, opens in new tab), reliability badge (`HIGH` green / `MEDIUM` amber / `LOW` red), published date. Sources sorted: high reliability first.

### Sidebar

1. **Countries Involved** — list of country names linked to `/countries/[slug]`, with risk level badge beside each
2. **Actors Involved** — list of actor names (plain text for now, no actor detail page in Stage 5)
3. **Related Forecasts** — forecasts from `mockForecasts` where `id` appears in event's `relatedForecasts`. Shows title + probability. Links to `/forecasts/[id]`
4. **Tags** — tag chips (non-interactive, styled as small rounded badges)

---

## 4. Region List (`/regions`)

Replaces the placeholder. Renders a grid of `RegionCard` components from `mockRegions`.

### RegionCard

```tsx
interface RegionCardProps {
  region: Region
}
```

Displays:
- Region name (bold) + risk level badge
- Risk score (large monospace, right-aligned)
- Key tensions: up to 3 bullet points from `keyTensions[]`
- Footer row: `N countries · N events · N forecasts` (dim)
- Full card is a link to `/regions/[slug]`

Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with gap-4.

---

## 5. Region Detail (`/regions/[slug]`)

New route. Looks up region from `mockRegions` by `slug`. 404 if not found.

### Hero

Full-width banner:
- Region name (large, bold)
- Risk level badge + risk score (large monospace, right)
- Key tensions: displayed as a bulleted list directly in the hero (all of them)

### Main column

1. **Overview panel** — `summary` field
2. **Member Countries panel** — country cards for each country id in `region.countries`. Each card: ISO2 badge, country name, risk level badge, risk score, alert count. Links to `/countries/[slug]`. Laid out as a 2-column sub-grid.

### Sidebar

1. **At a Glance** — Active Events (`activeEventCount`), Active Forecasts (`activeForecastCount`), Last Updated
2. **Active Forecasts** — forecasts from `mockForecasts` where `region` matches this region's id. Title + probability. Links to `/forecasts/[id]`

---

## 6. Forecast Detail (`/forecasts/[id]`)

Looks up forecast from `mockForecasts` by `id`. 404 if not found.

### ForecastHero

Full-width banner:
- Status badge (`ACTIVE` green / `RESOLVED` dim / `EXPIRED` dim) + time horizon badge + confidence level (dim text)
- Title (large, bold)
- Question text (italic, slightly dim — this is the formal question string)
- **Inline probability row** (below question):
  - Probability % — large monospace blue
  - Progress bar — fills to probability %, blue gradient
  - Confidence level — colored: `LOW` red, `MEDIUM` amber, `HIGH` green
  - Revision number — `v{versionNumber}` dim

### Main column

1. **Rationale panel** — `rationale` field
2. **Uncertainty Notes panel** — `uncertaintyNotes` field. Label: `UNCERTAINTY`. Slightly amber-tinted background to signal caution.
3. **Resolution Criteria panel** — `resolutionCriteria` field. Monospace-style presentation, like a legal clause. Label: `RESOLUTION CRITERIA`.
4. **Evidence panel** — `EvidencePanel`: list of evidence items. Supporting items have green left border + green dot, opposing have red left border + red dot. Each item: title, description, weight badge (`STRONG` / `MODERATE`), date added.

### Sidebar

1. **Countries** — country names linked to profiles, with risk badge
2. **Related Events** — events from `mockEvents` where `id` appears in `forecast.relatedEvents`. Title + date. Links to `/events/[id]`
3. **Probability History** — text-based version history: each entry in `history[]` shows date, probability, and `changeReason` (truncated to 1 line). Newest first. No chart — chart deferred to Stage 6.
4. **Tags** — tag chips

---

## Out of Scope for Stage 5

- Actor detail pages (`/actors/[id]`) — links rendered but pages not built
- Probability history chart — deferred to Stage 6 (forecasting workflows)
- Watchlist add/remove functionality on detail pages
- Search/filter within detail page related items
- Real data ingestion
