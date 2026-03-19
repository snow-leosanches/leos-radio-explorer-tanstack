import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Station } from '../lib/radio-browser'

const STORAGE_KEY = 'radio-explorer:library'

// ─── Context ──────────────────────────────────────────────────────────────────

export interface LibraryContextValue {
  savedStations: Station[]
  isSaved: (uuid: string) => boolean
  save: (station: Station) => void
  remove: (uuid: string) => void
  toggle: (station: Station) => void
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

function readFromStorage(): Station[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Station[]) : []
  } catch {
    return []
  }
}

function writeToStorage(stations: Station[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stations))
  } catch {
    // ignore quota errors
  }
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [savedStations, setSavedStations] = useState<Station[]>([])

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    setSavedStations(readFromStorage())
  }, [])

  const save = useCallback((station: Station) => {
    setSavedStations((prev) => {
      if (prev.some((s) => s.stationuuid === station.stationuuid)) return prev
      const next = [station, ...prev]
      writeToStorage(next)
      return next
    })
  }, [])

  const remove = useCallback((uuid: string) => {
    setSavedStations((prev) => {
      const next = prev.filter((s) => s.stationuuid !== uuid)
      writeToStorage(next)
      return next
    })
  }, [])

  const isSaved = useCallback(
    (uuid: string) => savedStations.some((s) => s.stationuuid === uuid),
    [savedStations],
  )

  const toggle = useCallback(
    (station: Station) => {
      if (isSaved(station.stationuuid)) {
        remove(station.stationuuid)
      } else {
        save(station)
      }
    },
    [isSaved, save, remove],
  )

  return (
    <LibraryContext.Provider value={{ savedStations, isSaved, save, remove, toggle }}>
      {children}
    </LibraryContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used within <LibraryProvider>')
  return ctx
}
