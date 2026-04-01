'use client'
import type { GlobeArc } from './globe-types'

interface GlobeArcsProps {
  arcs?: GlobeArc[]
}

/**
 * Arc overlay layer — Phase 3 ready.
 *
 * Future implementation: render QuadraticBezierCurve3 paths between
 * geo-positions (elevated midpoint above globe radius) as TubeGeometry or Line.
 * Useful for: supply chain links, diplomatic relations, conflict vectors,
 * event propagation paths, migration flows.
 *
 * Each arc: startLat/Lon → midpoint at ~1.5x globe radius → endLat/Lon
 */
export function GlobeArcs({ arcs = [] }: GlobeArcsProps) {
  if (arcs.length === 0) return null

  // TODO Phase 3: for each arc, compute bezier curve points via latLonToXYZ,
  // build TubeGeometry, render with emissive MeshBasicMaterial + opacity animation
  return null
}
