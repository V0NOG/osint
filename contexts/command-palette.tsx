'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface CommandPaletteContextValue {
  open: boolean
  openPalette: () => void
  closePalette: () => void
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null)

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  const openPalette = () => setOpen(true)
  const closePalette = () => setOpen(false)

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('geopol:open-palette', handler)
    return () => window.removeEventListener('geopol:open-palette', handler)
  }, [])

  return (
    <CommandPaletteContext.Provider value={{ open, openPalette, closePalette }}>
      {children}
    </CommandPaletteContext.Provider>
  )
}

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext)
  if (!ctx) throw new Error('useCommandPalette must be used within CommandPaletteProvider')
  return ctx
}
