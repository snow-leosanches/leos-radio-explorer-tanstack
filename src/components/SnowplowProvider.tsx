import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { trackPageView } from '../lib/snowplow'

export function SnowplowProvider() {
  const { pathname, search } = useRouterState({ select: (s) => s.location })

  useEffect(() => {
    trackPageView()
  }, [pathname, search])

  return null
}
