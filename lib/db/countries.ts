import { prisma } from './client'
import { mapCountry, mapActor, mapEvent, mapForecast, mapRegion } from './mappers'
import type { Country, Actor, GeopoliticalEvent, Forecast, Region } from '@/lib/types'

export async function getCountries(): Promise<Country[]> {
  const countries = await prisma.country.findMany({
    orderBy: { overallRiskScore: 'desc' },
  })
  return countries.map(mapCountry)
}

export type CountryDetail = Country & {
  regionData: Region
  actors: Actor[]
  events: GeopoliticalEvent[]
  forecasts: Forecast[]
}

export async function getCountryBySlug(slug: string): Promise<CountryDetail | null> {
  const country = await prisma.country.findUnique({
    where: { slug },
    include: {
      region: true,
      keyActors: true,
      events: {
        include: { sources: true, countries: true, actors: true, relatedForecasts: true },
        orderBy: { date: 'desc' },
        take: 10,
      },
      forecasts: {
        include: { history: true, evidence: true, countries: true, relatedEvents: true },
        where: { status: 'active' },
      },
    },
  })
  if (!country) return null

  return {
    ...mapCountry(country),
    keyActors: country.keyActors.map((a) => a.id),
    regionData: mapRegion(country.region),
    actors: country.keyActors.map(mapActor),
    events: country.events.map(mapEvent),
    forecasts: country.forecasts.map(mapForecast),
  }
}
