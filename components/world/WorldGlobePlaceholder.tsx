import { WorldGlobe } from './WorldGlobe'

/**
 * Integration shell for the globe layer.
 *
 * This is the stable export consumed by /world and other pages.
 * Internally renders the interactive 3D globe (Phase 2) with graceful
 * fallback to a static visual when WebGL is unavailable or on the server.
 *
 * The Globe/* module is the visual-3d agent's ownership boundary.
 * Page-level consumers only need this component — they never import Globe/* directly.
 */
export function WorldGlobePlaceholder() {
  return <WorldGlobe />
}
