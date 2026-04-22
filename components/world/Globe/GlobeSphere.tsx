'use client'
import { useMemo } from 'react'
import * as THREE from 'three'
import { useTheme } from '@/contexts/theme'

export const GLOBE_RADIUS = 1.5

export function GlobeSphere() {
  const { theme } = useTheme()
  const light = theme === 'light'

  const wireframeGeo = useMemo(
    () => new THREE.WireframeGeometry(new THREE.SphereGeometry(GLOBE_RADIUS + 0.003, 24, 12)),
    []
  )

  return (
    <>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshPhongMaterial
          color={new THREE.Color(light ? '#1565c0' : '#0a1628')}
          shininess={light ? 25 : 10}
          specular={new THREE.Color(light ? '#90caf9' : '#1a3a6e')}
          emissive={new THREE.Color(light ? '#0d47a1' : '#060d1a')}
          emissiveIntensity={light ? 0.25 : 1}
        />
      </mesh>

      <lineSegments geometry={wireframeGeo}>
        <lineBasicMaterial
          color={light ? '#4fc3f7' : '#2a5080'}
          transparent
          opacity={light ? 0.14 : 0.07}
        />
      </lineSegments>
    </>
  )
}
