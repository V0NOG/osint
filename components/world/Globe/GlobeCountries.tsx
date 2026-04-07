'use client'
import { useMemo, Fragment } from 'react'
import * as THREE from 'three'
import { getCountryFeatures } from '@/lib/world-data/geo'
import { latLonToXYZ } from './globe-utils'
import { GLOBE_RADIUS } from './GlobeSphere'
import type { RiskLevel } from '@/lib/types'
import type { Polygon, MultiPolygon, Position } from 'geojson'

export type CountryRiskMap = Record<string, RiskLevel>

const FILL_STYLE: Record<RiskLevel, { color: string; opacity: number }> = {
  critical: { color: '#ef4444', opacity: 0.18 },
  high:     { color: '#f97316', opacity: 0.15 },
  elevated: { color: '#f59e0b', opacity: 0.13 },
  moderate: { color: '#eab308', opacity: 0.11 },
  low:      { color: '#22c55e', opacity: 0.08 },
  minimal:  { color: '#22c55e', opacity: 0.06 },
}

const UNTRACKED_FILL   = { color: '#2a5080', opacity: 0.05 }
const TRACKED_BORDER_COLOR    = '#b4c8f0'
const TRACKED_BORDER_OPACITY  = 0.35
const UNTRACKED_BORDER_COLOR  = '#6482b4'
const UNTRACKED_BORDER_OPACITY = 0.12

const FILL_RADIUS   = GLOBE_RADIUS + 0.001
const BORDER_RADIUS = GLOBE_RADIUS + 0.002

function ringToXYZ(ring: Position[], radius: number): THREE.Vector3[] {
  return ring.map(([lon, lat]) => {
    const [x, y, z] = latLonToXYZ(lat as number, lon as number, radius)
    return new THREE.Vector3(x, y, z)
  })
}

function fanTriangulate(pts: THREE.Vector3[], radius: number): number[] {
  if (pts.length < 3) return []
  const sum = new THREE.Vector3()
  pts.forEach((p) => sum.add(p))
  const centroid = sum.divideScalar(pts.length).normalize().multiplyScalar(radius)
  const out: number[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    out.push(centroid.x, centroid.y, centroid.z)
    out.push(pts[i].x, pts[i].y, pts[i].z)
    out.push(pts[i + 1].x, pts[i + 1].y, pts[i + 1].z)
  }
  out.push(centroid.x, centroid.y, centroid.z)
  out.push(pts[pts.length - 1].x, pts[pts.length - 1].y, pts[pts.length - 1].z)
  out.push(pts[0].x, pts[0].y, pts[0].z)
  return out
}

function ringToLineSegments(pts: THREE.Vector3[]): number[] {
  const out: number[] = []
  for (let i = 0; i < pts.length; i++) {
    const next = pts[(i + 1) % pts.length]
    out.push(pts[i].x, pts[i].y, pts[i].z, next.x, next.y, next.z)
  }
  return out
}

function getRings(geometry: Polygon | MultiPolygon): Position[][] {
  if (geometry.type === 'Polygon') {
    return [geometry.coordinates[0]]
  }
  return geometry.coordinates.map((poly) => poly[0])
}

interface CountryFillProps {
  positions: Float32Array
  color: string
  opacity: number
}

function CountryFill({ positions, color, opacity }: CountryFillProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  return (
    <mesh>
      <primitive object={geometry} attach="geometry" />
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
    <lineSegments>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color={color} transparent opacity={opacity} />
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
        if (
          f.geometry.type !== 'Polygon' &&
          f.geometry.type !== 'MultiPolygon'
        ) {
          return null
        }

        const iso3 = f.properties.iso3
        const riskLevel = iso3 ? countryRiskMap[iso3] : undefined
        const isTracked = Boolean(riskLevel)

        const fillStyle    = riskLevel ? FILL_STYLE[riskLevel] : UNTRACKED_FILL
        const borderColor  = isTracked ? TRACKED_BORDER_COLOR   : UNTRACKED_BORDER_COLOR
        const borderOpacity = isTracked ? TRACKED_BORDER_OPACITY : UNTRACKED_BORDER_OPACITY

        const rings = getRings(f.geometry as Polygon | MultiPolygon)

        const fillPositions: number[]   = []
        const borderPositions: number[] = []

        for (const ring of rings) {
          if (ring.length < 3) continue
          const pts  = ringToXYZ(ring, FILL_RADIUS)
          const bPts = ringToXYZ(ring, BORDER_RADIUS)
          fillPositions.push(...fanTriangulate(pts, FILL_RADIUS))
          borderPositions.push(...ringToLineSegments(bPts))
        }

        return {
          id: f.properties.numericId,
          fillPositions:   new Float32Array(fillPositions),
          borderPositions: new Float32Array(borderPositions),
          fillColor:    fillStyle.color,
          fillOpacity:  fillStyle.opacity,
          borderColor,
          borderOpacity,
        }
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .filter((c) => c.fillPositions.length > 0)
  }, [countryRiskMap])

  return (
    <>
      {countries.map((c) => (
        <Fragment key={c.id}>
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
        </Fragment>
      ))}
    </>
  )
}
