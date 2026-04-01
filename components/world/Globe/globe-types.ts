import type { RiskLevel } from '@/lib/types'

export interface GlobeCountryMarker {
  countryId: string
  name: string
  iso2: string
  iso3: string
  slug: string
  lat: number
  lon: number
  riskLevel: RiskLevel
  riskScore: number
  alertCount: number
}

export interface GlobeArc {
  id: string
  startLat: number
  startLon: number
  endLat: number
  endLon: number
  color?: string
  intensity?: number
  label?: string
}

export interface GlobeCallbacks {
  onHover?: (country: GlobeCountryMarker | null) => void
  onSelect?: (country: GlobeCountryMarker | null) => void
}
