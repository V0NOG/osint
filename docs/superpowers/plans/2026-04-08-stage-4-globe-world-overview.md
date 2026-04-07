# Stage 4: Globe / World Overview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the 3D globe with country boundary polygons colored by risk level, and add animated event arcs between geopolitical hotspot pairs.

**Architecture:** Install `world-atlas` + `topojson-client` for geo data; create `GlobeCountries` that fan-triangulates GeoJSON polygons into Three.js meshes colored by risk level; implement `GlobeArcs` with animated QuadraticBezierCurve3 lines; thread `countryRiskMap` through the existing `GlobeCanvas → GlobeScene` prop chain.

**Tech Stack:** React Three Fiber, Three.js, world-atlas (topojson), topojson-client, existing `latLonToXYZ` util in `globe-utils.ts`

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `lib/world-data/iso-numeric.ts` | Create | ISO 3166-1 numeric → ISO3 lookup used to match world-atlas features to mock countries |
| `lib/world-data/geo.ts` | Create | Loads world-atlas 110m topojson, converts to GeoJSON features, exports `getCountryFeatures()` |
| `lib/mock-data/arcs.ts` | Create | 6 hand-crafted `GlobeArc` objects for active geopolitical tensions |
| `components/world/Globe/GlobeCountries.tsx` | Create | Renders country fill meshes + border lines from GeoJSON features |
| `components/world/Globe/GlobeArcs.tsx` | Modify | Replace stub with real QuadraticBezierCurve3 arc rendering |
| `components/world/Globe/GlobeScene.tsx` | Modify | Add `countryRiskMap` prop, render `<GlobeCountries>` |
| `components/world/Globe/GlobeCanvas.tsx` | Modify | Thread `countryRiskMap` prop through to `GlobeScene` |
| `components/world/WorldGlobe.tsx` | Modify | Derive `countryRiskMap`, import `mockArcs`, pass both down |
| `app/world/page.tsx` | Modify | Replace hardcoded date with `new Date()` |

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install runtime and type packages**

```bash
cd /Users/connor/Documents/osint
npm install world-atlas topojson-client
npm install --save-dev @types/topojson-client @types/topojson-specification @types/geojson
```

Expected: packages added to `node_modules`, no peer dep warnings.

- [ ] **Step 2: Verify type-check still passes**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install world-atlas and topojson-client for globe geo data"
```

---

## Task 2: ISO numeric mapping + geo data loader

**Files:**
- Create: `lib/world-data/iso-numeric.ts`
- Create: `lib/world-data/geo.ts`

- [ ] **Step 1: Create `lib/world-data/iso-numeric.ts`**

This maps world-atlas numeric feature IDs (ISO 3166-1 numeric) to ISO3 alpha codes. Every sovereign state in the 110m topojson is listed. The mock countries use ISO3 codes (RUS, CHN, etc.) — this lookup bridges the two.

```ts
/**
 * Maps ISO 3166-1 numeric country codes (used by world-atlas) to
 * ISO 3166-1 alpha-3 codes (used by mock country data).
 */
