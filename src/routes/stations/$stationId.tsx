import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import StationDetailHero from '../../components/station/StationDetailHero'
import RelatedStations from '../../components/station/RelatedStations'
import { getStationByUuid, parseTags } from '../../lib/radio-browser'
import { queryKeys } from '../../lib/query-keys'
import { trackRadioVisitedSpec } from '../../../snowtype/snowplow'

export const Route = createFileRoute('/stations/$stationId')({
  head: ({ params }) => ({
    meta: [{ title: `Station · Leo's Radio Explorer` }],
    // Title is updated dynamically once the station loads
  }),
  component: StationDetailPage,
})

// ─── Skeleton hero ─────────────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div className="px-4 py-14">
      <div className="page-wrap flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8">
        <div className="skeleton-pulse h-40 w-40 flex-shrink-0 rounded-2xl sm:h-52 sm:w-52" />
        <div className="flex flex-1 flex-col gap-3">
          <div className="skeleton-pulse h-3 w-24 rounded" />
          <div className="skeleton-pulse h-8 w-64 rounded-lg" />
          <div className="skeleton-pulse h-4 w-40 rounded" />
          <div className="flex gap-2">
            <div className="skeleton-pulse h-5 w-16 rounded-full" />
            <div className="skeleton-pulse h-5 w-20 rounded-full" />
          </div>
          <div className="skeleton-pulse mt-2 h-11 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

function StationDetailPage() {
  const { stationId } = Route.useParams()

  const { data: station, isLoading, isError } = useQuery({
    queryKey: queryKeys.stations.byUuid(stationId),
    queryFn: () => getStationByUuid(stationId),
  })

  useEffect(() => {
    if (!station) return
    try {
      trackRadioVisitedSpec({
        station_id: station.stationuuid,
        station_name: station.name,
        genres: parseTags(station.tags),
        state: station.state || null,
        city: null,
      })
    } catch (e) {
      console.error('[Snowplow] Error tracking radio_visited:', e)
    }
  }, [station?.stationuuid])

  return (
    <main className="pb-16">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--line)] bg-[var(--header-bg)]">
        <nav className="page-wrap flex items-center gap-1.5 px-4 py-3 text-xs font-medium text-[var(--sea-ink-soft)]">
          <Link to="/" className="nav-link text-xs">
            Discover
          </Link>
          <ChevronRight size={12} />
          <span className="text-[var(--sea-ink)]">
            {station?.name ?? 'Station'}
          </span>
        </nav>
      </div>

      {/* Hero */}
      {isLoading && <HeroSkeleton />}

      {isError && (
        <div className="page-wrap px-4 py-16 text-center">
          <p className="text-3xl">📻</p>
          <p className="mt-3 text-base font-semibold text-[var(--sea-ink)]">Station not found</p>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            This station may no longer be available.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-xl bg-[var(--lagoon-deep)] px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:opacity-90"
          >
            Back to Discover
          </Link>
        </div>
      )}

      {station && (
        <>
          <StationDetailHero station={station} />

          {/* Metadata table */}
          <div className="page-wrap mt-8 px-4">
            <div className="island-shell rounded-2xl p-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--sea-ink-soft)]">
                Station Info
              </h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                {[
                  { label: 'Country', value: station.country || '—' },
                  { label: 'Language', value: station.language || '—' },
                  { label: 'Codec', value: station.codec || '—' },
                  { label: 'Bitrate', value: station.bitrate > 0 ? `${station.bitrate} kbps` : '—' },
                  { label: 'Votes', value: station.votes.toLocaleString() },
                  { label: 'Click trend', value: station.clicktrend > 0 ? `+${station.clicktrend}` : String(station.clicktrend) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs font-medium text-[var(--sea-ink-soft)]">{label}</dt>
                    <dd className="mt-0.5 text-sm font-semibold capitalize text-[var(--sea-ink)]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Related stations */}
          <RelatedStations station={station} />
        </>
      )}
    </main>
  )
}
