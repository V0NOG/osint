import { prisma } from './client'
import { mapRegion, mapCountry, mapForecast, mapEvent } from './mappers'
import type { Region, Country, Forecast, GeopoliticalEvent } from '@/lib/types'

export async function getRegions(): Promise<Region[]> {
  const regions = await prisma.region.findMany({
    include: { countries: true },
    orderBy: { overallRiskScore: 'desc' },
  })
  return regions.map(mapRegion)
}

export type RegionDetail = Region & {
  memberCountries: Country[]
  forecasts: Forecast[]
  recentEvents: GeopoliticalEvent[]
}

export async function getRegionBySlug(slug: string): Promise<RegionDetail | null> {
  const region = await prisma.region.findUnique({
    where: { slug },
    include: {
      countries: true,
      forecasts: {
        include: { history: true, evidence: true, countries: true, relatedEvents: true },
      },
    },
  })
  if (!region) return null

  const countryIds = region.countries.map((c) => c.id)
  const events = await prisma.geopoliticalEvent.findMany({
    where: { countries: { some: { id: { in: countryIds } } } },
    include: { sources: true, countries: true, actors: true, relatedForecasts: true },
    orderBy: { date: 'desc' },
    take: 10,
  })

  return {
    ...mapRegion(region),
    memberCountries: region.countries.map(mapCountry),
    forecasts: region.forecasts.map(mapForecast),
    recentEvents: events.map(mapEvent),
  }
}
