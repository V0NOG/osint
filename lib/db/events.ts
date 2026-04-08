import { prisma } from './client'
import { mapEvent, mapCountry, mapActor } from './mappers'
import type { GeopoliticalEvent, EventType, EventSeverity, Country, Actor } from '@/lib/types'

interface EventFilters {
  severity?: EventSeverity
  eventType?: EventType
  countryId?: string
}

export async function getEvents(filters: EventFilters = {}): Promise<GeopoliticalEvent[]> {
  const events = await prisma.geopoliticalEvent.findMany({
    where: {
      ...(filters.severity && { severity: filters.severity }),
      ...(filters.eventType && { eventType: filters.eventType }),
      ...(filters.countryId && { countries: { some: { id: filters.countryId } } }),
    },
    include: { sources: true, countries: true, actors: true, relatedForecasts: true },
    orderBy: { date: 'desc' },
  })
  return events.map(mapEvent)
}

export type EventDetail = GeopoliticalEvent & {
  countryObjects: Country[]
  actorObjects: Actor[]
}

export async function getEventById(id: string): Promise<EventDetail | null> {
  const event = await prisma.geopoliticalEvent.findUnique({
    where: { id },
    include: { sources: true, countries: true, actors: true, relatedForecasts: true },
  })
  if (!event) return null

  return {
    ...mapEvent(event),
    countryObjects: event.countries.map(mapCountry),
    actorObjects: event.actors.map(mapActor),
  }
}

export interface CreateEventInput {
  id: string
  title: string
  summary: string
  eventType: EventType
  severity: EventSeverity
  date: string
  tags: string[]
  locationDescription?: string
  impactAssessment?: string
  sources: Array<{ title: string; url: string; reliability: string; publishedAt?: string }>
  countryIds: string[]
  actorIds: string[]
}

export async function createEvent(data: CreateEventInput): Promise<GeopoliticalEvent> {
  const event = await prisma.geopoliticalEvent.create({
    data: {
      id: data.id,
      title: data.title,
      summary: data.summary,
      eventType: data.eventType,
      severity: data.severity,
      date: new Date(data.date),
      tags: data.tags,
      locationDescription: data.locationDescription,
      impactAssessment: data.impactAssessment,
      sources: {
        create: data.sources.map((s) => ({
          title: s.title,
          url: s.url,
          reliability: s.reliability as 'high' | 'medium' | 'low',
          publishedAt: s.publishedAt ? new Date(s.publishedAt) : undefined,
        })),
      },
      countries: { connect: data.countryIds.map((id) => ({ id })) },
      actors: { connect: data.actorIds.map((id) => ({ id })) },
    },
    include: { sources: true, countries: true, actors: true, relatedForecasts: true },
  })
  return mapEvent(event)
}
