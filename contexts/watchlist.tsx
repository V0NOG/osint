'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'

export type WatchlistEntityType = 'country' | 'event' | 'forecast'

interface WatchlistState {
  countries: string[]
  events: string[]
  forecasts: string[]
}

interface WatchlistContextValue {
  watchlist: WatchlistState
  watch: (type: WatchlistEntityType, id: string) => void
  unwatch: (type: WatchlistEntityType, id: string) => void
  isWatched: (type: WatchlistEntityType, id: string) => boolean
  totalCount: number
}

const STORAGE_KEY = 'geopol:watchlist'

const DEFAULT_STATE: WatchlistState = { countries: [], events: [], forecasts: [] }

function loadFromStorage(): WatchlistState {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw)
    return {
      countries: Array.isArray(parsed.countries) ? parsed.countries : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
      forecasts: Array.isArray(parsed.forecasts) ? parsed.forecasts : [],
    }
  } catch {
    return DEFAULT_STATE
  }
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null)

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistState>(DEFAULT_STATE)

  // Load from localStorage after mount (avoids SSR/hydration mismatch)
  useEffect(() => {
    setWatchlist(loadFromStorage())
  }, [])

  // Persist on every change (skip initial default-state write)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist))
    }
  }, [watchlist])

  const watch = useCallback((type: WatchlistEntityType, id: string) => {
    setWatchlist((prev) => {
      const key = `${type}s` as keyof WatchlistState
      const list = Array.isArray(prev[key]) ? prev[key] : []
      if (list.includes(id)) return prev
      return { ...prev, [key]: [...list, id] }
    })
  }, [])

  const unwatch = useCallback((type: WatchlistEntityType, id: string) => {
    setWatchlist((prev) => {
      const key = `${type}s` as keyof WatchlistState
      const list = Array.isArray(prev[key]) ? prev[key] : []
      return { ...prev, [key]: list.filter((x) => x !== id) }
    })
  }, [])

  const isWatched = useCallback(
    (type: WatchlistEntityType, id: string) => {
      const key = `${type}s` as keyof WatchlistState
      const list = Array.isArray(watchlist[key]) ? watchlist[key] : []
      return list.includes(id)
    },
    [watchlist]
  )

  const totalCount =
    watchlist.countries.length + watchlist.events.length + watchlist.forecasts.length

  return (
    <WatchlistContext.Provider value={{ watchlist, watch, unwatch, isWatched, totalCount }}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider')
  return ctx
}
