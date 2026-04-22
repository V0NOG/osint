'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShieldAlert, Loader2, AlertCircle } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/world'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password.')
      setLoading(false)
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <div className="text-sm font-bold text-[var(--color-text-primary)] tracking-wider uppercase">
              GeoPol
            </div>
            <div className="text-[10px] text-[var(--color-text-tertiary)] font-medium uppercase tracking-widest -mt-0.5">
              OSINT Platform
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6">
          <h1 className="text-base font-bold text-[var(--color-text-primary)] mb-1">Sign in</h1>
          <p className="text-xs text-[var(--color-text-tertiary)] mb-5">
            Access the intelligence platform
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/8 border border-red-500/20 mb-4">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" strokeWidth={1.75} />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@osint.local"
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-[var(--color-text-tertiary)] mt-4">
          Restricted access — authorised personnel only
        </p>
      </div>
    </div>
  )
}
