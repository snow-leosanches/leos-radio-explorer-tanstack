import type { Station } from './radio-browser'

const KEY = 'radio-explorer:recent'
const MAX = 10

export function addToRecentlyPlayed(station: Station): void {
  try {
    const stored = localStorage.getItem(KEY)
    const current: Station[] = stored ? JSON.parse(stored) : []
    const updated = [
      station,
      ...current.filter((s) => s.stationuuid !== station.stationuuid),
    ].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event('recently-played-updated'))
  } catch {
    // localStorage unavailable — silently skip
  }
}

export function getRecentlyPlayed(): Station[] {
  try {
    const stored = localStorage.getItem(KEY)
    return stored ? (JSON.parse(stored) as Station[]) : []
  } catch {
    return []
  }
}
