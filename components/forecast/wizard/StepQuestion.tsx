'use client'

import { useState, useMemo } from 'react'
import { mockRegions } from '@/lib/mock-data/regions'
import { mockCountries } from '@/lib/mock-data/countries'
import { cn } from '@/lib/utils/cn'
import type { ForecastDraft } from './ForecastWizard'

interface StepQuestionProps {
  draft: ForecastDraft
  onChange: (updates: Partial<ForecastDraft>) => void
  errors: Record<string, string>
}

export function StepQuestion({ draft, onChange, errors }: StepQuestionProps) {
  const [countryFilter, setCountryFilter] = useState('')

  const filteredCountries = useMemo(() => {
    const query = countryFilter.toLowerCase()
    return mockCountries.filter((c) => c.name.toLowerCase().includes(query))
  }, [countryFilter])

  const toggleCountry = (id: string) => {
    const next = draft.countries.includes(id)
      ? draft.countries.filter((c) => c !== id)
      : [...draft.countries, id]
    onChange({ countries: next })
  }

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Forecast Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Russia-Ukraine ceasefire before Q3 2026"
          className={cn(
            'w-full bg-[var(--color-bg-elevated)] border rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none transition-colors',
            errors.title ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--color-border)] focus:border-blue-500/50'
          )}
        />
        {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
      </div>

      {/* Formal question */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Formal Question <span className="text-red-400">*</span>
        </label>
        <p className="text-[11px] text-[var(--color-text-tertiary)] mb-1.5">Frame as a binary yes/no question with a clear measurable outcome.</p>
        <textarea
          rows={3}
          value={draft.question}
          onChange={(e) => onChange({ question: e.target.value })}
          placeholder="Will...before [date]?"
          className={cn(
            'w-full bg-[var(--color-bg-elevated)] border rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none resize-none leading-relaxed transition-colors',
            errors.question ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--color-border)] focus:border-blue-500/50'
          )}
        />
        {errors.question && <p className="text-xs text-red-400 mt-1">{errors.question}</p>}
      </div>

      {/* Target date + time horizon */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
            Target Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={draft.targetDate}
            onChange={(e) => onChange({ targetDate: e.target.value })}
            className={cn(
              'w-full bg-[var(--color-bg-elevated)] border rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none transition-colors',
              errors.targetDate ? 'border-red-500/50' : 'border-[var(--color-border)] focus:border-blue-500/50'
            )}
          />
          {errors.targetDate && <p className="text-xs text-red-400 mt-1">{errors.targetDate}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
            Time Horizon <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={draft.timeHorizon}
            onChange={(e) => onChange({ timeHorizon: e.target.value })}
            placeholder="e.g. Q2 2026"
            className={cn(
              'w-full bg-[var(--color-bg-elevated)] border rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none transition-colors',
              errors.timeHorizon ? 'border-red-500/50' : 'border-[var(--color-border)] focus:border-blue-500/50'
            )}
          />
          {errors.timeHorizon && <p className="text-xs text-red-400 mt-1">{errors.timeHorizon}</p>}
        </div>
      </div>

      {/* Region */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Region <span className="text-red-400">*</span>
        </label>
        <select
          value={draft.region}
          onChange={(e) => onChange({ region: e.target.value })}
          className={cn(
            'w-full bg-[var(--color-bg-elevated)] border rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none transition-colors appearance-none',
            errors.region ? 'border-red-500/50' : 'border-[var(--color-border)] focus:border-blue-500/50'
          )}
        >
          <option value="">Select a region…</option>
          {mockRegions.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        {errors.region && <p className="text-xs text-red-400 mt-1">{errors.region}</p>}
      </div>

      {/* Countries */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Countries <span className="text-[var(--color-text-tertiary)] font-normal normal-case">(optional)</span>
        </label>
        <input
          type="text"
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          placeholder="Filter countries…"
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-t-lg px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500/50 transition-colors"
        />
        <div className="overflow-y-auto max-h-40 bg-[var(--color-bg-elevated)] border border-t-0 border-[var(--color-border)] rounded-b-lg divide-y divide-[var(--color-border)]">
          {filteredCountries.map((c) => (
            <label key={c.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.countries.includes(c.id)}
                onChange={() => toggleCountry(c.id)}
                className="accent-blue-500"
              />
              <span className="text-xs text-[var(--color-text-secondary)]">{c.name}</span>
            </label>
          ))}
        </div>
        {draft.countries.length > 0 && (
          <p className="text-[11px] text-blue-400 mt-1">{draft.countries.length} selected</p>
        )}
      </div>
    </div>
  )
}
