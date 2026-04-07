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
