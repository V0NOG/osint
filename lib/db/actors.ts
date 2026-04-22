import { prisma } from './client'
import { mapActor, mapEvent, mapCountry } from './mappers'
import type { Actor, GeopoliticalEvent, Country } from '@/lib/types'

export async function getActors(): Promise<Actor[]> {
  const actors = await prisma.actor.findMany({
    orderBy: { name: 'asc' },
  })
  return actors.map(mapActor)
}

export type ActorDetail = Actor & {
  countryObjects: Country[]
  eventObjects: GeopoliticalEvent[]
}

export async function getActorById(id: string): Promise<ActorDetail | null> {
  const actor = await prisma.actor.findUnique({
    where: { id },
    include: {
      countries: true,
      events: {
        include: { sources: true, countries: true, actors: true, relatedForecasts: true },
        orderBy: { date: 'desc' },
        take: 15,
      },
    },
  })
  if (!actor) return null

  return {
    ...mapActor(actor),
    countries: actor.countries.map((c) => c.id),
    countryObjects: actor.countries.map(mapCountry),
    eventObjects: actor.events.map(mapEvent),
  }
}
