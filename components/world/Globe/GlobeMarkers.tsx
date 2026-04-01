'use client'
import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GlobeCountryMarker, GlobeCallbacks } from './globe-types'
import { latLonToXYZ, riskLevelToHex, riskLevelToMarkerSize } from './globe-utils'
import { GLOBE_RADIUS } from './GlobeSphere'

// Markers sit just above the sphere surface
const SURFACE_OFFSET = 0.018

// Expanding halo for critical/high risk countries
function PulseHalo({
  color,
  baseSize,
  phaseOffset,
}: {
  color: string
  baseSize: number
  phaseOffset: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current || !matRef.current) return
    const t = ((clock.getElapsedTime() + phaseOffset) % 2.4) / 2.4
    meshRef.current.scale.setScalar(1 + t * 3.0)
    matRef.current.opacity = 0.45 * Math.max(0, 1 - t * t * 1.5)
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[baseSize * 1.8, 8, 8]} />
      <meshBasicMaterial
        ref={matRef}
        color={color}
        transparent
        opacity={0.45}
        depthWrite={false}
      />
    </mesh>
  )
}

interface CountryMarkerProps {
  marker: GlobeCountryMarker
  isHovered: boolean
  isSelected: boolean
  phaseOffset: number
  onHover: GlobeCallbacks['onHover']
  onSelect: GlobeCallbacks['onSelect']
}

function CountryMarker({
  marker,
  isHovered,
  isSelected,
  phaseOffset,
  onHover,
  onSelect,
}: CountryMarkerProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const position = latLonToXYZ(marker.lat, marker.lon, GLOBE_RADIUS + SURFACE_OFFSET)
  const color = riskLevelToHex(marker.riskLevel)
  const size = riskLevelToMarkerSize(marker.riskLevel)
  const isPulsing = marker.riskLevel === 'critical' || marker.riskLevel === 'high'

  useFrame(() => {
    if (!matRef.current) return
    const target = isHovered || isSelected ? 2.5 : isPulsing ? 1.2 : 0.8
    matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      matRef.current.emissiveIntensity,
      target,
      0.12
    )
  })

  const handleOver = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      onHover?.(marker)
    },
    [marker, onHover]
  )

  const handleOut = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      onHover?.(null)
    },
    [onHover]
  )

  const handleClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      onSelect?.(marker)
    },
    [marker, onSelect]
  )

  return (
    <group position={position}>
      {isPulsing && (
        <PulseHalo color={color} baseSize={size} phaseOffset={phaseOffset} />
      )}

      <mesh onPointerOver={handleOver} onPointerOut={handleOut} onClick={handleClick}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={isPulsing ? 1.2 : 0.8}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
    </group>
  )
}

interface GlobeMarkersProps extends GlobeCallbacks {
  markers: GlobeCountryMarker[]
  hoveredId: string | null
  selectedId: string | null
}

export function GlobeMarkers({
  markers,
  hoveredId,
  selectedId,
  onHover,
  onSelect,
}: GlobeMarkersProps) {
  // Stable per-marker random phase offsets — derived from countryId
  return (
    <>
      {markers.map((marker, i) => (
        <CountryMarker
          key={marker.countryId}
          marker={marker}
          isHovered={hoveredId === marker.countryId}
          isSelected={selectedId === marker.countryId}
          phaseOffset={(i * 0.7 + 0.3) % 2.4}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}