export const ISO_NUMERIC_TO_ISO3: Record<number, string> = {
  4: 'AFG',
  8: 'ALB',
  12: 'DZA',
  24: 'AGO',
  32: 'ARG',
  36: 'AUS',
  40: 'AUT',
  50: 'BGD',
  56: 'BEL',
  64: 'BTN',
  68: 'BOL',
  76: 'BRA',
  100: 'BGR',
  104: 'MMR',
  108: 'BDI',
  116: 'KHM',
  120: 'CMR',
  124: 'CAN',
  140: 'CAF',
  144: 'LKA',
  148: 'TCD',
  152: 'CHL',
  156: 'CHN',
  158: 'TWN',
  170: 'COL',
  174: 'COM',
  178: 'COG',
  180: 'COD',
  188: 'CRI',
  191: 'HRV',
  192: 'CUB',
  196: 'CYP',
  203: 'CZE',
  204: 'BEN',
  208: 'DNK',
  218: 'ECU',
  226: 'GNQ',
  231: 'ETH',
  232: 'ERI',
  233: 'EST',
  246: 'FIN',
  250: 'FRA',
  262: 'DJI',
  266: 'GAB',
  270: 'GMB',
  276: 'DEU',
  288: 'GHA',
  300: 'GRC',
  320: 'GTM',
  324: 'GIN',
  328: 'GUY',
  332: 'HTI',
  340: 'HND',
  348: 'HUN',
  356: 'IND',
  360: 'IDN',
  364: 'IRN',
  368: 'IRQ',
  372: 'IRL',
  376: 'ISR',
  380: 'ITA',
  388: 'JAM',
  392: 'JPN',
  398: 'KAZ',
  400: 'JOR',
  404: 'KEN',
  408: 'PRK',
  410: 'KOR',
  414: 'KWT',
  418: 'LAO',
  422: 'LBN',
  426: 'LSO',
  428: 'LVA',
  430: 'LBR',
  434: 'LBY',
  440: 'LTU',
  450: 'MDG',
  454: 'MWI',
  458: 'MYS',
  466: 'MLI',
  478: 'MRT',
  484: 'MEX',
  496: 'MNG',
  504: 'MAR',
  508: 'MOZ',
  516: 'NAM',
  524: 'NPL',
  528: 'NLD',
  554: 'NZL',
  558: 'NIC',
  562: 'NER',
  566: 'NGA',
  578: 'NOR',
  586: 'PAK',
  591: 'PAN',
  598: 'PNG',
  600: 'PRY',
  604: 'PER',
  608: 'PHL',
  616: 'POL',
  620: 'PRT',
  624: 'GNB',
  634: 'QAT',
  642: 'ROU',
  643: 'RUS',
  646: 'RWA',
  678: 'STP',
  682: 'SAU',
  686: 'SEN',
  694: 'SLE',
  703: 'SVK',
  705: 'SVN',
  706: 'SOM',
  710: 'ZAF',
  716: 'ZWE',
  724: 'ESP',
  728: 'SSD',
  729: 'SDN',
  740: 'SUR',
  748: 'SWZ',
  752: 'SWE',
  756: 'CHE',
  760: 'SYR',
  762: 'TJK',
  764: 'THA',
  768: 'TGO',
  780: 'TTO',
  784: 'ARE',
  788: 'TUN',
  792: 'TUR',
  800: 'UGA',
  804: 'UKR',
  818: 'EGY',
  826: 'GBR',
  834: 'TZA',
  840: 'USA',
  854: 'BFA',
  858: 'URY',
  860: 'UZB',
  862: 'VEN',
  704: 'VNM',
  887: 'YEM',
  894: 'ZMB',
}
```

- [ ] **Step 2: Create `lib/world-data/geo.ts`**

```ts
import { feature } from 'topojson-client'
import type { Topology, Objects } from 'topojson-specification'
import type { Feature, Polygon, MultiPolygon, FeatureCollection } from 'geojson'
import { ISO_NUMERIC_TO_ISO3 } from './iso-numeric'

export interface CountryFeature extends Feature<Polygon | MultiPolygon> {
  properties: {
    numericId: number
    iso3: string | null
  }
}

let cachedFeatures: CountryFeature[] | null = null

/**
 * Returns GeoJSON features for all world countries from world-atlas 110m topojson.
 * Must only be called client-side — `require()` of the JSON is safe inside
 * components dynamically imported with `ssr: false` (e.g. GlobeCanvas).
 * Results are cached after the first call.
 */
export function getCountryFeatures(): CountryFeature[] {
  if (cachedFeatures) return cachedFeatures

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const topology = require('world-atlas/world/110m.json') as Topology<Objects>
  const collection = feature(
    topology,
    topology.objects.countries
  ) as FeatureCollection<Polygon | MultiPolygon>

  cachedFeatures = collection.features.map((f) => {
    const numericId = Number(f.id)
    return {
      ...f,
      properties: {
        numericId,
        iso3: ISO_NUMERIC_TO_ISO3[numericId] ?? null,
      },
    }
  })

  return cachedFeatures
}
```

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```

Expected: no errors. If `Topology` import errors occur, try `import type { Topology } from 'topojson-specification'` directly.

- [ ] **Step 4: Commit**

