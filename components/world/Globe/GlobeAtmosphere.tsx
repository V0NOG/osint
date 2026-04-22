'use client'
import * as THREE from 'three'
import { GLOBE_RADIUS } from './GlobeSphere'
import { useTheme } from '@/contexts/theme'

export function GlobeAtmosphere() {
  const { theme } = useTheme()
  const light = theme === 'light'

  return (
    <>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.045, 64, 64]} />
        <meshPhongMaterial
          color={new THREE.Color(light ? '#42a5f5' : '#1a5cb0')}
          transparent
          opacity={light ? 0.18 : 0.13}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.1, 64, 64]} />
        <meshPhongMaterial
          color={new THREE.Color(light ? '#64b5f6' : '#0d3a8a')}
          transparent
          opacity={light ? 0.10 : 0.07}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.18, 48, 48]} />
        <meshPhongMaterial
          color={new THREE.Color(light ? '#90caf9' : '#082060')}
          transparent
          opacity={light ? 0.05 : 0.03}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}
