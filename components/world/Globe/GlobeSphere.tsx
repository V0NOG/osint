'use client'
import { useMemo } from 'react'
import * as THREE from 'three'

export const GLOBE_RADIUS = 1.5

export function GlobeSphere() {
  // WireframeGeometry on a low-poly sphere gives clean lat/lon-like grid lines
  const wireframeGeo = useMemo(
    () => new THREE.WireframeGeometry(new THREE.SphereGeometry(GLOBE_RADIUS + 0.003, 24, 12)),
    []
  )

  return (
    <>
      {/* Main globe body */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshPhongMaterial
          color={new THREE.Color('#0a1628')}
          shininess={10}
          specular={new THREE.Color('#1a3a6e')}
          emissive={new THREE.Color('#060d1a')}
          emissiveIntensity={1}
        />
      </mesh>

      {/* Lat/lon grid overlay — very subtle */}
      <lineSegments geometry={wireframeGeo}>
        <lineBasicMaterial color="#2a5080" transparent opacity={0.07} />
      </lineSegments>
    </>
  )
}
