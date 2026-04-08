import type {
  Region as PrismaRegion,
  Country as PrismaCountry,
  Actor as PrismaActor,
  GeopoliticalEvent as PrismaEvent,
  EventSource as PrismaEventSource,
  Forecast as PrismaForecast,
  ForecastHistoryEntry as PrismaHistoryEntry,
  ForecastEvidence as PrismaEvidence,
} from '@prisma/client'
import type {
  Region,
  Country,
  Actor,
  GeopoliticalEvent,
  EventSource,
  Forecast,
  ForecastHistoryEntry,
  ForecastEvidence,
  ActorType,
  RiskCategories,
} from '@/lib/types'

// Prisma enum → domain string for ActorType
const ACTOR_TYPE_MAP: Record<string, ActorType> = {
  state: 'state',
  non_state: 'non-state',
  international_org: 'international-org',
  individual: 'individual',
}

// Domain string → Prisma enum for ActorType
export const ACTOR_TYPE_TO_PRISMA: Record<string, string> = {
  state: 'state',
  'non-state': 'non_state',
  'international-org': 'international_org',
  individual: 'individual',
}

export function mapRegion(r: PrismaRegion & { countries?: PrismaCountry[] }): Region {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    overallRiskScore: r.overallRiskScore,
    riskLevel: r.riskLevel as Region['riskLevel'],
    summary: r.summary,
    keyTensions: r.keyTensions,
    lastUpdated: r.lastUpdated.toISOString(),
    activeEventCount: r.activeEventCount,
    activeForecastCount: r.activeForecastCount,
    countries: r.countries?.map((c) => c.id) ?? [],
  }
}

export function mapCountry(c: PrismaCountry): Country {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    iso2: c.iso2,
    iso3: c.iso3,
    region: c.regionId,
    overallRiskScore: c.overallRiskScore,
    riskLevel: c.riskLevel as Country['riskLevel'],
    riskCategories: c.riskCategories as unknown as RiskCategories,
    summary: c.summary,
    capital: c.capital,
    lastUpdated: c.lastUpdated.toISOString(),
    alertCount: c.alertCount,
    activeForecastCount: c.activeForecastCount,
    population: c.population !== null ? Number(c.population) : undefined,
    gdp: c.gdp !== null ? Number(c.gdp) : undefined,
    keyActors: [],
  }
}

export function mapActor(a: PrismaActor): Actor {
  return {
    id: a.id,
    name: a.name,
    type: ACTOR_TYPE_MAP[a.type] ?? (a.type as ActorType),
    role: a.role,
    riskContribution: a.riskContribution as Actor['riskContribution'],
    description: a.description,
    affiliations: a.affiliations,
    countries: [],
  }
}

export function mapEventSource(s: PrismaEventSource): EventSource {
  return {
    title: s.title,
    url: s.url,
    reliability: s.reliability as EventSource['reliability'],
    publishedAt: s.publishedAt?.toISOString(),
  }
}

export function mapEvent(
  e: PrismaEvent & {
    sources: PrismaEventSource[]
    countries?: PrismaCountry[]
    actors?: PrismaActor[]
    relatedForecasts?: PrismaForecast[]
  }
): GeopoliticalEvent {
  return {
    id: e.id,
    title: e.title,
    summary: e.summary,
    eventType: e.eventType as GeopoliticalEvent['eventType'],
    severity: e.severity as GeopoliticalEvent['severity'],
    date: e.date.toISOString().split('T')[0],
    tags: e.tags,
    locationDescription: e.locationDescription ?? undefined,
    impactAssessment: e.impactAssessment ?? undefined,
    sources: e.sources.map(mapEventSource),
    countries: e.countries?.map((c) => c.id) ?? [],
    actors: e.actors?.map((a) => a.id) ?? [],
    relatedForecasts: e.relatedForecasts?.map((f) => f.id) ?? [],
  }
}

export function mapHistoryEntry(h: PrismaHistoryEntry): ForecastHistoryEntry {
  return {
    date: h.date.toISOString().split('T')[0],
    probability: h.probability,
    confidenceLevel: h.confidenceLevel as ForecastHistoryEntry['confidenceLevel'],
    changeReason: h.changeReason,
    analystNote: h.analystNote ?? undefined,
  }
}

export function mapEvidence(e: PrismaEvidence): ForecastEvidence {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    direction: e.direction as ForecastEvidence['direction'],
    weight: e.weight as ForecastEvidence['weight'],
    sourceUrl: e.sourceUrl ?? undefined,
    addedAt: e.addedAt.toISOString().split('T')[0],
  }
}

export function mapForecast(
  f: PrismaForecast & {
    history?: PrismaHistoryEntry[]
    evidence?: PrismaEvidence[]
    countries?: PrismaCountry[]
    relatedEvents?: PrismaEvent[]
  }
): Forecast {
  return {
    id: f.id,
    title: f.title,
    question: f.question,
    status: f.status as Forecast['status'],
    probability: f.probability,
    confidenceLevel: f.confidenceLevel as Forecast['confidenceLevel'],
    confidenceNotes: f.confidenceNotes,
    rationale: f.rationale,
    uncertaintyNotes: f.uncertaintyNotes,
    timeHorizon: f.timeHorizon,
    targetDate: f.targetDate.toISOString().split('T')[0],
    region: f.regionId,
    countries: f.countries?.map((c) => c.id) ?? [],
    resolutionCriteria: f.resolutionCriteria,
    versionNumber: f.versionNumber,
    tags: f.tags,
    createdAt: f.createdAt.toISOString().split('T')[0],
    lastUpdated: f.lastUpdated.toISOString().split('T')[0],
    history: f.history?.map(mapHistoryEntry) ?? [],
    evidence: f.evidence?.map(mapEvidence),
    relatedEvents: f.relatedEvents?.map((e) => e.id),
  }
}
