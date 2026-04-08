'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils/cn'
import type { Forecast } from '@/lib/types'

export interface ResolveOutcome {
  result: 'yes' | 'no'
  resolutionDate: string
  analystNote: string
  sourceUrl?: string
}

interface ResolveModalProps {
  forecast: Forecast
  isOpen: boolean
  onClose: () => void
  onResolve: (outcome: ResolveOutcome) => void
}

export function ResolveModal({ forecast, isOpen, onClose, onResolve }: ResolveModalProps) {
  const today = new Date().toISOString().slice(0, 10)
  const [result, setResult] = useState<'yes' | 'no' | null>(null)
  const [resolutionDate, setResolutionDate] = useState(today)
  const [analystNote, setAnalystNote] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')

  const canSubmit = result !== null && analystNote.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit || !result) return
    onResolve({
      result,
      resolutionDate,
      analystNote: analystNote.trim(),
      sourceUrl: sourceUrl.trim() || undefined,
    })
  }

  const handleClose = () => {
    setResult(null)
    setAnalystNote('')
    setSourceUrl('')
    setResolutionDate(today)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Resolve Forecast" maxWidth="lg">
      <p className="text-xs text-[var(--color-text-tertiary)] mb-5 leading-relaxed">
        {forecast.title}
      </p>

      <div className="mb-5">
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          Outcome
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setResult('yes')}
            className={cn(
              'flex-1 py-3 rounded-lg text-sm font-bold tracking-wide border transition-colors',
              result === 'yes'
                ? 'bg-green-500/20 border-green-500/40 text-green-300'
                : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-green-500/30 hover:text-green-400'
            )}
          >
            YES
          </button>
          <button
            onClick={() => setResult('no')}
            className={cn(
              'flex-1 py-3 rounded-lg text-sm font-bold tracking-wide border transition-colors',
              result === 'no'
                ? 'bg-red-500/20 border-red-500/40 text-red-300'
                : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-red-500/30 hover:text-red-400'
            )}
          >
            NO
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          Resolution Date
        </label>
        <input
          type="date"
          value={resolutionDate}
          onChange={(e) => setResolutionDate(e.target.value)}
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-blue-500/50"
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          Final Analyst Note <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={4}
          value={analystNote}
          onChange={(e) => setAnalystNote(e.target.value)}
          placeholder="Describe the outcome and how the resolution criteria were satisfied."
          aria-required="true"
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed"
        />
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          Resolution Source <span className="text-[var(--color-text-tertiary)]">(optional)</span>
        </label>
        <input
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="URL to primary source (optional)"
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500/50"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
        <button
          onClick={handleClose}
          className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            canSubmit
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] cursor-not-allowed border border-[var(--color-border)]'
          )}
        >
          Confirm Resolution
        </button>
      </div>
    </Modal>
  )
}