```bash
git add lib/world-data/iso-numeric.ts lib/world-data/geo.ts
git commit -m "feat: add world-atlas geo data loader and ISO numeric mapping"
```

---

## Task 3: GlobeCountries component

**Files:**
- Create: `components/world/Globe/GlobeCountries.tsx`

This is the core visual upgrade. For each country feature, render:
1. A filled `BufferGeometry` from fan triangulation — sits at `GLOBE_RADIUS + 0.001`
2. `LineSegments` for the border — sits at `GLOBE_RADIUS + 0.002`

Key imports from existing codebase:
- `GLOBE_RADIUS` from `./GlobeSphere`
- `latLonToXYZ` from `./globe-utils`
- `RiskLevel` from `@/lib/types`

- [ ] **Step 1: Create `components/world/Globe/GlobeCountries.tsx`**

```tsx
'use client'
import { useMemo } from 'react'
import * as THREE from 'three'
import { getCountryFeatures } from '@/lib/world-data/geo'
import { latLonToXYZ } from './globe-utils'
import { GLOBE_RADIUS } from './GlobeSphere'
import type { RiskLevel } from '@/lib/types'
import type { Polygon, MultiPolygon, Position } from 'geojson'

export type CountryRiskMap = Record<string, RiskLevel>

// Fill opacity and color per risk level
const FILL_STYLE: Record<RiskLevel, { color: string; opacity: number }> = {
  critical: { color: '#ef4444', opacity: 0.18 },
  high:     { color: '#f97316', opacity: 0.15 },
  elevated: { color: '#f59e0b', opacity: 0.13 },
  moderate: { color: '#eab308', opacity: 0.11 },
  low:      { color: '#22c55e', opacity: 0.08 },
  minimal:  { color: '#22c55e', opacity: 0.06 },
}

const UNTRACKED_FILL   = { color: '#2a5080', opacity: 0.05 }
const TRACKED_BORDER_COLOR   = '#b4c8f0'
const TRACKED_BORDER_OPACITY   = 0.35
const UNTRACKED_BORDER_COLOR = '#6482b4'
const UNTRACKED_BORDER_OPACITY = 0.12

const FILL_RADIUS   = GLOBE_RADIUS + 0.001
const BORDER_RADIUS = GLOBE_RADIUS + 0.002

/** Convert a GeoJSON ring (lon/lat pairs) to XYZ points on the sphere. */
function ringToXYZ(ring: Position[], radius: number): THREE.Vector3[] {
  return ring.map(([lon, lat]) => {
    const [x, y, z] = latLonToXYZ(lat, lon, radius)
    return new THREE.Vector3(x, y, z)
  })
}

/**
 * Fan-triangulate a polygon ring from its centroid.
 * Returns flat array of XYZ positions (3 floats per vertex, 3 vertices per triangle).
 */
function fanTriangulate(pts: THREE.Vector3[], radius: number): number[] {
  if (pts.length < 3) return []

  // Centroid in XYZ, then re-project to sphere surface
  const sum = new THREE.Vector3()
  pts.forEach((p) => sum.add(p))
  const centroid = sum.divideScalar(pts.length).normalize().multiplyScalar(radius)

  const out: number[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    out.push(centroid.x, centroid.y, centroid.z)
    out.push(pts[i].x, pts[i].y, pts[i].z)
    out.push(pts[i + 1].x, pts[i + 1].y, pts[i + 1].z)
  }
  // Close the fan
  out.push(centroid.x, centroid.y, centroid.z)
  out.push(pts[pts.length - 1].x, pts[pts.length - 1].y, pts[pts.length - 1].z)
  out.push(pts[0].x, pts[0].y, pts[0].z)
  return out
}

/**
 * Build line segment positions for a ring (each edge = 2 vertices).
 */
function ringToLineSegments(pts: THREE.Vector3[]): number[] {
  const out: number[] = []
  for (let i = 0; i < pts.length; i++) {
    const next = pts[(i + 1) % pts.length]
    out.push(pts[i].x, pts[i].y, pts[i].z, next.x, next.y, next.z)
  }
  return out
}

/** Extract all exterior rings from a Polygon or MultiPolygon. */
function getRings(geometry: Polygon | MultiPolygon): Position[][] {
  if (geometry.type === 'Polygon') {
    return [geometry.coordinates[0]]
  }
  return geometry.coordinates.map((poly) => poly[0])
}

interface CountryMeshProps {
  positions: Float32Array
  color: string
  opacity: number
}

function CountryFill({ positions, color, opacity }: CountryMeshProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.computeVertexNormals()
    return geo
  }, [positions])

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.FrontSide}
        depthWrite={false}
      />
    </mesh>
  )
}

interface CountryBorderProps {
  positions: Float32Array
  color: string
  opacity: number
}

function CountryBorder({ positions, color, opacity }: CountryBorderProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </lineSegments>
  )
}

interface GlobeCountriesProps {
  countryRiskMap: CountryRiskMap
}

export function GlobeCountries({ countryRiskMap }: GlobeCountriesProps) {
  const countries = useMemo(() => {
    const features = getCountryFeatures()

    return features
      .filter((f) => f.geometry !== null)
      .map((f) => {
        const iso3 = f.properties.iso3
        const riskLevel = iso3 ? countryRiskMap[iso3] : undefined
        const isTracked = Boolean(riskLevel)

        const fillStyle = riskLevel ? FILL_STYLE[riskLevel] : UNTRACKED_FILL
        const borderColor  = isTracked ? TRACKED_BORDER_COLOR   : UNTRACKED_BORDER_COLOR
        const borderOpacity = isTracked ? TRACKED_BORDER_OPACITY : UNTRACKED_BORDER_OPACITY

        const rings = getRings(f.geometry as Polygon | MultiPolygon)

        const fillPositions: number[] = []
        const borderPositions: number[] = []

        for (const ring of rings) {
          // Skip tiny rings (islands with < 3 points)
          if (ring.length < 3) continue
          const pts    = ringToXYZ(ring, FILL_RADIUS)
          const bPts   = ringToXYZ(ring, BORDER_RADIUS)
          fillPositions.push(...fanTriangulate(pts, FILL_RADIUS))
          borderPositions.push(...ringToLineSegments(bPts))
        }

        return {
          id: f.properties.numericId,
          fillPositions: new Float32Array(fillPositions),
          borderPositions: new Float32Array(borderPositions),
          fillColor: fillStyle.color,
          fillOpacity: fillStyle.opacity,
          borderColor,
          borderOpacity,
        }
      })
      .filter((c) => c.fillPositions.length > 0)
  }, [countryRiskMap])

  return (
    <>
      {countries.map((c) => (
        <group key={c.id}>
          <CountryFill
            positions={c.fillPositions}
            color={c.fillColor}
            opacity={c.fillOpacity}
          />
          <CountryBorder
            positions={c.borderPositions}
            color={c.borderColor}
            opacity={c.borderOpacity}
          />
        </group>
      ))}
    </>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: no errors. Common issue: `Position` from `geojson` — if it's not found, use `type Position = number[]` locally.

- [ ] **Step 3: Commit**

```bash
git add components/world/Globe/GlobeCountries.tsx
git commit -m "feat: add GlobeCountries with fan-triangulated fills and border lines"
```

---

## Task 4: Thread countryRiskMap through GlobeCanvas and GlobeScene

**Files:**
- Modify: `components/world/Globe/GlobeScene.tsx`
- Modify: `components/world/Globe/GlobeCanvas.tsx`

- [ ] **Step 1: Update `components/world/Globe/GlobeScene.tsx`**

Replace the entire file:

```tsx
'use client'
import { OrbitControls } from '@react-three/drei'
import { GlobeSphere } from './GlobeSphere'
import { GlobeAtmosphere } from './GlobeAtmosphere'
import { GlobeMarkers } from './GlobeMarkers'
import { GlobeArcs } from './GlobeArcs'
import { GlobeCountries } from './GlobeCountries'
import type { GlobeCountryMarker, GlobeArc, GlobeCallbacks } from './globe-types'
import type { CountryRiskMap } from './GlobeCountries'

