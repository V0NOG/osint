import Link from 'next/link'
import { Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-14 h-14 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center justify-center mb-5">
        <Search className="w-7 h-7 text-[var(--color-text-tertiary)]" strokeWidth={1.25} />
      </div>
      <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
        Page not found
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-xs leading-relaxed mb-6">
        The page or entity you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] transition-all duration-150"
      >
        <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
        Back to home
      </Link>
    </div>
  )
}
