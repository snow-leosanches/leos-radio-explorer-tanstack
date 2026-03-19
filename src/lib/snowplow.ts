import {
  newTracker,
  trackPageView,
  trackStructEvent,
  trackSelfDescribingEvent,
  enableActivityTracking,
} from '@snowplow/browser-tracker'

export { trackPageView, trackStructEvent, trackSelfDescribingEvent }

const TRACKER_NAMESPACE = 'sp'

export function initSnowplow(): void {
  if (typeof window === 'undefined') return

  const collectorUrl = import.meta.env.VITE_SNOWPLOW_COLLECTOR_URL
  const appId = 'leos-radio-explorer-tanstack'

  if (!collectorUrl) {
    console.warn(
      '[Snowplow] VITE_SNOWPLOW_COLLECTOR_URL is not set — tracking disabled.',
    )
    return
  }

  newTracker(TRACKER_NAMESPACE, collectorUrl, {
    appId,
    platform: 'web',
    cookieLifetime: 63072000, // 2 years
    sessionCookieTimeout: 1800, // 30 min
    contexts: {
      webPage: true,
      performanceTiming: true,
    },
  })

  enableActivityTracking({ minimumVisitLength: 10, heartbeatDelay: 10 })
}