interface GlobeSceneProps extends GlobeCallbacks {
  markers: GlobeCountryMarker[]
  arcs?: GlobeArc[]
  countryRiskMap: CountryRiskMap
  hoveredId: string | null
  selectedId: string | null
  isInteracting: boolean
}

export function GlobeScene({
  markers,
  arcs,
  countryRiskMap,
  hoveredId,
  selectedId,
  isInteracting,
  onHover,
  onSelect,
}: GlobeSceneProps) {
  return (
    <>
      <OrbitControls
        autoRotate={!isInteracting}
        autoRotateSpeed={0.35}
        enableDamping
        dampingFactor={0.05}
        enablePan={false}
        minDistance={3.5}
        maxDistance={5.0}
        minPolarAngle={Math.PI * 0.08}
        maxPolarAngle={Math.PI * 0.92}
      />

      <ambientLight intensity={0.35} color="#c8d8f8" />
      <directionalLight position={[5, 3, 5]} intensity={1.1} color="#ffffff" />
      <directionalLight position={[-4, -1.5, -4]} intensity={0.2} color="#2244aa" />

      {/* Render order: sphere → atmosphere → countries → markers → arcs */}
      <GlobeSphere />
      <GlobeAtmosphere />
      <GlobeCountries countryRiskMap={countryRiskMap} />
      <GlobeMarkers
        markers={markers}
        hoveredId={hoveredId}
        selectedId={selectedId}
        onHover={onHover}
        onSelect={onSelect}
      />
      <GlobeArcs arcs={arcs} />
    </>
  )
}
```

- [ ] **Step 2: Update `components/world/Globe/GlobeCanvas.tsx`**

Replace the entire file:

```tsx
'use client'
import { Canvas } from '@react-three/fiber'
import { GlobeScene } from './GlobeScene'
import type { GlobeCountryMarker, GlobeArc, GlobeCallbacks } from './globe-types'
import type { CountryRiskMap } from './GlobeCountries'

