'use client'

import { cn } from '@/lib/utils/cn'
import { getProbabilityColor } from '@/lib/utils/risk'
import type { ConfidenceLevel } from '@/lib/types'
import type { ForecastDraft } from './ForecastWizard'

interface StepProbabilityProps {
  draft: ForecastDraft
  onChange: (updates: Partial<ForecastDraft>) => void
  errors: Record<string, string>
}

const CONFIDENCE_LEVELS: { value: ConfidenceLevel; label: string; activeClass: string }[] = [
  { value: 'low', label: 'LOW', activeClass: 'bg-red-500/20 border-red-500/40 text-red-300' },
  { value: 'medium', label: 'MEDIUM', activeClass: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
  { value: 'high', label: 'HIGH', activeClass: 'bg-green-500/20 border-green-500/40 text-green-300' },
]

export function StepProbability({ draft, onChange, errors }: StepProbabilityProps) {
  const probColorClass = getProbabilityColor(draft.probability)

  return (
    <div className="space-y-6">
      {/* Probability slider */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
          Probability
        </label>
        <div className="text-center mb-3">
          <span className={cn('text-5xl font-bold font-mono tabular-nums', probColorClass)}>
            {draft.probability}
          </span>
          <span className={cn('text-3xl font-bold font-mono', probColorClass)}>%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={draft.probability}
          onChange={(e) => onChange({ probability: Number(e.target.value) })}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-[var(--color-text-tertiary)]">0% — impossible</span>
          <span className="text-[10px] text-[var(--color-text-tertiary)]">50% — uncertain</span>
          <span className="text-[10px] text-[var(--color-text-tertiary)]">100% — certain</span>
        </div>
      </div>

      {/* Confidence level */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          Confidence Level
        </label>
        <div className="flex gap-2">
          {CONFIDENCE_LEVELS.map(({ value, label, activeClass }) => (
            <button
              key={value}
              onClick={() => onChange({ confidenceLevel: value })}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wider border transition-colors',
                draft.confidenceLevel === value
                  ? activeClass
                  : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-border-strong)]'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Rationale */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Rationale <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={5}
          value={draft.rationale}
          onChange={(e) => onChange({ rationale: e.target.value })}
          placeholder="Why was this probability assessed? Summarise the key drivers."
          className={cn(
            'w-full bg-[var(--color-bg-elevated)] border rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none resize-none leading-relaxed transition-colors',
            errors.rationale ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--color-border)] focus:border-blue-500/50'
          )}
        />
        {errors.rationale && <p className="text-xs text-red-400 mt-1">{errors.rationale}</p>}
      </div>

      {/* Confidence notes */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Confidence Notes <span className="text-[var(--color-text-tertiary)] font-normal normal-case">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={draft.confidenceNotes}
          onChange={(e) => onChange({ confidenceNotes: e.target.value })}
          placeholder="What limits your confidence in this assessment?"
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none resize-none leading-relaxed focus:border-blue-500/50 transition-colors"
        />
      </div>
    </div>
  )
}
