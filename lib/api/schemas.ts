import { z } from 'zod'

// ─── Forecast ────────────────────────────────────────────────────────────────

export const CreateForecastSchema = z.object({
  title: z.string().min(5).max(200),
  question: z.string().min(10),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeHorizon: z.string().min(1),
  regionId: z.string().min(1),
  countryIds: z.array(z.string()).min(1),
  probability: z.number().int().min(0).max(100),
  confidenceLevel: z.enum(['high', 'medium', 'low']),
  rationale: z.string().min(10),
  confidenceNotes: z.string().default(''),
  resolutionCriteria: z.string().min(5),
  uncertaintyNotes: z.string().default(''),
  evidence: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        direction: z.enum(['supporting', 'opposing', 'neutral']),
        weight: z.enum(['strong', 'moderate', 'weak']),
      })
    )
    .default([]),
  tags: z.array(z.string()).default([]),
})

export const UpdateForecastSchema = z
  .object({
    probability: z.number().int().min(0).max(100).optional(),
    confidenceLevel: z.enum(['high', 'medium', 'low']).optional(),
    rationale: z.string().min(10).optional(),
    confidenceNotes: z.string().optional(),
    uncertaintyNotes: z.string().optional(),
    status: z.enum(['active', 'resolved', 'expired', 'draft']).optional(),
    changeReason: z.string().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'At least one field required' })

export const ResolveForecastSchema = z.object({
  result: z.enum(['yes', 'no']),
  resolutionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  analystNote: z.string().min(5),
  sourceUrl: z.string().url().optional(),
})

// ─── Events ──────────────────────────────────────────────────────────────────

export const CreateEventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(5).max(300),
  summary: z.string().min(10),
  eventType: z.enum(['military', 'diplomatic', 'economic', 'political', 'humanitarian', 'cyber']),
  severity: z.enum(['critical', 'high', 'moderate', 'low']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tags: z.array(z.string()).default([]),
  locationDescription: z.string().optional(),
  impactAssessment: z.string().optional(),
  sources: z
    .array(
      z.object({
        title: z.string().min(1),
        url: z.string().url(),
        reliability: z.enum(['high', 'medium', 'low']),
        publishedAt: z.string().optional(),
      })
    )
    .default([]),
  countryIds: z.array(z.string()).default([]),
  actorIds: z.array(z.string()).default([]),
})

export type CreateForecastInput = z.infer<typeof CreateForecastSchema>
export type UpdateForecastInput = z.infer<typeof UpdateForecastSchema>
export type ResolveForecastInput = z.infer<typeof ResolveForecastSchema>
export type CreateEventInput = z.infer<typeof CreateEventSchema>
