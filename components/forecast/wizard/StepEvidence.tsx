'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { ForecastDraft, DraftEvidence } from './ForecastWizard'

interface StepEvidenceProps {
  draft: ForecastDraft
  onChange: (updates: Partial<ForecastDraft>) => void
}

type Direction = DraftEvidence['direction']
type Weight = DraftEvidence['weight']

const DIRECTIONS: { value: Direction; label: string; activeClass: string }[] = [
  { value: 'supporting', label: 'Supporting', activeClass: 'bg-green-500/20 border-green-500/40 text-green-300' },
  { value: 'opposing', label: 'Opposing', activeClass: 'bg-red-500/20 border-red-500/40 text-red-300' },
  { value: 'neutral', label: 'Neutral', activeClass: 'bg-[var(--color-bg-elevated)] border-[var(--color-border-strong)] text-[var(--color-text-secondary)]' },
]

const WEIGHTS: { value: Weight; label: string }[] = [
  { value: 'strong', label: 'Strong' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'weak', label: 'Weak' },
]

const DIRECTION_DISPLAY_CLASS: Record<Direction, string> = {
  supporting: 'text-green-400 bg-green-500/10 border-green-500/20',
  opposing: 'text-red-400 bg-red-500/10 border-red-500/20',
  neutral: 'text-[var(--color-text-tertiary)] bg-white/5 border-[var(--color-border)]',
}

const EMPTY_FORM = { title: '', description: '', direction: 'supporting' as Direction, weight: 'moderate' as Weight }

export function StepEvidence({ draft, onChange }: StepEvidenceProps) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [tagInput, setTagInput] = useState('')

  const addEvidence = () => {
    if (!form.title.trim()) return
    const item: DraftEvidence = {
      ...form,
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      title: form.title.trim(),
      description: form.description.trim(),
    }
    onChange({ evidence: [...draft.evidence, item] })
    setForm(EMPTY_FORM)
  }

  const removeEvidence = (id: string) => {
    onChange({ evidence: draft.evidence.filter((e) => e.id !== id) })
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim().replace(/,$/, '')
      if (tag && !draft.tags.includes(tag)) {
        onChange({ tags: [...draft.tags, tag] })
      }
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    onChange({ tags: draft.tags.filter((t) => t !== tag) })
  }

  return (
    <div className="space-y-6">
      {/* Evidence list */}
      {draft.evidence.length > 0 && (
        <div className="space-y-2">
          {draft.evidence.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg">
              <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border flex-shrink-0 mt-0.5', DIRECTION_DISPLAY_CLASS[item.direction])}>
                {item.direction}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">{item.title}</p>
                {item.description && <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 leading-relaxed">{item.description}</p>}
              </div>
              <span className="text-[10px] text-[var(--color-text-tertiary)] flex-shrink-0 mt-0.5">{item.weight}</span>
              <button onClick={() => removeEvidence(item.id)} className="text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add evidence form */}
      <div className="border border-[var(--color-border)] rounded-lg p-4 space-y-3">
        <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Add Evidence</p>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Evidence title"
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500/50 transition-colors"
        />
        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Brief description (optional)"
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none resize-none leading-relaxed focus:border-blue-500/50 transition-colors"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1.5">Direction</p>
            <div className="flex flex-col gap-1">
              {DIRECTIONS.map(({ value, label, activeClass }) => (
                <button
                  key={value}
                  onClick={() => setForm((f) => ({ ...f, direction: value }))}
                  className={cn(
                    'text-xs py-1.5 rounded border transition-colors text-left px-2',
                    form.direction === value ? activeClass : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-border-strong)]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1.5">Weight</p>
            <div className="flex flex-col gap-1">
              {WEIGHTS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setForm((f) => ({ ...f, weight: value }))}
                  className={cn(
                    'text-xs py-1.5 rounded border transition-colors text-left px-2',
                    form.weight === value
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                      : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-border-strong)]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={addEvidence}
          disabled={!form.title.trim()}
          className={cn(
            'w-full py-2 rounded-lg text-xs font-semibold transition-colors',
            form.title.trim()
              ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30'
              : 'bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] cursor-not-allowed'
          )}
        >
          + Add
        </button>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Tags <span className="text-[var(--color-text-tertiary)] font-normal normal-case">(optional — press Enter or comma to add)</span>
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {draft.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
              {tag}
              <button onClick={() => removeTag(tag)} className="text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="e.g. russia-ukraine, ceasefire"
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-blue-500/50 transition-colors"
        />
      </div>
    </div>
  )
}