interface GlobeCanvasProps extends GlobeCallbacks {
  markers: GlobeCountryMarker[]
  arcs?: GlobeArc[]
  countryRiskMap: CountryRiskMap
  hoveredId: string | null
  selectedId: string | null
  isInteracting: boolean
  style?: React.CSSProperties
  className?: string
}

export function GlobeCanvas({
  markers,
  arcs,
  countryRiskMap,
  hoveredId,
  selectedId,
  isInteracting,
  onHover,
  onSelect,
  style,
  className,
}: GlobeCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.8], fov: 60 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent', ...style }}
      className={className}
    >
      <GlobeScene
        markers={markers}
        arcs={arcs}
        countryRiskMap={countryRiskMap}
        hoveredId={hoveredId}
        selectedId={selectedId}
        isInteracting={isInteracting}
        onHover={onHover}
        onSelect={onSelect}
      />
    </Canvas>
  )
}
```

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```

Expected: no errors. `CountryRiskMap` import flows through from `GlobeCountries`.

- [ ] **Step 4: Commit**

```bash
git add components/world/Globe/GlobeScene.tsx components/world/Globe/GlobeCanvas.tsx
git commit -m "feat: thread countryRiskMap through GlobeCanvas and GlobeScene"
```

---

## Task 5: Wire WorldGlobe with countryRiskMap and mockArcs

**Files:**
- Modify: `components/world/WorldGlobe.tsx`

`WorldGlobe` already imports `mockCountries`. Add a `useMemo` that derives the `countryRiskMap` from it, and import `mockArcs` to pass as the `arcs` prop.

- [ ] **Step 1: Update the imports in `components/world/WorldGlobe.tsx`**

Add these two imports after the existing import block:

```tsx
import { mockArcs } from '@/lib/mock-data/arcs'
import type { CountryRiskMap } from './Globe/GlobeCountries'
```

- [ ] **Step 2: Add countryRiskMap derivation inside the `WorldGlobe` component**

After the existing `const markers = useMemo(...)` line, add:

```tsx
const countryRiskMap = useMemo<CountryRiskMap>(
  () => Object.fromEntries(mockCountries.map((c) => [c.iso3, c.riskLevel])),
  []
)
```

- [ ] **Step 3: Pass countryRiskMap and arcs to GlobeCanvas**

Find the `<GlobeCanvas` JSX block and add the two new props:

