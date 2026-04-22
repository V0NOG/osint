'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[app error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
        <AlertTriangle className="w-7 h-7 text-red-400" strokeWidth={1.5} />
      </div>
      <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-sm leading-relaxed mb-6">
        An unexpected error occurred. The issue has been logged.
        {error.digest && (
          <span className="block mt-2 text-[11px] font-mono text-[var(--color-text-tertiary)]">
            Error ID: {error.digest}
          </span>
        )}
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] transition-all duration-150"
      >
        <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
        Try again
      </button>
    </div>
  )
}
