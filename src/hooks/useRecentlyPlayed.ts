import { useEffect, useState } from 'react'
import { getRecentlyPlayed } from '../lib/recently-played'
import type { Station } from '../lib/radio-browser'

/**
 * Returns the list of recently played stations (up to 10), persisted in
 * localStorage. Updates reactively when a new station starts playing, including
 * across tabs via the `storage` event.
 */
export function useRecentlyPlayed(): Station[] {
  const [recent, setRecent] = useState<Station[]>(getRecentlyPlayed)

  useEffect(() => {
    function refresh() {
      setRecent(getRecentlyPlayed())
    }
    window.addEventListener('recently-played-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('recently-played-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return recent
}
