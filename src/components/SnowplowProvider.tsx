import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { initSnowplow, trackPageView } from '../lib/snowplow'

let initialized = false

export function SnowplowProvider() {
  const { pathname, search } = useRouterState({ select: (s) => s.location })

  // Initialize once on mount
  useEffect(() => {
    if (!initialized) {
      initSnowplow()
      initialized = true
    }
  }, [])

  // Track a page view on every navigation
  useEffect(() => {
    trackPageView()
  }, [pathname, search])

  return null
}
