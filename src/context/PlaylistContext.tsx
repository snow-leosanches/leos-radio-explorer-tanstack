import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Playlist } from '../types/playlist'
import type { Station } from '../lib/radio-browser'

const STORAGE_KEY = 'radio-explorer:playlists'

interface PlaylistContextValue {
  playlists: Playlist[]
  createPlaylist: (name: string) => Playlist
  deletePlaylist: (id: string) => void
  addStation: (playlistId: string, station: Station) => void
  removeStation: (playlistId: string, stationUuid: string) => void
}

const PlaylistContext = createContext<PlaylistContextValue | null>(null)

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Playlist[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists))
  }, [playlists])

  const createPlaylist = useCallback((name: string): Playlist => {
    const playlist: Playlist = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      stations: [],
    }
    setPlaylists((prev) => [playlist, ...prev])
    return playlist
  }, [])

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const addStation = useCallback((playlistId: string, station: Station) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId && !p.stations.some((s) => s.stationuuid === station.stationuuid)
          ? { ...p, stations: [...p.stations, station] }
          : p,
      ),
    )
  }, [])

  const removeStation = useCallback((playlistId: string, stationUuid: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? { ...p, stations: p.stations.filter((s) => s.stationuuid !== stationUuid) }
          : p,
      ),
    )
  }, [])

  return (
    <PlaylistContext.Provider
      value={{ playlists, createPlaylist, deletePlaylist, addStation, removeStation }}
    >
      {children}
    </PlaylistContext.Provider>
  )
}

export function usePlaylists() {
  const ctx = useContext(PlaylistContext)
  if (!ctx) throw new Error('usePlaylists must be used within PlaylistProvider')
  return ctx
}
