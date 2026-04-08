import { prisma } from './client'
import { mapRegion, mapCountry, mapForecast } from './mappers'
import type { Region, Country, Forecast } from '@/lib/types'

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

  return {
    ...mapRegion(region),
    memberCountries: region.countries.map(mapCountry),
    forecasts: region.forecasts.map(mapForecast),
  }
}
