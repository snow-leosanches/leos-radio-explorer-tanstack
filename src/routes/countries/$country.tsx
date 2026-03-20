import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import StationGrid from '../../components/ui/StationGrid'
import { flagEmoji } from '../../lib/genre-meta'
import { getCountries, getStationsByCountry } from '../../lib/radio-browser'
import { queryKeys } from '../../lib/query-keys'
import { trackCountryVisitedSpec } from '../../../snowtype/snowplow'

export const Route = createFileRoute('/countries/$country')({
  head: ({ params }) => ({
    meta: [{ title: `${params.country} Radio · Leo's Radio Explorer` }],
  }),
  component: CountryStations,
})

function CountryStations() {
  const { country: countryCode } = Route.useParams()
  const flag = flagEmoji(countryCode)

  // Fetch country metadata (name + station count) from the countries list
  const { data: countries } = useQuery({
    queryKey: queryKeys.countries.all(),
    queryFn: () => getCountries(),
  })

  const countryMeta = countries?.find(
    (c) => c.iso_3166_1.toUpperCase() === countryCode.toUpperCase(),
  )

  const countryName = countryMeta?.name ?? countryCode

  useEffect(() => {
    try {
      trackCountryVisitedSpec({ country_name: countryName, country_code: countryCode })
    } catch (e) {
      console.error('[Snowplow] Error tracking country_visited:', e)
    }
  }, [countryCode, countryName])

  return (
    <main className="pb-12">
      {/* Hero banner */}
      <div className="island-shell border-x-0 border-t-0 px-4 py-14">
        <div className="page-wrap">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1.5 text-xs font-medium text-[var(--sea-ink-soft)]">
            <Link to="/countries" className="nav-link text-xs">
              Countries
            </Link>
            <ChevronRight size={12} />
            <span className="text-[var(--sea-ink)]">{countryName}</span>
          </nav>

          <div className="flex items-center gap-5">
            <span className="text-6xl leading-none">{flag}</span>
            <div>
              <h1 className="section-heading">{countryName}</h1>
              <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                {countryMeta
                  ? `${countryMeta.stationcount.toLocaleString()} stations · sorted by popularity`
                  : 'Live radio stations'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Station grid */}
      <div className="page-wrap mt-8 px-4">
        <StationGrid
          queryKey={queryKeys.stations.byCountry(countryCode)}
          fetcher={(offset) => getStationsByCountry(countryCode, undefined, offset)}
          emptyMessage={`No stations found for ${countryName}.`}
        />
      </div>
    </main>
  )
}
