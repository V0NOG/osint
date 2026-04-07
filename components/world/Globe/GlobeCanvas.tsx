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
