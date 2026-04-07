'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface AlertDrawerContextValue {
  open: boolean
  unreadCount: number
  openDrawer: () => void
  closeDrawer: () => void
  markAllRead: () => void
}

const AlertDrawerContext = createContext<AlertDrawerContextValue | null>(null)

export function AlertDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(4)

  return (
    <AlertDrawerContext.Provider
      value={{
        open,
        unreadCount,
        openDrawer: () => setOpen(true),
        closeDrawer: () => setOpen(false),
        markAllRead: () => setUnreadCount(0),
      }}
    >
      {children}
    </AlertDrawerContext.Provider>
  )
}

export function useAlertDrawer() {
  const ctx = useContext(AlertDrawerContext)
  if (!ctx) throw new Error('useAlertDrawer must be used within AlertDrawerProvider')
  return ctx
}