```tsx
<GlobeCanvas
  markers={markers}
  arcs={mockArcs}
  countryRiskMap={countryRiskMap}
  hoveredId={hoveredCountry?.countryId ?? null}
  selectedId={selectedCountry?.countryId ?? null}
  isInteracting={isInteracting}
  onHover={handleHover}
  onSelect={handleSelect}
  style={{ minHeight: 480, width: '100%', height: '100%' }}
  className="w-full h-full"
/>
```

- [ ] **Step 4: Type-check**

```bash
npm run type-check
```

Expected: no errors. If `mockArcs` import errors, create the file in the next task first then re-run.

- [ ] **Step 5: Commit**

```bash
git add components/world/WorldGlobe.tsx
git commit -m "feat: wire countryRiskMap and mockArcs into WorldGlobe"
```

---

## Task 6: Create mockArcs + implement GlobeArcs

**Files:**
- Create: `lib/mock-data/arcs.ts`
- Modify: `components/world/Globe/GlobeArcs.tsx`

- [ ] **Step 1: Create `lib/mock-data/arcs.ts`**

```ts
import type { GlobeArc } from '@/components/world/Globe/globe-types'

export const mockArcs: GlobeArc[] = [
  {
    id: 'arc-rus-ukr',
    startLat: 55.75,
    startLon: 37.62,
    endLat: 50.45,
    endLon: 30.52,
    color: '#ef4444',
    intensity: 1.0,
    label: 'Russia–Ukraine conflict',
  },
  {
    id: 'arc-irn-isr',
    startLat: 35.69,
    startLon: 51.39,
    endLat: 31.77,
    endLon: 35.22,
    color: '#ef4444',
    intensity: 0.9,
    label: 'Iran–Israel tensions',
  },
  {
    id: 'arc-prk-kor',
    startLat: 39.02,
    startLon: 125.75,
    endLat: 37.57,
    endLon: 126.98,
    color: '#f97316',
    intensity: 0.85,
    label: 'DPRK–ROK standoff',
  },
  {
    id: 'arc-chn-twn',
    startLat: 31.23,
    startLon: 121.47,
    endLat: 25.03,
    endLon: 121.56,
    color: '#f97316',
    intensity: 0.8,
    label: 'China–Taiwan strait',
  },
  {
    id: 'arc-rus-pol',
    startLat: 55.75,
    startLon: 37.62,
    endLat: 52.23,
    endLon: 21.01,
    color: '#f97316',
    intensity: 0.7,
    label: 'Russia–NATO eastern flank',
  },
  {
    id: 'arc-mmr-tha',
    startLat: 19.75,
    startLon: 96.08,
    endLat: 13.75,
    endLon: 100.52,
    color: '#f59e0b',
    intensity: 0.6,
    label: 'Myanmar–Thailand border',
  },
]
```

- [ ] **Step 2: Replace `components/world/Globe/GlobeArcs.tsx`**

