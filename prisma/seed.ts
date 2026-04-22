import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'
import { mockRegions } from '../lib/mock-data/regions'
import { mockCountries } from '../lib/mock-data/countries'
import { mockActors } from '../lib/mock-data/actors'
import { mockEvents } from '../lib/mock-data/events'
import { mockForecasts } from '../lib/mock-data/forecasts'

const ACTOR_TYPE_TO_PRISMA: Record<string, string> = {
  state: 'state',
  'non-state': 'non_state',
  'international-org': 'international_org',
  individual: 'individual',
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ── Extra stub regions referenced by countries/forecasts but absent from mockRegions ──
// Myanmar references 'southeast-asia'; fc-006 also targets that region.
const STUB_REGIONS: Array<{
  id: string
  slug: string
  name: string
  overallRiskScore: number
  riskLevel: 'critical' | 'high' | 'elevated' | 'moderate' | 'low' | 'minimal'
  summary: string
  keyTensions: string[]
  lastUpdated: Date
  activeEventCount: number
  activeForecastCount: number
}> = [
  {
    id: 'southeast-asia',
    slug: 'southeast-asia',
    name: 'Southeast Asia',
    overallRiskScore: 62,
    riskLevel: 'elevated',
    summary:
      'Southeast Asia faces significant instability driven by the Myanmar civil war, South China Sea disputes, and democratic backsliding across several states.',
    keyTensions: [
      'Myanmar civil war and humanitarian crisis',
      'South China Sea territorial disputes',
      'Democratic erosion in Thailand and Philippines',
    ],
    lastUpdated: new Date('2026-03-27'),
    activeEventCount: 6,
    activeForecastCount: 2,
  },
]

// Build lookup sets for valid IDs so we can filter broken references
const countryIds = new Set(mockCountries.map((c) => c.id))
const actorIds = new Set(mockActors.map((a) => a.id))
const eventIds = new Set(mockEvents.map((e) => e.id))

async function main() {
  // ── Regions ──────────────────────────────────────────────────────────────
  console.log('Seeding regions...')
  for (const r of mockRegions) {
    await prisma.region.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        slug: r.slug,
        name: r.name,
        overallRiskScore: r.overallRiskScore,
        riskLevel: r.riskLevel as 'critical' | 'high' | 'elevated' | 'moderate' | 'low' | 'minimal',
        summary: r.summary,
        keyTensions: r.keyTensions,
        lastUpdated: new Date(r.lastUpdated),
        activeEventCount: r.activeEventCount,
        activeForecastCount: r.activeForecastCount,
      },
    })
  }

  // Seed stub regions (referenced by mock data but not in mockRegions)
  for (const r of STUB_REGIONS) {
    await prisma.region.upsert({
      where: { id: r.id },
      update: {},
      create: r,
    })
  }

  // ── Countries ─────────────────────────────────────────────────────────────
  console.log('Seeding countries...')
  for (const c of mockCountries) {
    await prisma.country.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        slug: c.slug,
        name: c.name,
        iso2: c.iso2,
        iso3: c.iso3,
        regionId: c.region,
        overallRiskScore: c.overallRiskScore,
        riskLevel: c.riskLevel as 'critical' | 'high' | 'elevated' | 'moderate' | 'low' | 'minimal',
        riskCategories: c.riskCategories as unknown as import('@prisma/client').Prisma.InputJsonValue,
        summary: c.summary,
        capital: c.capital,
        lastUpdated: new Date(c.lastUpdated),
        alertCount: c.alertCount,
        activeForecastCount: c.activeForecastCount,
        population: c.population != null ? BigInt(c.population) : null,
        gdp: (c as unknown as Record<string, unknown>).gdp != null
          ? BigInt((c as unknown as Record<string, unknown>).gdp as number)
          : null,
      },
    })
  }

  // ── Actors ────────────────────────────────────────────────────────────────
  console.log('Seeding actors...')
  for (const a of mockActors) {
    await prisma.actor.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        name: a.name,
        type: (ACTOR_TYPE_TO_PRISMA[a.type] ?? a.type) as
          | 'state'
          | 'non_state'
          | 'international_org'
          | 'individual',
        role: a.role,
        riskContribution: a.riskContribution as 'high' | 'medium' | 'low',
        description: a.description,
        affiliations: a.affiliations ?? [],
      },
    })
  }

  // ── Country → Actor connections ───────────────────────────────────────────
  console.log('Connecting country → actor (keyActors)...')
  for (const c of mockCountries) {
    if (!c.keyActors || c.keyActors.length === 0) continue
    // Only connect actors that were actually seeded
    const validActors = c.keyActors.filter((id: string) => actorIds.has(id))
    if (validActors.length === 0) continue
    await prisma.country.update({
      where: { id: c.id },
      data: { keyActors: { connect: validActors.map((id: string) => ({ id })) } },
    })
  }

  // ── Events ────────────────────────────────────────────────────────────────
  console.log('Seeding events...')
  for (const e of mockEvents) {
    await prisma.geopoliticalEvent.upsert({
      where: { id: e.id },
      update: {},
      create: {
        id: e.id,
        title: e.title,
        summary: e.summary,
        eventType: e.eventType as
          | 'military'
          | 'diplomatic'
          | 'economic'
          | 'political'
          | 'humanitarian'
          | 'cyber',
        severity: e.severity as 'critical' | 'high' | 'moderate' | 'low',
        date: new Date(e.date),
        tags: e.tags,
        locationDescription: e.locationDescription,
        impactAssessment: e.impactAssessment,
        sources: {
          create: e.sources.map(
            (s: {
              title: string
              url: string
              reliability: string
              publishedAt?: string
            }) => ({
              title: s.title,
              url: s.url,
              reliability: s.reliability as 'high' | 'medium' | 'low',
              publishedAt: s.publishedAt ? new Date(s.publishedAt) : null,
            }),
          ),
        },
      },
    })

    // Connect countries (filter to seeded countries only)
    const validCountries = (e.countries ?? []).filter((id: string) => countryIds.has(id))
    if (validCountries.length > 0) {
      await prisma.geopoliticalEvent.update({
        where: { id: e.id },
        data: { countries: { connect: validCountries.map((id: string) => ({ id })) } },
      })
    }

    // Connect actors (filter to seeded actors only)
    const validActors = (e.actors ?? []).filter((id: string) => actorIds.has(id))
    if (validActors.length > 0) {
      await prisma.geopoliticalEvent.update({
        where: { id: e.id },
        data: { actors: { connect: validActors.map((id: string) => ({ id })) } },
      })
    }
  }

  // ── Forecasts ─────────────────────────────────────────────────────────────
  console.log('Seeding forecasts...')
  for (const f of mockForecasts) {
    await prisma.forecast.upsert({
      where: { id: f.id },
      update: {},
      create: {
        id: f.id,
        title: f.title,
        question: f.question,
        status: f.status as 'active' | 'resolved' | 'expired' | 'draft',
        probability: f.probability,
        confidenceLevel: f.confidenceLevel as 'low' | 'medium' | 'high',
        confidenceNotes: f.confidenceNotes,
        rationale: f.rationale,
        uncertaintyNotes: f.uncertaintyNotes,
        timeHorizon: f.timeHorizon,
        targetDate: new Date(f.targetDate),
        regionId: f.region,
        resolutionCriteria: f.resolutionCriteria,
        versionNumber: f.versionNumber,
        tags: f.tags ?? [],
        createdAt: new Date(f.createdAt),
        history: {
          create: (f.history ?? []).map(
            (h: {
              date: string
              probability: number
              confidenceLevel: string
              changeReason: string
              analystNote?: string
            }) => ({
              date: new Date(h.date),
              probability: h.probability,
              confidenceLevel: h.confidenceLevel as 'low' | 'medium' | 'high',
              changeReason: h.changeReason,
              analystNote: h.analystNote ?? null,
            }),
          ),
        },
        evidence: {
          create: (f.evidence ?? []).map(
            (ev: {
              title: string
              description: string
              direction: string
              weight: string
              sourceUrl?: string
              addedAt: string
            }) => ({
              title: ev.title,
              description: ev.description,
              direction: ev.direction as 'supporting' | 'opposing' | 'neutral',
              weight: ev.weight as 'strong' | 'moderate' | 'weak',
              sourceUrl: ev.sourceUrl ?? null,
              addedAt: new Date(ev.addedAt),
            }),
          ),
        },
      },
    })

    // Connect countries
    const validCountries = (f.countries ?? []).filter((id: string) => countryIds.has(id))
    if (validCountries.length > 0) {
      await prisma.forecast.update({
        where: { id: f.id },
        data: { countries: { connect: validCountries.map((id: string) => ({ id })) } },
      })
    }

    // Connect related events
    const validEvents = (f.relatedEvents ?? []).filter((id: string) => eventIds.has(id))
    if (validEvents.length > 0) {
      await prisma.forecast.update({
        where: { id: f.id },
        data: { relatedEvents: { connect: validEvents.map((id: string) => ({ id })) } },
      })
    }
  }

  // ── Admin user ────────────────────────────────────────────────────────────
  console.log('Creating admin user...')
  const passwordHash = await hash('password', 12)
  await prisma.user.upsert({
    where: { email: 'admin@osint.local' },
    update: {},
    create: {
      email: 'admin@osint.local',
      passwordHash,
      name: 'Admin',
      role: 'admin',
    },
  })

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
