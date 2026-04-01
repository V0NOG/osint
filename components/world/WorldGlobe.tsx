'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { X } from 'lucide-react'
import { GlobeFallback } from './Globe/GlobeFallback'
import { countriesToMarkers } from './Globe'
import type { GlobeCountryMarker } from './Globe'
import { mockCountries } from '@/lib/mock-data/countries'
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
  onClose: () => void
}

function CountryTooltip({ country, onClose }: CountryTooltipProps) {
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

      <div className="text-[11px] text-[var(--color-text-tertiary)] mb-3">
        {country.alertCount} active alert{country.alertCount !== 1 ? 's' : ''}
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
}

export function WorldGlobe({ className }: WorldGlobeProps) {
  // Defer render until client to avoid hydration mismatch
  const [mounted, setMounted] = useState(false)
  const webGLSupported = useWebGLSupport()

  const [hoveredCountry, setHoveredCountry] = useState<GlobeCountryMarker | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<GlobeCountryMarker | null>(null)
  const [cursor, setCursor] = useState('default')

  const markers = useMemo(() => countriesToMarkers(mockCountries), [])

  useEffect(() => {
    setMounted(true)
  }, [])

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
  const isInteracting = hoveredCountry !== null

  // Before mount or WebGL unavailable: show static fallback
  if (!mounted || webGLSupported === false) {
    return (
      <div className={className} style={{ minHeight: 480 }}>
        <GlobeFallback />
      </div>
    )
  }

  return (
    <div
      className={`relative w-full ${className ?? ''}`}
      style={{ minHeight: 480, cursor }}
    >
      {/* Depth gradient background — blends canvas into page bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/15 via-transparent to-[var(--color-bg-base)]/60 rounded-xl pointer-events-none z-0" />

      {/* 3D canvas */}
      <GlobeCanvas
        markers={markers}
        hoveredId={hoveredCountry?.countryId ?? null}
        selectedId={selectedCountry?.countryId ?? null}
        isInteracting={isInteracting}
        onHover={handleHover}
        onSelect={handleSelect}
        style={{ minHeight: 480, width: '100%', height: '100%' }}
        className="w-full h-full"
      />

      {/* Country tooltip — shown on hover or select */}
      {displayedCountry && (
        <CountryTooltip country={displayedCountry} onClose={handleCloseTooltip} />
      )}

      {/* Risk level legend — top-right corner */}
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

      {/* Hover hint — shown initially, hides once user interacts */}
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
