import type { RiskLevel } from '@/lib/types'
import type { Country } from '@/lib/types'
import type { GlobeCountryMarker } from './globe-types'

// ISO2 → centroid (lat, lon) for all commonly tracked countries
// Sorted roughly by geopolitical relevance to the platform
const COUNTRY_CENTROIDS: Record<string, { lat: number; lon: number }> = {
  // ── Core conflict / high-risk ──────────────────────────────────────────────
  RU: { lat: 61.5, lon: 105.3 },
  UA: { lat: 48.4, lon: 31.2 },
  CN: { lat: 35.9, lon: 104.2 },
  IR: { lat: 32.4, lon: 53.7 },
  KP: { lat: 40.3, lon: 127.5 },
  TW: { lat: 23.7, lon: 121.0 },
  SY: { lat: 34.8, lon: 38.9 },
  YE: { lat: 15.6, lon: 48.5 },
  MM: { lat: 19.2, lon: 96.7 },
  ET: { lat: 9.1, lon: 40.5 },
  SD: { lat: 12.9, lon: 30.2 },
  SS: { lat: 6.9, lon: 31.3 },
  AF: { lat: 33.9, lon: 67.7 },
  IQ: { lat: 33.2, lon: 43.7 },
  LY: { lat: 26.3, lon: 17.2 },
  SO: { lat: 5.2, lon: 46.2 },
  CD: { lat: -4.0, lon: 21.8 },
  CF: { lat: 6.6, lon: 20.9 },
  ML: { lat: 17.6, lon: -4.0 },
  NE: { lat: 17.6, lon: 8.1 },
  BF: { lat: 12.4, lon: -1.6 },
  TD: { lat: 15.5, lon: 18.7 },
  NG: { lat: 9.1, lon: 8.7 },
  MZ: { lat: -18.7, lon: 35.5 },
  HT: { lat: 18.9, lon: -72.3 },
  VE: { lat: 6.4, lon: -66.6 },
  MX: { lat: 23.6, lon: -102.6 },
  IL: { lat: 31.0, lon: 34.9 },
  PS: { lat: 31.9, lon: 35.3 },
  LB: { lat: 33.9, lon: 35.5 },
  PK: { lat: 30.4, lon: 69.3 },

  // ── Major powers ──────────────────────────────────────────────────────────
  US: { lat: 37.1, lon: -95.7 },
  GB: { lat: 55.4, lon: -3.4 },
  FR: { lat: 46.2, lon: 2.2 },
  DE: { lat: 51.2, lon: 10.4 },
  JP: { lat: 36.2, lon: 138.3 },
  IN: { lat: 20.6, lon: 79.0 },
  BR: { lat: -14.2, lon: -51.9 },
  SA: { lat: 23.9, lon: 45.1 },
  TR: { lat: 38.9, lon: 35.2 },
  KR: { lat: 35.9, lon: 127.8 },
  AU: { lat: -25.3, lon: 133.8 },
  CA: { lat: 56.1, lon: -106.3 },
  IT: { lat: 41.9, lon: 12.6 },
  ES: { lat: 40.5, lon: -3.7 },
  PL: { lat: 51.9, lon: 19.1 },

  // ── Europe ─────────────────────────────────────────────────────────────────
  BY: { lat: 53.7, lon: 27.9 },
  GE: { lat: 42.3, lon: 43.4 },
  AM: { lat: 40.1, lon: 45.0 },
  AZ: { lat: 40.1, lon: 47.6 },
  MD: { lat: 47.4, lon: 28.4 },
  RS: { lat: 44.0, lon: 21.0 },
  BA: { lat: 44.2, lon: 17.6 },
  XK: { lat: 42.6, lon: 20.9 },
  MK: { lat: 41.6, lon: 21.7 },
  AL: { lat: 41.2, lon: 20.2 },
  HU: { lat: 47.2, lon: 19.5 },
  SK: { lat: 48.7, lon: 19.7 },
  CZ: { lat: 49.8, lon: 15.5 },
  RO: { lat: 45.9, lon: 24.9 },
  BG: { lat: 42.7, lon: 25.5 },
  HR: { lat: 45.1, lon: 15.2 },
  SI: { lat: 46.2, lon: 14.8 },

  // ── Middle East ────────────────────────────────────────────────────────────
  AE: { lat: 23.4, lon: 53.8 },
  QA: { lat: 25.4, lon: 51.2 },
  KW: { lat: 29.3, lon: 47.5 },
  BH: { lat: 26.0, lon: 50.6 },
  OM: { lat: 21.5, lon: 55.9 },
  JO: { lat: 30.6, lon: 36.2 },
  EG: { lat: 26.8, lon: 30.8 },
  TN: { lat: 33.9, lon: 9.5 },
  DZ: { lat: 28.0, lon: 1.7 },
  MA: { lat: 31.8, lon: -7.1 },

  // ── Africa ─────────────────────────────────────────────────────────────────
  ZA: { lat: -30.6, lon: 22.9 },
  KE: { lat: 0.0, lon: 37.9 },
  TZ: { lat: -6.4, lon: 34.9 },
  GH: { lat: 7.9, lon: -1.0 },
  CI: { lat: 7.5, lon: -5.6 },
  CM: { lat: 3.8, lon: 11.5 },
  AO: { lat: -11.2, lon: 17.9 },
  ZM: { lat: -13.1, lon: 27.8 },
  ZW: { lat: -19.0, lon: 29.2 },
  SN: { lat: 14.5, lon: -14.5 },
  UG: { lat: 1.4, lon: 32.3 },
  RW: { lat: -1.9, lon: 29.9 },
  BI: { lat: -3.4, lon: 29.9 },
  ER: { lat: 15.2, lon: 39.8 },
  DJ: { lat: 11.8, lon: 42.6 },

  // ── Asia-Pacific ───────────────────────────────────────────────────────────
  ID: { lat: -0.8, lon: 113.9 },
  PH: { lat: 12.9, lon: 121.8 },
  VN: { lat: 14.1, lon: 108.3 },
  TH: { lat: 15.9, lon: 100.9 },
  MY: { lat: 4.2, lon: 108.0 },
  BD: { lat: 23.7, lon: 90.4 },
  NP: { lat: 28.4, lon: 84.1 },
  LK: { lat: 7.9, lon: 80.8 },
  MN: { lat: 46.9, lon: 103.8 },
  KZ: { lat: 48.0, lon: 68.0 },
  UZ: { lat: 41.4, lon: 64.6 },
  TM: { lat: 38.9, lon: 59.6 },
  TJ: { lat: 38.9, lon: 71.3 },
  KG: { lat: 41.2, lon: 74.8 },

  // ── Americas ───────────────────────────────────────────────────────────────
  AR: { lat: -38.4, lon: -63.6 },
  CO: { lat: 4.6, lon: -74.3 },
  CL: { lat: -35.7, lon: -71.5 },
  PE: { lat: -9.2, lon: -75.0 },
  EC: { lat: -1.8, lon: -78.2 },
  BO: { lat: -16.3, lon: -63.6 },
  PY: { lat: -23.4, lon: -58.4 },
  UY: { lat: -32.5, lon: -55.8 },
  GY: { lat: 4.9, lon: -58.9 },
  SR: { lat: 3.9, lon: -55.9 },
  CU: { lat: 21.5, lon: -78.0 },
  NI: { lat: 12.9, lon: -85.2 },
  HN: { lat: 15.2, lon: -86.2 },
  GT: { lat: 15.8, lon: -90.2 },
  SV: { lat: 13.8, lon: -88.9 },
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
