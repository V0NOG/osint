# Stage 4: 3D Globe / World Overview — Design Spec
**Date:** 2026-04-08
**Phase:** 4 of 9 (CLAUDE.md build order)
**Status:** Approved

---

## Overview

Stage 4 upgrades the 3D globe from a dot-marker sphere into a geographically readable risk map. The globe currently shows a dark sphere with colored dot markers at country centroids — useful but hard to orient without geographic reference. Stage 4 adds:

1. **Country boundary rendering** — GeoJSON polygons rendered as fill meshes + border lines on the sphere surface, colored by risk level
2. **Event arcs** — animated dashed curves connecting countries involved in active geopolitical tensions, wired to mock arc data
3. **Minor world page fix** — replace hardcoded date with live date

The globe remains the same Three.js + React Three Fiber stack. No new 3D libraries are introduced beyond `world-atlas` and `topojson-client` for geo data.

---

## Architecture

### New Files

| Path | Purpose |
|---|---|
| `lib/world-data/geo.ts` | Imports world-atlas topojson, converts to GeoJSON feature array, exports `getCountryFeatures()` |
| `lib/world-data/iso-numeric.ts` | Maps ISO 3166-1 numeric codes → ISO3 alpha codes for matching GeoJSON features to mock countries |
| `components/world/Globe/GlobeCountries.tsx` | Renders fill mesh + border lines per country from GeoJSON features |
| `lib/mock-data/arcs.ts` | 6–8 hand-crafted `GlobeArc` objects representing active geopolitical tensions |

### Modified Files

| Path | Change |
|---|---|
| `components/world/Globe/GlobeCanvas.tsx` | Thread `countryRiskMap` prop through to `GlobeScene` |
| `components/world/Globe/GlobeScene.tsx` | Add `countryRiskMap` prop, render `<GlobeCountries>` below markers |
| `components/world/Globe/GlobeArcs.tsx` | Verify arc color is driven by `arc.color` field (fix if needed) |
| `components/world/WorldGlobe.tsx` | Derive `countryRiskMap` from `mockCountries`, import and pass `mockArcs` |
| `app/world/page.tsx` | Replace hardcoded `new Date('2026-04-01')` with `new Date()` |

### New Dependencies

```bash
npm install world-atlas topojson-client
npm install --save-dev @types/topojson-client
```

---

## 1. Geo Data Layer

### `lib/world-data/iso-numeric.ts`

A static lookup object mapping ISO 3166-1 numeric codes (used by world-atlas) to ISO3 alpha-3 codes (used by mock countries):

```ts
export const ISO_NUMERIC_TO_ISO3: Record<number, string> = {
  4: 'AFG', 8: 'ALB', 12: 'DZA', /* ... full list for all ~180 countries ... */
  643: 'RUS', 156: 'CHN', 408: 'PRK', 364: 'IRN',
  356: 'IND', 586: 'PAK', 760: 'SYR', 887: 'YEM',
  50: 'BGD', 104: 'MMR', 706: 'SOM', 729: 'SDN',
  /* ... */
}
```

Only needs entries for the countries present in world-atlas (all sovereign states). Can be generated once and committed as a static file.

### `lib/world-data/geo.ts`

```ts
import type { Topology } from 'topojson-specification'
import { feature } from 'topojson-client'
import type { Feature, Polygon, MultiPolygon, GeoJsonProperties } from 'geojson'

export type CountryFeature = Feature<Polygon | MultiPolygon, GeoJsonProperties & { id: number }>

let cachedFeatures: CountryFeature[] | null = null

// Must only be called on the client — `require()` of a large JSON is fine in
// a 'use client' context but will fail during Next.js SSR. GlobeCountries is
// rendered inside GlobeCanvas which is dynamically imported with ssr:false,
// so this is always client-only.
export function getCountryFeatures(): CountryFeature[] {
  if (cachedFeatures) return cachedFeatures
  // world-atlas/world/110m.json — 110m resolution, ~120KB
  const topology = require('world-atlas/world/110m.json') as Topology
  const collection = feature(topology, topology.objects.countries)
  cachedFeatures = collection.features.map((f) => ({
    ...f,
    properties: { ...f.properties, id: Number(f.id) },
  })) as CountryFeature[]
  return cachedFeatures
}
```

---

## 2. Country Rendering

### `components/world/Globe/GlobeCountries.tsx`

Renders all countries in a single component. For each GeoJSON feature:
- Extracts the polygon ring coordinates
- Converts lat/lon pairs to XYZ on the sphere surface
- Creates a fill `BufferGeometry` via fan triangulation from centroid
- Creates border `LineSegments` from the ring vertices

**Rendering order:** `GlobeCountries` is placed in `GlobeScene` just above `GlobeSphere` and below `GlobeMarkers`, so markers always render on top.

#### Surface offset

Country geometry sits at `GLOBE_RADIUS + 0.001` (fills) and `GLOBE_RADIUS + 0.002` (borders) to avoid z-fighting with the sphere.

#### Risk color mapping