```tsx
'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { latLonToXYZ } from './globe-utils'
import { GLOBE_RADIUS } from './GlobeSphere'
import type { GlobeArc } from './globe-types'

const ARC_ELEVATION = GLOBE_RADIUS * 0.45   // how high the arc midpoint rises above the sphere
const ARC_POINTS    = 60                     // curve resolution
const ARC_DASH_SIZE = 0.04
const ARC_GAP_SIZE  = 0.02

interface SingleArcProps {
  arc: GlobeArc
  phaseOffset: number
}

function SingleArc({ arc, phaseOffset }: SingleArcProps) {
  const matRef = useRef<THREE.LineDashedMaterial>(null)

  const { geometry, totalLength } = useMemo(() => {
    const start = new THREE.Vector3(...latLonToXYZ(arc.startLat, arc.startLon, GLOBE_RADIUS))
    const end   = new THREE.Vector3(...latLonToXYZ(arc.endLat,   arc.endLon,   GLOBE_RADIUS))

    // Midpoint elevated above sphere surface along the bisector direction
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
    mid.normalize().multiplyScalar(GLOBE_RADIUS + ARC_ELEVATION)

    const curve  = new THREE.QuadraticBezierCurve3(start, mid, end)
    const points = curve.getPoints(ARC_POINTS)
    const geo    = new THREE.BufferGeometry().setFromPoints(points)
    geo.computeBoundingSphere()

    // Required for LineDashedMaterial
    const lineLen = points.reduce((sum, p, i) => {
      if (i === 0) return sum
      return sum + p.distanceTo(points[i - 1])
    }, 0)

    return { geometry: geo, totalLength: lineLen }
  }, [arc])

  // Animate dashOffset to make arcs appear to flow
  useFrame(({ clock }) => {
    if (!matRef.current) return
    const t = (clock.getElapsedTime() * 0.3 + phaseOffset) % 1
    matRef.current.dashOffset = -t * (ARC_DASH_SIZE + ARC_GAP_SIZE) * 10
    // Pulse opacity with intensity
    matRef.current.opacity = (arc.intensity ?? 1) * (0.5 + 0.3 * Math.sin(clock.getElapsedTime() * 1.5 + phaseOffset))
  })

  return (
    <line geometry={geometry}>
      <lineDashedMaterial
        ref={matRef}
        color={arc.color ?? '#3b82f6'}
        dashSize={ARC_DASH_SIZE}
        gapSize={ARC_GAP_SIZE}
        transparent
        opacity={arc.intensity ?? 0.8}
        depthWrite={false}
        scale={totalLength}
      />
    </line>
  )
}

interface GlobeArcsProps {
  arcs?: GlobeArc[]
}

export function GlobeArcs({ arcs = [] }: GlobeArcsProps) {
  if (arcs.length === 0) return null

  return (
    <>
      {arcs.map((arc, i) => (
        <SingleArc key={arc.id} arc={arc} phaseOffset={i * 0.61} />
      ))}
    </>
  )
}
```

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```

Expected: no errors. `line` and `lineDashedMaterial` are valid R3F intrinsic elements.

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Navigate to `/world`. Check:
- Country shapes are visible on the globe with subtle colored fills
- Critical/high countries (Russia, China, North Korea, Iran, Israel, Myanmar) show red/orange tints
- Country borders visible as thin lines
- Risk dot markers still pulse on top of fills
- 6 arcs visible as animated dashed lines between hotspot pairs
- Globe still rotates, drag still works

- [ ] **Step 5: Commit**

```bash
git add lib/mock-data/arcs.ts components/world/Globe/GlobeArcs.tsx
git commit -m "feat: implement animated event arcs and wire mock arc data"
```

---

## Task 7: World page date fix

**Files:**
- Modify: `app/world/page.tsx`

- [ ] **Step 1: Replace hardcoded date**

Find this line in `app/world/page.tsx`:

```tsx
{new Date('2026-04-01').toLocaleDateString('en-US', { dateStyle: 'long' })}
```

Replace with:

```tsx
{new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/world/page.tsx
git commit -m "fix: use live date in world page subtitle"
```

---

## Self-Review

**Spec coverage:**
- Country boundary rendering (fills + borders) → Task 3 ✓
- Risk-level color mapping → Task 3 (`FILL_STYLE` constants) ✓
- ISO numeric → ISO3 mapping → Task 2 ✓
- GeoJSON data loader (client-only, cached) → Task 2 ✓
- GlobeCountries below markers in render order → Task 4 ✓
- countryRiskMap threaded through GlobeCanvas → Task 4 ✓
- countryRiskMap derived from mockCountries in WorldGlobe → Task 5 ✓
- mockArcs data file → Task 6 ✓
- GlobeArcs implemented with animated dashed bezier curves → Task 6 ✓
- Arc color from `arc.color` field → Task 6 (`arc.color ?? '#3b82f6'`) ✓
- World page date fix → Task 7 ✓

**Type consistency check:**
- `CountryRiskMap` defined in `GlobeCountries.tsx`, imported in `GlobeScene.tsx`, `GlobeCanvas.tsx`, and `WorldGlobe.tsx` ✓
- `CountryFeature` defined in `geo.ts`, used internally only ✓
- `GlobeArc` type unchanged — `mockArcs` satisfies it ✓
- `latLonToXYZ` signature `(lat, lon, radius) → [x, y, z]` used correctly in both `GlobeCountries` and `GlobeArcs` ✓
- `GLOBE_RADIUS` imported from `GlobeSphere` in both `GlobeCountries` and `GlobeArcs` ✓
