'use client'

import { useState, useCallback } from 'react'
import { WorldGlobePlaceholder } from '@/components/world/WorldGlobePlaceholder'
import { CountryInfoPanel } from '@/components/world/CountryInfoPanel'
import type { Country } from '@/lib/types'
import type { GlobeCountryMarker } from '@/components/world/Globe'

interface WorldGlobeSectionProps {
  countries: Country[]
}

export function WorldGlobeSection({ countries }: WorldGlobeSectionProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)

  const handleGlobeSelect = useCallback(
    (marker: GlobeCountryMarker | null) => {
      if (!marker) {
        setSelectedCountry(null)
        return
      }
      setSelectedCountry(countries.find((c) => c.id === marker.countryId) ?? null)
    },
    [countries]
  )

  return (
    <div className="relative bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      <WorldGlobePlaceholder onSelect={handleGlobeSelect} />

      {selectedCountry && (
        <CountryInfoPanel
          country={selectedCountry}
          onClose={() => setSelectedCountry(null)}
        />
      )}
    </div>
  )
}