```ts
export type CountryRiskMap = Record<string, RiskLevel> // iso3 → riskLevel

const FILL_COLORS: Record<RiskLevel, { color: string; opacity: number }> = {
  critical:  { color: '#ef4444', opacity: 0.18 },
  high:      { color: '#f97316', opacity: 0.15 },
  elevated:  { color: '#f59e0b', opacity: 0.13 },
  moderate:  { color: '#eab308', opacity: 0.11 },
  low:       { color: '#22c55e', opacity: 0.08 },
  minimal:   { color: '#22c55e', opacity: 0.06 },
}

// Untracked countries (no entry in countryRiskMap)
const UNTRACKED_FILL   = { color: '#2a5080', opacity: 0.05 }
const TRACKED_BORDER   = 'rgba(180, 200, 240, 0.35)' as string  // ~35% white-blue
const UNTRACKED_BORDER = 'rgba(100, 130, 180, 0.12)' as string  // very dim
```

#### Fan triangulation

For each polygon ring:
1. Compute centroid as average of all ring points (in XYZ space after projection)
2. For each consecutive pair of ring vertices `(i, i+1)`, emit a triangle `[centroid, v[i], v[i+1]]`
3. Assemble all triangles into a single `BufferGeometry` per country

For `MultiPolygon` features (e.g. France with overseas territories), process each ring separately and merge into one geometry.

#### GlobeScene integration

`GlobeScene` receives a new prop:

```ts
interface GlobeSceneProps extends GlobeCallbacks {
  markers: GlobeCountryMarker[]
  arcs?: GlobeArc[]
  countryRiskMap: CountryRiskMap  // NEW
  hoveredId: string | null
  selectedId: string | null
  isInteracting: boolean
}
```

Render order in `GlobeScene`:
```tsx
<GlobeSphere />
<GlobeAtmosphere />
<GlobeCountries countryRiskMap={countryRiskMap} />   {/* NEW — below markers */}
<GlobeMarkers ... />
<GlobeArcs arcs={arcs} />
```

#### WorldGlobe integration

`WorldGlobe` derives `countryRiskMap` from `mockCountries`:

```ts
const countryRiskMap = useMemo(
  () => Object.fromEntries(mockCountries.map((c) => [c.iso3, c.riskLevel])),
  []
)
```

Passes it through `GlobeCanvas` → `GlobeScene` → `GlobeCountries`.

---

## 3. Event Arcs

### `lib/mock-data/arcs.ts`

```ts
import type { GlobeArc } from '@/components/world/Globe/globe-types'

export const mockArcs: GlobeArc[] = [
  {
    id: 'arc-rus-ukr',
    startLat: 55.75, startLon: 37.62,   // Moscow
    endLat: 50.45,   endLon: 30.52,    // Kyiv
    color: '#ef4444',
    intensity: 1.0,
    label: 'Russia–Ukraine conflict',
  },
  {
    id: 'arc-irn-isr',
    startLat: 35.69, startLon: 51.39,   // Tehran
    endLat: 31.77,   endLon: 35.22,    // Jerusalem
    color: '#ef4444',
    intensity: 0.9,
    label: 'Iran–Israel tensions',
  },
  {
    id: 'arc-prk-kor',
    startLat: 39.02, startLon: 125.75,  // Pyongyang
    endLat: 37.57,   endLon: 126.98,   // Seoul
    color: '#f97316',
    intensity: 0.85,
    label: 'DPRK–ROK standoff',
  },
  {
    id: 'arc-chn-twn',
    startLat: 31.23, startLon: 121.47,  // Shanghai
    endLat: 25.03,   endLon: 121.56,   // Taipei
    color: '#f97316',
    intensity: 0.8,
    label: 'China–Taiwan strait',
  },
  {
    id: 'arc-rus-pol',
    startLat: 55.75, startLon: 37.62,   // Moscow
    endLat: 52.23,   endLon: 21.01,    // Warsaw
    color: '#f97316',
    intensity: 0.7,
    label: 'Russia–NATO eastern flank',
  },
  {
    id: 'arc-mmr-tha',
    startLat: 19.75, startLon: 96.08,   // Naypyidaw
    endLat: 13.75,   endLon: 100.52,   // Bangkok
    color: '#f59e0b',
    intensity: 0.6,
    label: 'Myanmar–Thailand border',
  },
]
```

### GlobeArcs verification

`GlobeArcs` currently accepts `arcs?: GlobeArc[]`. Verify that `arc.color` is applied to the line material. If the component uses a hardcoded color, update it to use `arc.color ?? '#3b82f6'`.

The arc curve is a quadratic bezier lifted above the sphere surface — the midpoint is pushed radially outward by ~0.4 units to create the arc shape.

---

## 4. World Page Fix

In `app/world/page.tsx`, replace:

```ts
new Date('2026-04-01').toLocaleDateString('en-US', { dateStyle: 'long' })
```

with:

```ts
new Date().toLocaleDateString('en-US', { dateStyle: 'long' })
```

---

## Out of Scope for Stage 4

- Clicking on country shapes (raycasting against polygon meshes) — markers handle click for now
- Country label overlays
- Real-time arc data from events API
- Region boundary rendering
- Performance optimization for mobile (defer to Stage 9)
