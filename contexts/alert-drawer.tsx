'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

const SEEN_KEY = 'geopol:alerts-seen-at'

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
  const [unreadCount, setUnreadCount] = useState(0)

  // On mount, count critical/high events since the last "mark all read"
  useEffect(() => {
    const seenAt = localStorage.getItem(SEEN_KEY)

    fetch('/api/events?limit=50')
      .then((r) => r.json())
      .then((events: Array<{ severity: string; date: string; createdAt?: string }>) => {
        const highPriority = events.filter(
          (e) => e.severity === 'critical' || e.severity === 'high'
        )
        if (!seenAt) {
          setUnreadCount(Math.min(highPriority.length, 9))
          return
        }
        const seenDate = new Date(seenAt)
        const unseen = highPriority.filter((e) => {
          const ts = e.createdAt ?? e.date
          return new Date(ts) > seenDate
        })
        setUnreadCount(Math.min(unseen.length, 9))
      })
      .catch(() => setUnreadCount(0))
  }, [])

  const markAllRead = () => {
    localStorage.setItem(SEEN_KEY, new Date().toISOString())
    setUnreadCount(0)
  }

  return (
    <AlertDrawerContext.Provider
      value={{
        open,
        unreadCount,
        openDrawer: () => setOpen(true),
        closeDrawer: () => setOpen(false),
        markAllRead,
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
