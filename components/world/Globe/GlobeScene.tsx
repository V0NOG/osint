'use client'
import { OrbitControls } from '@react-three/drei'
import { GlobeSphere } from './GlobeSphere'
import { GlobeAtmosphere } from './GlobeAtmosphere'
import { GlobeMarkers } from './GlobeMarkers'
import { GlobeArcs } from './GlobeArcs'
import type { GlobeCountryMarker, GlobeArc, GlobeCallbacks } from './globe-types'

interface GlobeSceneProps extends GlobeCallbacks {
  markers: GlobeCountryMarker[]
  arcs?: GlobeArc[]
  hoveredId: string | null
  selectedId: string | null
  isInteracting: boolean
}

export function GlobeScene({
  markers,
  arcs,
  hoveredId,
  selectedId,
  isInteracting,
  onHover,
  onSelect,
}: GlobeSceneProps) {
  return (
    <>
      {/* Orbit controls — pause auto-rotate while user is hovering a marker */}
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

      {/* Lighting */}
      <ambientLight intensity={0.35} color="#c8d8f8" />
      {/* Primary sun — warm-white, slight offset */}
      <directionalLight position={[5, 3, 5]} intensity={1.1} color="#ffffff" />
      {/* Blue fill from opposite side */}
      <directionalLight position={[-4, -1.5, -4]} intensity={0.2} color="#2244aa" />

      {/* Globe body + grid */}
      <GlobeSphere />

      {/* Atmospheric glow shells */}
      <GlobeAtmosphere />

      {/* Country risk markers */}
      <GlobeMarkers
        markers={markers}
        hoveredId={hoveredId}
        selectedId={selectedId}
        onHover={onHover}
        onSelect={onSelect}
      />

      {/* Arc overlay (future data wiring) */}
      <GlobeArcs arcs={arcs} />
    </>
  )
}
