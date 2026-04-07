'use client'
import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { latLonToXYZ } from './globe-utils'
import { GLOBE_RADIUS } from './GlobeSphere'
import type { GlobeArc } from './globe-types'

const ARC_ELEVATION = GLOBE_RADIUS * 0.45
const ARC_POINTS    = 60
const ARC_DASH_SIZE = 0.04
const ARC_GAP_SIZE  = 0.02

interface SingleArcProps {
  arc: GlobeArc
  phaseOffset: number
}

function SingleArc({ arc, phaseOffset }: SingleArcProps) {
  const matRef = useRef<THREE.LineDashedMaterial>(null)

  const { lineObj, lineLength } = useMemo(() => {
    const start = new THREE.Vector3(...latLonToXYZ(arc.startLat, arc.startLon, GLOBE_RADIUS))
    const end   = new THREE.Vector3(...latLonToXYZ(arc.endLat,   arc.endLon,   GLOBE_RADIUS))

    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
    mid.normalize().multiplyScalar(GLOBE_RADIUS + ARC_ELEVATION)

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

    return { lineObj: line, lineLength: len }
  }, [arc])

  useEffect(() => {
    return () => {
      lineObj.geometry.dispose()
      ;(lineObj.material as THREE.LineDashedMaterial).dispose()
    }
  }, [lineObj])

  useFrame(({ clock }) => {
    const mat = lineObj.material as THREE.LineDashedMaterial
    const t = clock.getElapsedTime()
    mat.opacity =
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
