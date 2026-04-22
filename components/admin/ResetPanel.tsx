'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react'

export function ResetPanel() {
  const [step, setStep]       = useState<'idle' | 'confirm' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function handleReset() {
    setStep('loading')
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'RESET' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Reset failed')
      setMessage(data.message)
      setStep('done')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unknown error')
      setStep('error')
    }
  }

  return (
    <div className="bg-[var(--color-bg-surface)] border border-red-500/20 rounded-xl p-4">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-0.5">
            Wipe All Events &amp; Forecasts
          </p>
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
            Deletes all ingested events, their sources, and all generated forecasts.
            Regions, countries, actors, and feed config are preserved.
          </p>
        </div>
      </div>

      {step === 'idle' && (
        <button
          onClick={() => setStep('confirm')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-all duration-150"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
          Reset Database
        </button>
      )}

      {step === 'confirm' && (
        <div className="flex items-center gap-2">
          <p className="text-[11px] text-red-400 font-medium">Are you sure? This cannot be undone.</p>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-all duration-150"
          >
            Yes, wipe data
          </button>
          <button
            onClick={() => setStep('idle')}
            className="px-3 py-1.5 rounded-lg text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {step === 'loading' && (
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Wiping data…
        </div>
      )}

      {step === 'done' && (
        <div className="flex items-center gap-2 text-xs text-green-400">
          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
          {message}
          <button onClick={() => setStep('idle')} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] ml-1 transition-colors">
            ← Back
          </button>
        </div>
      )}

      {step === 'error' && (
        <div className="flex items-center gap-2 text-xs text-red-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          {message}
          <button onClick={() => setStep('idle')} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] ml-1 transition-colors">
            ← Back
          </button>
        </div>
      )}
    </div>
  )
}
