import { prisma } from './client'
import { mapForecast } from './mappers'
import type { Forecast, ForecastStatus, ConfidenceLevel } from '@/lib/types'

interface ForecastFilters {
  status?: ForecastStatus
  regionId?: string
}

export async function getForecasts(filters: ForecastFilters = {}): Promise<Forecast[]> {
  const forecasts = await prisma.forecast.findMany({
    where: {
      ...(filters.status && { status: filters.status }),
      ...(filters.regionId && { regionId: filters.regionId }),
    },
    include: { history: true, evidence: true, countries: true, relatedEvents: true },
    orderBy: { lastUpdated: 'desc' },
  })
  return forecasts.map(mapForecast)
}

export async function getForecastsByIds(ids: string[]): Promise<Forecast[]> {
  const forecasts = await prisma.forecast.findMany({
    where: { id: { in: ids } },
    include: { history: true, evidence: true, countries: true, relatedEvents: true },
  })
  return forecasts.map(mapForecast)
}

export async function getForecastById(id: string): Promise<Forecast | null> {
  const forecast = await prisma.forecast.findUnique({
    where: { id },
    include: { history: true, evidence: true, countries: true, relatedEvents: true },
  })
  if (!forecast) return null
  return mapForecast(forecast)
}

export interface CreateForecastInput {
  title: string
  question: string
  targetDate: string
  timeHorizon: string
  regionId: string
  countryIds: string[]
  probability: number
  confidenceLevel: ConfidenceLevel
  rationale: string
  confidenceNotes: string
  resolutionCriteria: string
  uncertaintyNotes: string
  evidence: Array<{ title: string; description: string; direction: string; weight: string }>
  tags: string[]
}

export async function createForecast(data: CreateForecastInput): Promise<Forecast> {
  const id = `fc-${Date.now()}`
  const forecast = await prisma.forecast.create({
    data: {
      id,
      title: data.title,
      question: data.question,
      status: 'active',
      probability: data.probability,
      confidenceLevel: data.confidenceLevel,
      confidenceNotes: data.confidenceNotes,
      rationale: data.rationale,
      uncertaintyNotes: data.uncertaintyNotes,
      timeHorizon: data.timeHorizon,
      targetDate: new Date(data.targetDate),
      regionId: data.regionId,
      resolutionCriteria: data.resolutionCriteria,
      versionNumber: 1,
      tags: data.tags,
      history: {
        create: [
          {
            date: new Date(),
            probability: data.probability,
            confidenceLevel: data.confidenceLevel,
            changeReason: 'Initial forecast',
          },
        ],
      },
      evidence: {
        create: data.evidence.map((e) => ({
          title: e.title,
          description: e.description,
          direction: e.direction as 'supporting' | 'opposing' | 'neutral',
          weight: e.weight as 'strong' | 'moderate' | 'weak',
        })),
      },
      countries: { connect: data.countryIds.map((id) => ({ id })) },
    },
    include: { history: true, evidence: true, countries: true, relatedEvents: true },
  })
  return mapForecast(forecast)
}

export interface UpdateForecastInput {
  probability?: number
  confidenceLevel?: ConfidenceLevel
  rationale?: string
  confidenceNotes?: string
  uncertaintyNotes?: string
  status?: ForecastStatus
  changeReason?: string
}

export async function updateForecast(id: string, data: UpdateForecastInput): Promise<Forecast> {
  const existing = await prisma.forecast.findUniqueOrThrow({ where: { id } })
  const forecast = await prisma.forecast.update({
    where: { id },
    data: {
      ...(data.probability !== undefined && { probability: data.probability }),
      ...(data.confidenceLevel && { confidenceLevel: data.confidenceLevel }),
      ...(data.rationale && { rationale: data.rationale }),
      ...(data.confidenceNotes && { confidenceNotes: data.confidenceNotes }),
      ...(data.uncertaintyNotes && { uncertaintyNotes: data.uncertaintyNotes }),
      ...(data.status && { status: data.status }),
      versionNumber: existing.versionNumber + 1,
      ...(data.changeReason && {
        history: {
          create: [
            {
              date: new Date(),
              probability: data.probability ?? existing.probability,
              confidenceLevel: data.confidenceLevel ?? existing.confidenceLevel,
              changeReason: data.changeReason,
            },
          ],
        },
      }),
    },
    include: { history: true, evidence: true, countries: true, relatedEvents: true },
  })
  return mapForecast(forecast)
}

export interface ResolveInput {
  result: 'yes' | 'no'
  resolutionDate: string
  analystNote: string
  sourceUrl?: string
}

export async function resolveForecast(id: string, outcome: ResolveInput): Promise<Forecast> {
  const existing = await prisma.forecast.findUniqueOrThrow({ where: { id } })
  const forecast = await prisma.forecast.update({
    where: { id },
    data: {
      status: 'resolved',
      versionNumber: existing.versionNumber + 1,
      history: {
        create: [
          {
            date: new Date(outcome.resolutionDate),
            probability: existing.probability,
            confidenceLevel: existing.confidenceLevel,
            changeReason: `Resolved ${outcome.result.toUpperCase()}: ${outcome.analystNote}`,
            analystNote: outcome.analystNote,
          },
        ],
      },
    },
    include: { history: true, evidence: true, countries: true, relatedEvents: true },
  })
  return mapForecast(forecast)
}
