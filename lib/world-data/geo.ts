import { feature } from 'topojson-client'
import type { Topology, Objects } from 'topojson-specification'
import type { Feature, Polygon, MultiPolygon, FeatureCollection } from 'geojson'
import { ISO_NUMERIC_TO_ISO3 } from './iso-numeric'

export interface CountryFeature extends Feature<Polygon | MultiPolygon> {
  properties: {
    numericId: number
    iso3: string | null
  }
}

let cachedFeatures: CountryFeature[] | null = null

/**
 * Returns GeoJSON features for all world countries from world-atlas 110m topojson.
 * Must only be called client-side — `require()` of the JSON is safe inside
 * components dynamically imported with `ssr: false` (e.g. GlobeCanvas).
 * Results are cached after the first call.
 */
export function getCountryFeatures(): CountryFeature[] {
  if (cachedFeatures) return cachedFeatures

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const topology = require('world-atlas/countries-110m.json') as Topology<Objects>
  const collection = feature(
    topology,
    topology.objects.countries
  ) as FeatureCollection<Polygon | MultiPolygon>

  cachedFeatures = collection.features.map((f) => {
    const numericId = Number(f.id)
    return {
      ...f,
      properties: {
        numericId,
        iso3: ISO_NUMERIC_TO_ISO3[numericId] ?? null,
      },
    }
  })

  return cachedFeatures
}
