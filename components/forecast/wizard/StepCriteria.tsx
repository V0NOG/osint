import { cn } from '@/lib/utils/cn'
import type { ForecastDraft } from './ForecastWizard'

interface StepCriteriaProps {
  draft: ForecastDraft
  onChange: (updates: Partial<ForecastDraft>) => void
  errors: Record<string, string>
}

export function StepCriteria({ draft, onChange, errors }: StepCriteriaProps) {
  return (
    <div className="space-y-6">
      {/* Resolution criteria */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Resolution Criteria <span className="text-red-400">*</span>
        </label>
        <p className="text-[11px] text-amber-400/80 mb-1.5">
          Be precise. Ambiguous criteria make forecasts impossible to resolve.
        </p>
        <textarea
          rows={6}
          value={draft.resolutionCriteria}
          onChange={(e) => onChange({ resolutionCriteria: e.target.value })}
          placeholder="Resolves YES if: ..."
          className={cn(
            'w-full bg-[var(--color-bg-elevated)] border rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none resize-none leading-relaxed transition-colors font-mono',
            errors.resolutionCriteria ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--color-border)] focus:border-blue-500/50'
          )}
        />
        {errors.resolutionCriteria && <p className="text-xs text-red-400 mt-1">{errors.resolutionCriteria}</p>}
      </div>

      {/* Uncertainty notes */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Uncertainty Notes <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={4}
          value={draft.uncertaintyNotes}
          onChange={(e) => onChange({ uncertaintyNotes: e.target.value })}
          placeholder="What could change this probability significantly? What are you most uncertain about?"
          className={cn(
            'w-full bg-[var(--color-bg-elevated)] border rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none resize-none leading-relaxed transition-colors',
            errors.uncertaintyNotes ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--color-border)] focus:border-blue-500/50'
          )}
        />
        {errors.uncertaintyNotes && <p className="text-xs text-red-400 mt-1">{errors.uncertaintyNotes}</p>}
      </div>
    </div>
  )
}
