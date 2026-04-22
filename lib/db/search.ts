import { prisma } from './client'
import { mapCountry, mapEvent, mapForecast, mapRegion } from './mappers'
import type { Country, GeopoliticalEvent, Forecast, Region } from '@/lib/types'

export interface SearchResults {
  countries: Country[]
  events: GeopoliticalEvent[]
  forecasts: Forecast[]
  regions: Region[]
}

export async function searchAll(query: string, limit = 5): Promise<SearchResults> {
  const q = query.trim()
  if (!q) return { countries: [], events: [], forecasts: [], regions: [] }

  const [countries, events, forecasts, regions] = await Promise.all([
    prisma.country.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { iso2: { contains: q, mode: 'insensitive' } },
          { iso3: { contains: q, mode: 'insensitive' } },
          { capital: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { overallRiskScore: 'desc' },
      take: limit,
    }),

    prisma.geopoliticalEvent.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { summary: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: { sources: true, countries: true, actors: true, relatedForecasts: true },
      orderBy: { date: 'desc' },
      take: limit,
    }),

    prisma.forecast.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { question: { contains: q, mode: 'insensitive' } },
          { rationale: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: { history: true, evidence: true, countries: true, relatedEvents: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),

    prisma.region.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { summary: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { overallRiskScore: 'desc' },
      take: limit,
    }),
  ])

  return {
    countries: countries.map(mapCountry),
    events: events.map(mapEvent),
    forecasts: forecasts.map(mapForecast),
    regions: regions.map(mapRegion),
  }
}
