'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils/cn'
import type { Forecast, ConfidenceLevel } from '@/lib/types'

interface UpdateForecastModalProps {
  forecast: Forecast
  isOpen: boolean
  onClose: () => void
  onUpdated: (patch: { probability: number; confidenceLevel: ConfidenceLevel; rationale: string; changeReason: string }) => void
}

const CONFIDENCE_LEVELS: ConfidenceLevel[] = ['high', 'medium', 'low']

const confidenceLabels: Record<ConfidenceLevel, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

const confidenceStyles: Record<ConfidenceLevel, string> = {
  high: 'bg-green-500/15 border-green-500/30 text-green-300',
  medium: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
  low: 'bg-red-500/15 border-red-500/30 text-red-300',
}

export function UpdateForecastModal({
  forecast,
  isOpen,
  onClose,
  onUpdated,
}: UpdateForecastModalProps) {
  const [probability, setProbability] = useState(forecast.probability)
  const [confidenceLevel, setConfidenceLevel] = useState<ConfidenceLevel>(forecast.confidenceLevel)
  const [rationale, setRationale] = useState(forecast.rationale)
  const [changeReason, setChangeReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = changeReason.trim().length >= 5 && rationale.trim().length >= 10

  const handleClose = () => {
    setProbability(forecast.probability)
    setConfidenceLevel(forecast.confidenceLevel)
    setRationale(forecast.rationale)
    setChangeReason('')
    setError(null)
    onClose()
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/forecasts/${forecast.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ probability, confidenceLevel, rationale, changeReason }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Update failed')
      }

      onUpdated({ probability, confidenceLevel, rationale, changeReason })
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Update Forecast" maxWidth="lg">
      <p className="text-xs text-[var(--color-text-tertiary)] mb-5 leading-relaxed line-clamp-2">
        {forecast.title}
      </p>

      {/* Probability slider */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Probability
          </label>
          <span className="text-sm font-bold font-mono text-[var(--color-text-primary)]">
            {probability}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={probability}
          onChange={(e) => setProbability(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-[10px] text-[var(--color-text-tertiary)] mt-1">
          <span>0% Unlikely</span>
          <span>50% Even odds</span>
          <span>100% Certain</span>
        </div>
        {probability !== forecast.probability && (
          <p className="text-[11px] text-amber-400 mt-1.5 font-mono">
            {forecast.probability}% → {probability}%
            {probability > forecast.probability ? ` (+${probability - forecast.probability}pp)` : ` (${probability - forecast.probability}pp)`}
          </p>
        )}
      </div>

      {/* Confidence level */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          Confidence Level
        </label>
        <div className="flex gap-2">
          {CONFIDENCE_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setConfidenceLevel(level)}
              className={cn(
                'flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors',
                confidenceLevel === level
                  ? confidenceStyles[level]
                  : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-border-strong)]'
              )}
            >
              {confidenceLabels[level]}
            </button>
          ))}
        </div>
      </div>

      {/* Rationale */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          Updated Rationale <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={4}
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          placeholder="Explain your current assessment…"
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed"
        />
      </div>

      {/* Change reason */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          Reason for Update <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={changeReason}
          onChange={(e) => setChangeReason(e.target.value)}
          placeholder="e.g. New intelligence report, situation escalated…"
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500/50"
        />
        <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">
          This will be recorded in the forecast history.
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-400 mb-4 p-2.5 rounded-lg bg-red-500/5 border border-red-500/20">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
        <button
          onClick={handleClose}
          className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            canSubmit && !submitting
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] cursor-not-allowed border border-[var(--color-border)]'
          )}
        >
          {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {submitting ? 'Saving…' : 'Save Update'}
        </button>
      </div>
    </Modal>
  )
}
