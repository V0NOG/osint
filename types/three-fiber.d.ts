/**
 * Type augmentations for @react-three/fiber and Three.js JSX intrinsics.
 *
 * @react-three/fiber v8 ships broken .d.ts declarations (missing declarations/src/index).
 * This file redeclares what the project needs until the upstream package is fixed or updated.
 */
import type * as THREE from 'three'
import type React from 'react'

declare module '@react-three/fiber' {
  interface RootState {
    gl: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.Camera
    clock: THREE.Clock
    size: { width: number; height: number }
  }

  type RenderCallback = (state: RootState, delta: number) => void

  export function useFrame(callback: RenderCallback, renderPriority?: number): void
  export function useThree(): RootState

  export interface CanvasProps {
    camera?: { position?: [number, number, number]; fov?: number; near?: number; far?: number }
    dpr?: number | [number, number]
    gl?: Partial<THREE.WebGLRendererParameters>
    style?: React.CSSProperties
    className?: string
    children?: React.ReactNode
    onCreated?: (state: RootState) => void
  }

  export const Canvas: React.FC<CanvasProps>

  export type ThreeEvent<T extends Event = Event> = T & {
    object: THREE.Object3D
    eventObject: THREE.Object3D
    stopPropagation: () => void
    nativeEvent: T
  }
}

// Three.js JSX intrinsic elements used by the globe components
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: React.PropsWithChildren<{
        position?: [number, number, number]
        scale?: [number, number, number] | number
        rotation?: [number, number, number]
        onPointerOver?: (e: { stopPropagation: () => void }) => void
        onPointerOut?: (e: { stopPropagation: () => void }) => void
        onClick?: (e: { stopPropagation: () => void }) => void
        ref?: React.Ref<THREE.Mesh>
      }>
      group: React.PropsWithChildren<{
        position?: [number, number, number]
        rotation?: [number, number, number]
        scale?: [number, number, number] | number
        ref?: React.Ref<THREE.Group>
      }>
      sphereGeometry: {
        args?: [radius?: number, widthSegments?: number, heightSegments?: number]
      }
      lineSegments: React.PropsWithChildren<{
        geometry?: THREE.BufferGeometry
        ref?: React.Ref<THREE.LineSegments>
      }>
      lineBasicMaterial: {
        color?: string | THREE.Color
        transparent?: boolean
        opacity?: number
        ref?: React.Ref<THREE.LineBasicMaterial>
      }
      meshPhongMaterial: {
        color?: string | THREE.Color
        emissive?: string | THREE.Color
        emissiveIntensity?: number
        shininess?: number
        specular?: string | THREE.Color
        transparent?: boolean
        opacity?: number
        side?: THREE.Side
        depthWrite?: boolean
        ref?: React.Ref<THREE.MeshPhongMaterial>
      }
      meshStandardMaterial: {
        color?: string | THREE.Color
        emissive?: string | THREE.Color
        emissiveIntensity?: number
        roughness?: number
        metalness?: number
        transparent?: boolean
        opacity?: number
        side?: THREE.Side
        depthWrite?: boolean
        ref?: React.Ref<THREE.MeshStandardMaterial>
      }
      meshBasicMaterial: {
        color?: string | THREE.Color
        transparent?: boolean
        opacity?: number
        side?: THREE.Side
        depthWrite?: boolean
        ref?: React.Ref<THREE.MeshBasicMaterial>
      }
      ambientLight: {
        intensity?: number
        color?: string | THREE.Color
      }
      directionalLight: {
        position?: [number, number, number]
        intensity?: number
        color?: string | THREE.Color
      }
      pointLight: {
        position?: [number, number, number]
        intensity?: number
        color?: string | THREE.Color
        distance?: number
      }
    }
  }
}
