'use client'
import * as THREE from 'three'
import { GLOBE_RADIUS } from './GlobeSphere'

/**
 * Multi-layer atmospheric glow.
 * Uses BackSide rendering so the glow appears around the globe edge.
 */
export function GlobeAtmosphere() {
  return (
    <>
      {/* Inner haze — tight blue rim */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.045, 64, 64]} />
        <meshPhongMaterial
          color={new THREE.Color('#1a5cb0')}
          transparent
          opacity={0.13}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Mid atmosphere — softer diffusion */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.1, 64, 64]} />
        <meshPhongMaterial
          color={new THREE.Color('#0d3a8a')}
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outer corona — very faint */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.18, 48, 48]} />
        <meshPhongMaterial
          color={new THREE.Color('#082060')}
          transparent
          opacity={0.03}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}
