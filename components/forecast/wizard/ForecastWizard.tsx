'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { StepQuestion } from './StepQuestion'
import { StepProbability } from './StepProbability'
import { StepCriteria } from './StepCriteria'
import { StepEvidence } from './StepEvidence'
import type { ConfidenceLevel, Region, Country } from '@/lib/types'

export interface DraftEvidence {
  id: string
  title: string
  description: string
  direction: 'supporting' | 'opposing' | 'neutral'
  weight: 'strong' | 'moderate' | 'weak'
}

export interface ForecastDraft {
  title: string
  question: string
  targetDate: string
  timeHorizon: string
  region: string
  countries: string[]
  probability: number
  confidenceLevel: ConfidenceLevel
  rationale: string
  confidenceNotes: string
  resolutionCriteria: string
  uncertaintyNotes: string
  evidence: DraftEvidence[]
  tags: string[]
}

const INITIAL_DRAFT: ForecastDraft = {
  title: '',
  question: '',
  targetDate: '',
  timeHorizon: '',
  region: '',
  countries: [],
  probability: 50,
  confidenceLevel: 'medium',
  rationale: '',
  confidenceNotes: '',
  resolutionCriteria: '',
  uncertaintyNotes: '',
  evidence: [],
  tags: [],
}

const STEPS = [
  { label: 'Question', description: 'Define what you are forecasting' },
  { label: 'Probability', description: 'Assess the likelihood and rationale' },
  { label: 'Criteria', description: 'Define how this forecast resolves' },
  { label: 'Evidence & Tags', description: 'Add supporting evidence and tags' },
]

export function ForecastWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<ForecastDraft>(INITIAL_DRAFT)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [regions, setRegions] = useState<Region[]>([])
  const [countries, setCountries] = useState<Country[]>([])

  // Fetch regions and countries from the API (not mock data)
  useEffect(() => {
    Promise.all([
      fetch('/api/regions').then((r) => r.json()),
      fetch('/api/countries').then((r) => r.json()),
    ]).then(([r, c]) => {
      if (Array.isArray(r)) setRegions(r)
      if (Array.isArray(c)) setCountries(c)
    }).catch(() => {
      // Non-fatal — user sees empty dropdowns and can still type
    })
  }, [])

  const updateDraft = useCallback((updates: Partial<ForecastDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }))
  }, [])

  const validateStep = useCallback((stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {}
    if (stepIndex === 0) {
      if (!draft.title.trim()) newErrors.title = 'Required'
      if (!draft.question.trim()) newErrors.question = 'Required'
      if (!draft.targetDate) newErrors.targetDate = 'Required'
      if (!draft.timeHorizon.trim()) newErrors.timeHorizon = 'Required'
      if (!draft.region) newErrors.region = 'Required'
    }
    if (stepIndex === 1) {
      if (!draft.rationale.trim()) newErrors.rationale = 'Required'
    }
    if (stepIndex === 2) {
      if (!draft.resolutionCriteria.trim()) newErrors.resolutionCriteria = 'Required'
      if (!draft.uncertaintyNotes.trim()) newErrors.uncertaintyNotes = 'Required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [draft])

  const handleNext = useCallback(() => {
    if (!validateStep(step)) return
    setErrors({})
    setStep((s) => s + 1)
  }, [validateStep, step])

  const handleBack = useCallback(() => {
    setErrors({})
    setStep((s) => s - 1)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!validateStep(step)) return
    setErrors({})
    setSubmitting(true)
    setSubmitError(null)

    try {
      const payload = {
        title: draft.title,
        question: draft.question,
        targetDate: draft.targetDate,
        timeHorizon: draft.timeHorizon,
        regionId: draft.region,
        countryIds: draft.countries.length > 0 ? draft.countries : ['placeholder'],
        probability: draft.probability,
        confidenceLevel: draft.confidenceLevel,
        rationale: draft.rationale,
        confidenceNotes: draft.confidenceNotes,
        resolutionCriteria: draft.resolutionCriteria,
        uncertaintyNotes: draft.uncertaintyNotes,
        evidence: draft.evidence.map(({ id: _id, ...e }) => e),
        tags: draft.tags,
      }

      const res = await fetch('/api/forecasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to create forecast')
      }

      setCreatedId(data.id)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }, [draft, step, validateStep])

  if (createdId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-10">
        <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-green-400" strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Forecast created</h2>
        <p className="text-sm text-[var(--color-text-tertiary)] mb-8 max-w-xs">{draft.title}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/forecasts/${createdId}`)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition-colors"
          >
            View Forecast
          </button>
          <Link
            href="/forecasts"
            className="px-4 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            All Forecasts
          </Link>
          <button
            onClick={() => { setDraft(INITIAL_DRAFT); setStep(0); setCreatedId(null) }}
            className="px-4 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Create another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[600px]">
      {/* Step sidebar */}
      <div className="w-[200px] flex-shrink-0 border-r border-[var(--color-border)] p-4 flex flex-col">
        <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest mb-5">
          New Forecast
        </p>
        <div className="flex flex-col gap-1 flex-1">
          {STEPS.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                i === step && 'bg-blue-500/10 border-l-2 border-blue-500 ml-[-1px]',
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold border',
                  i === step && 'bg-blue-600 border-blue-600 text-white',
                  i < step && 'bg-green-500/15 border-green-500/40',
                  i > step && 'border-[var(--color-border)] text-[var(--color-text-tertiary)]'
                )}
              >
                {i < step ? <Check className="w-3 h-3 text-green-400" /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  i === step ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'
                )}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[var(--color-text-tertiary)]">Step {step + 1} of {STEPS.length}</p>
      </div>

      {/* Form area */}
      <div className="flex-1 p-8 flex flex-col min-h-0">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{STEPS[step].label}</h2>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-0.5">{STEPS[step].description}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {step === 0 && <StepQuestion draft={draft} onChange={updateDraft} errors={errors} regions={regions} countries={countries} />}
          {step === 1 && <StepProbability draft={draft} onChange={updateDraft} errors={errors} />}
          {step === 2 && <StepCriteria draft={draft} onChange={updateDraft} errors={errors} />}
          {step === 3 && <StepEvidence draft={draft} onChange={updateDraft} />}
        </div>

        {submitError && (
          <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400">{submitError}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--color-border)] mt-6">
          {step > 0 && (
            <button
              onClick={handleBack}
              disabled={submitting}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] transition-colors disabled:opacity-50"
            >
              ← Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm text-white font-medium transition-colors"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {submitting ? 'Creating…' : 'Create Forecast'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
