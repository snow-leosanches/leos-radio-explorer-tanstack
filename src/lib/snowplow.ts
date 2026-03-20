import {
  newTracker,
  trackPageView,
  trackStructEvent,
  trackSelfDescribingEvent,
  enableActivityTracking,
} from '@snowplow/browser-tracker'
import {
  ButtonClickTrackingPlugin,
  enableButtonClickTracking,
} from '@snowplow/browser-plugin-button-click-tracking'
import {
  LinkClickTrackingPlugin,
  enableLinkClickTracking,
} from '@snowplow/browser-plugin-link-click-tracking'
import { PerformanceNavigationTimingPlugin } from '@snowplow/browser-plugin-performance-navigation-timing'
import { SiteTrackingPlugin } from '@snowplow/browser-plugin-site-tracking'
import { SignalsPlugin } from '@snowplow/signals-browser-plugin'

export { trackPageView, trackStructEvent, trackSelfDescribingEvent }

export const snowplowTracker =
  typeof window !== 'undefined'
    ? (() => {
        const collectorUrl = import.meta.env.VITE_SNOWPLOW_COLLECTOR_URL

        if (!collectorUrl) {
          console.warn(
            '[Snowplow] VITE_SNOWPLOW_COLLECTOR_URL is not set — tracking disabled.',
          )
          return null
        }

        const tracker = newTracker('sp', collectorUrl, {
          appId: 'leos-radio-explorer-tanstack',
          platform: 'web',
          cookieLifetime: 63072000, // 2 years
          sessionCookieTimeout: 1800, // 30 min
          contexts: {
            session: true,
            browser: true,
          },
          plugins: [
            PerformanceNavigationTimingPlugin(),
            SiteTrackingPlugin(),
            ButtonClickTrackingPlugin(),
            LinkClickTrackingPlugin(),
            SignalsPlugin(),
          ],
        })

        enableActivityTracking({ minimumVisitLength: 15, heartbeatDelay: 15 })
        enableButtonClickTracking()
        enableLinkClickTracking()

        return tracker
      })()
    : null
