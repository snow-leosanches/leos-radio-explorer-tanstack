import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Podcast } from '../types/podcast'

const STORAGE_KEY = 'radio-explorer:podcast-subscriptions'

interface PodcastContextValue {
  subscriptions: Podcast[]
  subscribe: (podcast: Podcast) => void
  unsubscribe: (podcastId: string) => void
  isSubscribed: (podcastId: string) => boolean
}

const PodcastContext = createContext<PodcastContextValue | null>(null)

export function PodcastProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Podcast[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Podcast[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions))
  }, [subscriptions])

  const subscribe = useCallback((podcast: Podcast) => {
    setSubscriptions((prev) =>
      prev.some((p) => p.id === podcast.id) ? prev : [podcast, ...prev],
    )
  }, [])

  const unsubscribe = useCallback((podcastId: string) => {
    setSubscriptions((prev) => prev.filter((p) => p.id !== podcastId))
  }, [])

  const isSubscribed = useCallback(
    (podcastId: string) => subscriptions.some((p) => p.id === podcastId),
    [subscriptions],
  )

  return (
    <PodcastContext.Provider value={{ subscriptions, subscribe, unsubscribe, isSubscribed }}>
      {children}
    </PodcastContext.Provider>
  )
}

export function usePodcasts() {
  const ctx = useContext(PodcastContext)
  if (!ctx) throw new Error('usePodcasts must be used within PodcastProvider')
  return ctx
}
