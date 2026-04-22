'use client'
import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { latLonToXYZ } from './globe-utils'
import { GLOBE_RADIUS } from './GlobeSphere'
import type { GlobeArc } from './globe-types'

const ARC_POINTS    = 60
const ARC_DASH_SIZE = 0.04
const ARC_GAP_SIZE  = 0.02

interface SingleArcProps {
  arc: GlobeArc
  phaseOffset: number
}

function SingleArc({ arc, phaseOffset }: SingleArcProps) {
  const matRef = useRef<THREE.LineDashedMaterial | null>(null)

  const { lineObj } = useMemo(() => {
    const start = new THREE.Vector3(...latLonToXYZ(arc.startLat, arc.startLon, GLOBE_RADIUS))
    const end   = new THREE.Vector3(...latLonToXYZ(arc.endLat,   arc.endLon,   GLOBE_RADIUS))

    const angle = start.angleTo(end)
    let midDir: THREE.Vector3
    if (angle < 0.01) {
      midDir = new THREE.Vector3().addVectors(start, end).normalize()
    } else if (angle > Math.PI - 0.01) {
      // Antipodal: pick an arbitrary perpendicular axis
      const perp = Math.abs(start.y) < 0.9
        ? new THREE.Vector3(0, 1, 0)
        : new THREE.Vector3(1, 0, 0)
      midDir = new THREE.Vector3().crossVectors(start, perp).normalize()
    } else {
      const sinA = Math.sin(angle)
      midDir = new THREE.Vector3()
        .addScaledVector(start, Math.sin(0.5 * angle) / sinA)
        .addScaledVector(end,   Math.sin(0.5 * angle) / sinA)
        .normalize()
    }
    // Scale arc height by angular distance so distant arcs clear the globe
    const elevation = GLOBE_RADIUS * (0.35 + 0.85 * (angle / Math.PI))
    const mid = midDir.multiplyScalar(GLOBE_RADIUS + elevation)

    const curve  = new THREE.QuadraticBezierCurve3(start, mid, end)
    const points = curve.getPoints(ARC_POINTS)
    const geo    = new THREE.BufferGeometry().setFromPoints(points)

    const len = points.reduce((sum, p, i) =>
      i === 0 ? sum : sum + p.distanceTo(points[i - 1]), 0)

    const mat = new THREE.LineDashedMaterial({
      color: arc.color ?? '#3b82f6',
      dashSize: ARC_DASH_SIZE,
      gapSize: ARC_GAP_SIZE,
      scale: len,
      transparent: true,
      opacity: arc.intensity ?? 0.8,
      depthWrite: false,
    })

    const line = new THREE.Line(geo, mat)
    line.computeLineDistances()
    matRef.current = mat

    return { lineObj: line }
  }, [arc])

  useEffect(() => {
    return () => {
      lineObj.geometry.dispose()
      matRef.current?.dispose()
    }
  }, [lineObj])

  useFrame(({ clock }) => {
    if (!matRef.current) return
    const t = clock.getElapsedTime()
    matRef.current.opacity =
      (arc.intensity ?? 1) * (0.5 + 0.3 * Math.sin(t * 1.5 + phaseOffset))
  })

  return <primitive object={lineObj} />
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
