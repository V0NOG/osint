import type { RiskLevel } from '@/lib/types'
import type { Country } from '@/lib/types'
import type { GlobeCountryMarker } from './globe-types'

// Approximate centroids for tracked countries (lat, lon)
const COUNTRY_CENTROIDS: Record<string, { lat: number; lon: number }> = {
  RU: { lat: 61.5, lon: 105.3 },
  UA: { lat: 48.4, lon: 31.2 },
  CN: { lat: 35.9, lon: 104.2 },
  IR: { lat: 32.4, lon: 53.7 },
  KP: { lat: 40.3, lon: 127.5 },
  TW: { lat: 23.7, lon: 121.0 },
  VE: { lat: 6.4, lon: -66.6 },
  ET: { lat: 9.1, lon: 40.5 },
  IL: { lat: 31.0, lon: 34.9 },
  MM: { lat: 19.2, lon: 96.7 },
  // Extensible for future countries
  US: { lat: 37.1, lon: -95.7 },
  GB: { lat: 55.4, lon: -3.4 },
  DE: { lat: 51.2, lon: 10.4 },
  FR: { lat: 46.2, lon: 2.2 },
  SA: { lat: 23.9, lon: 45.1 },
  PK: { lat: 30.4, lon: 69.3 },
  IN: { lat: 20.6, lon: 79.0 },
  BR: { lat: -14.2, lon: -51.9 },
  SY: { lat: 34.8, lon: 38.9 },
  YE: { lat: 15.6, lon: 48.5 },
}

/**
 * Convert geographic coordinates to 3D sphere position.
 * Uses standard spherical coordinate conversion for Three.js (Y-up).
 */
export function latLonToXYZ(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ]
}

export function riskLevelToHex(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    critical: '#ef4444',
    high: '#f97316',
    elevated: '#f59e0b',
    moderate: '#eab308',
    low: '#22c55e',
    minimal: '#6b7280',
  }
  return map[level] ?? '#6b7280'
}

export function riskLevelToMarkerSize(level: RiskLevel): number {
  const map: Record<RiskLevel, number> = {
    critical: 0.032,
    high: 0.027,
    elevated: 0.022,
    moderate: 0.019,
    low: 0.016,
    minimal: 0.014,
  }
  return map[level] ?? 0.018
}

export function countriesToMarkers(countries: Country[]): GlobeCountryMarker[] {
  return countries
    .filter((c) => COUNTRY_CENTROIDS[c.iso2] !== undefined)
    .map((c) => ({
      countryId: c.id,
      name: c.name,
      iso2: c.iso2,
      iso3: c.iso3,
      slug: c.slug,
      lat: COUNTRY_CENTROIDS[c.iso2].lat,
      lon: COUNTRY_CENTROIDS[c.iso2].lon,
      riskLevel: c.riskLevel,
      riskScore: c.overallRiskScore,
      alertCount: c.alertCount,
    }))
}
