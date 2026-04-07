'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface ChipDef {
  value: string
  label: string
  /** Tailwind classes applied to the chip when active */
  activeClass: string
}

export interface DropdownOption {
  value: string
  label: string
}

interface FilterDropdownProps {
  label: string
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
}

export function FilterDropdown({ label, options, value, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
          'bg-[var(--color-bg-elevated)] border border-[var(--color-border)]',
          'text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]',
          open && 'border-[var(--color-border-strong)] text-[var(--color-text-primary)]'
        )}
      >
        {label}: {selected?.label ?? label}
        <ChevronDown
          className={cn('w-3 h-3 transition-transform duration-150', open && 'rotate-180')}
          strokeWidth={1.75}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 w-44 bg-[var(--color-bg-surface)] border border-[var(--color-border-strong)] rounded-lg shadow-xl overflow-hidden animate-fade-in">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={cn(
                'w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-left transition-colors duration-75',
                'hover:bg-[var(--color-bg-elevated)]',
                value === opt.value
                  ? 'text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-secondary)]'
              )}
            >
              {opt.label}
              {value === opt.value && (
                <Check className="w-3 h-3 text-[var(--color-accent-blue)]" strokeWidth={2} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface FilterChipBarProps {
  chips: ChipDef[]
  activeValues: Set<string>
  onToggle: (value: string) => void
  resultCount: number
  totalCount: number
  /** Optional dropdowns (Sort, Region etc.) rendered to the right of chips */
  dropdowns?: React.ReactNode
}

export function FilterChipBar({
  chips,
  activeValues,
  onToggle,
  resultCount,
  totalCount,
  dropdowns,
}: FilterChipBarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap px-4 py-2.5 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg mb-4">
      <div className="flex items-center gap-1.5 flex-wrap flex-1">
        {chips.map((chip) => {
          const isActive = activeValues.has(chip.value)
          return (
            <button
              key={chip.value}
              onClick={() => onToggle(chip.value)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-150',
                isActive
                  ? chip.activeClass
                  : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-secondary)]'
              )}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {dropdowns}
        {activeValues.size > 0 && (
          <span className="text-[11px] text-[var(--color-text-tertiary)] font-mono">
            {resultCount} of {totalCount}
          </span>
        )}
      </div>
    </div>
  )
}
