'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { X } from 'lucide-react'
import { GlobeFallback } from './Globe/GlobeFallback'
import { countriesToMarkers } from './Globe'
import type { GlobeCountryMarker, GlobeArc } from './Globe'
import type { Country, GeopoliticalEvent } from '@/lib/types'
import type { CountryRiskMap } from './Globe/GlobeCountries'
import { getRiskTextClass } from '@/lib/utils/risk'
import { Badge } from '@/components/ui/Badge'

// Dynamically imported with ssr: false — avoids WebGL/Three.js on the server
const GlobeCanvas = dynamic(
  () => import('./Globe/GlobeCanvas').then((m) => ({ default: m.GlobeCanvas })),
  { ssr: false, loading: () => <GlobeFallback /> }
)

// Detect WebGL 2 / WebGL 1 support in browser
function useWebGLSupport() {
  const [supported, setSupported] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
      setSupported(Boolean(gl))
    } catch {
      setSupported(false)
    }
  }, [])

  return supported
}

// Risk level colors for the in-globe legend
const RISK_LEGEND: { level: string; hex: string }[] = [
  { level: 'Critical', hex: '#ef4444' },
  { level: 'High', hex: '#f97316' },
  { level: 'Elevated', hex: '#f59e0b' },
  { level: 'Moderate', hex: '#eab308' },
  { level: 'Low', hex: '#22c55e' },
]

interface CountryTooltipProps {
  country: GlobeCountryMarker
  eventCount: number
  onClose: () => void
}

function CountryTooltip({ country, eventCount, onClose }: CountryTooltipProps) {
  return (
    <div className="absolute bottom-4 left-4 z-20 w-60 bg-[var(--color-bg-surface)]/95 backdrop-blur-md border border-[var(--color-border-strong)] rounded-xl p-4 shadow-2xl animate-fade-in pointer-events-auto">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-5 rounded-sm bg-[var(--color-bg-overlay)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-bold text-[var(--color-text-tertiary)] font-mono">
              {country.iso2}
            </span>
          </div>
          <span className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">
            {country.name}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors flex-shrink-0 mt-0.5"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between mb-2.5">
        <Badge variant={`risk-${country.riskLevel}` as Parameters<typeof Badge>[0]['variant']} size="sm">
          {country.riskLevel}
        </Badge>
        <span className={`font-mono text-xl font-bold leading-none ${getRiskTextClass(country.riskLevel)}`}>
          {country.riskScore}
        </span>
      </div>

      <div className="text-[11px] text-[var(--color-text-tertiary)] mb-3 flex items-center gap-3">
        <span>{country.alertCount} active alert{country.alertCount !== 1 ? 's' : ''}</span>
        {eventCount > 0 && (
          <span className="text-amber-400">{eventCount} recent event{eventCount !== 1 ? 's' : ''}</span>
        )}
      </div>

      <Link
        href={`/countries/${country.slug}`}
        className="block w-full text-center text-xs font-medium text-[var(--color-accent-blue)] hover:text-blue-300 border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-lg py-2 transition-all duration-150"
      >
        View Country Profile →
      </Link>
    </div>
  )
}

interface WorldGlobeProps {
  className?: string
  countries?: Country[]
  events?: GeopoliticalEvent[]
  onSelect?: (marker: GlobeCountryMarker | null) => void
}

export function WorldGlobe({ className, countries = [], events = [], onSelect }: WorldGlobeProps) {
  const [mounted, setMounted] = useState(false)
  const webGLSupported = useWebGLSupport()

  const [hoveredCountry, setHoveredCountry] = useState<GlobeCountryMarker | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<GlobeCountryMarker | null>(null)
  const [cursor, setCursor] = useState('default')

  // Use real countries when available, fall back to empty
  const markers = useMemo(() => countriesToMarkers(countries), [countries])

  const countryRiskMap = useMemo<CountryRiskMap>(
    () => Object.fromEntries(countries.map((c) => [c.iso3, c.riskLevel])),
    [countries]
  )

  // Count ingested events per country ID for tooltip display
  const eventCountByCountryId = useMemo(() => {
    const map: Record<string, number> = {}
    for (const ev of events) {
      for (const cid of ev.countries) {
        map[cid] = (map[cid] ?? 0) + 1
      }
    }
    return map
  }, [events])

  // Build arcs from events that span multiple countries (up to 30)
  const eventArcs = useMemo<GlobeArc[]>(() => {
    // Build id→marker lookup from already-computed markers
    const markerById: Record<string, GlobeCountryMarker> = {}
    for (const m of markers) markerById[m.countryId] = m

    const arcs: GlobeArc[] = []
    for (const ev of events) {
      if (ev.countries.length < 2) continue
      const [aid, bid] = ev.countries
      const ma = markerById[aid], mb = markerById[bid]
      if (!ma || !mb) continue
      const color = ev.severity === 'critical' ? '#ef4444'
        : ev.severity === 'high' ? '#f97316'
        : '#f59e0b'
      arcs.push({
        id: ev.id,
        startLat: ma.lat, startLon: ma.lon,
        endLat: mb.lat, endLon: mb.lon,
        color,
      })
      if (arcs.length >= 30) break
    }
    return arcs
  }, [events, markers])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    onSelect?.(selectedCountry)
  }, [selectedCountry, onSelect])

  const handleHover = useCallback((country: GlobeCountryMarker | null) => {
    setHoveredCountry(country)
    setCursor(country ? 'pointer' : 'default')
  }, [])

  const handleSelect = useCallback((country: GlobeCountryMarker | null) => {
    setSelectedCountry((prev) =>
      prev?.countryId === country?.countryId ? null : country ?? null
    )
  }, [])

  const handleCloseTooltip = useCallback(() => {
    setSelectedCountry(null)
  }, [])

  const displayedCountry = selectedCountry ?? hoveredCountry

  if (!mounted || webGLSupported === false) {
    return (
      <div className={`h-full ${className ?? ''}`} style={{ minHeight: 480 }}>
        <GlobeFallback />
      </div>
    )
  }

  return (
    <div
      className={`relative w-full h-full ${className ?? ''}`}
      style={{ minHeight: 480, cursor }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/15 via-transparent to-[var(--color-bg-base)]/60 rounded-xl pointer-events-none z-0" />

      <GlobeCanvas
        markers={markers}
        arcs={eventArcs}
        countryRiskMap={countryRiskMap}
        hoveredId={hoveredCountry?.countryId ?? null}
        selectedId={selectedCountry?.countryId ?? null}
        isInteracting={hoveredCountry !== null}
        onHover={handleHover}
        onSelect={handleSelect}
        style={{ minHeight: 480, width: '100%', height: '100%' }}
        className="w-full h-full"
      />

      {displayedCountry && (
        <CountryTooltip
          country={displayedCountry}
          eventCount={eventCountByCountryId[displayedCountry.countryId] ?? 0}
          onClose={handleCloseTooltip}
        />
      )}

      {/* Risk level legend */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 bg-[var(--color-bg-surface)]/80 backdrop-blur-sm border border-[var(--color-border)] rounded-lg px-3 py-2.5 pointer-events-none">
        {RISK_LEGEND.map(({ level, hex }) => (
          <div key={level} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: hex, boxShadow: `0 0 5px ${hex}90` }}
            />
            <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium">
              {level}
            </span>
          </div>
        ))}
      </div>

      {!displayedCountry && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/8 backdrop-blur-sm">
            <span className="text-[11px] text-[var(--color-text-tertiary)]">
              Drag to rotate · Click marker to inspect
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
