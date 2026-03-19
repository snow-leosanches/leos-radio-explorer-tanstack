import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import HeroBanner from '../components/home/HeroBanner'
import FeaturedRail from '../components/home/FeaturedRail'
import GenreGrid from '../components/home/GenreGrid'
import StationCard from '../components/ui/StationCard'
import SectionHeader from '../components/ui/SectionHeader'
import { SkeletonGrid } from '../components/ui/SkeletonCard'
import { getTopStations, getCountries } from '../lib/radio-browser'
import { queryKeys } from '../lib/query-keys'
import { useRecentlyPlayed } from '../hooks/useRecentlyPlayed'

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: "Discover · Leo's Radio Explorer" }] }),
  component: Home,
})

function Home() {
  return (
    <div>
      <HeroBanner />

      <div className="flex flex-col gap-14 pb-16">
        <RecentlyPlayedSection />
        <FeaturedRail />
        <GenreGrid />
        <TrendingSection />
        <CountryStrip />
      </div>
    </div>
  )
}

// ─── Recently Played ──────────────────────────────────────────────────────────

function RecentlyPlayedSection() {
  const recent = useRecentlyPlayed()

  // Only render once the user has played at least one station
  if (recent.length === 0) return null

  return (
    <section className="page-wrap px-4">
      <SectionHeader
        title="Recently Played"
        subtitle="Jump back in"
      />

      <div className="-mx-4 mt-6 overflow-x-auto px-4">
        <div className="flex gap-3 pb-4" style={{ width: 'max-content' }}>
          {recent.map((station, i) => (
            <div
              key={station.stationuuid}
              className="w-44 rise-in flex-shrink-0"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <StationCard station={station} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Trending Now ─────────────────────────────────────────────────────────────

function TrendingSection() {
  const { data: stations, isLoading, isError } = useQuery({
    queryKey: queryKeys.stations.top(12),
    queryFn: () => getTopStations(12),
  })

  return (
    <section className="page-wrap px-4">
      <SectionHeader
        title="Trending Now"
        subtitle="Most-voted stations right now"
        href="/genres"
        hrefLabel="See more"
      />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading && <SkeletonGrid count={8} variant="card" />}

        {isError && (
          <p className="col-span-full text-sm text-[var(--sea-ink-soft)]">
            Could not load stations.
          </p>
        )}

        {stations?.slice(0, 8).map((station, i) => (
          <div
            key={station.stationuuid}
            className="rise-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <StationCard station={station} />
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Country Strip ────────────────────────────────────────────────────────────

const FEATURED_COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany',        flag: '🇩🇪' },
  { code: 'BR', name: 'Brazil',         flag: '🇧🇷' },
  { code: 'FR', name: 'France',         flag: '🇫🇷' },
  { code: 'JP', name: 'Japan',          flag: '🇯🇵' },
  { code: 'AU', name: 'Australia',      flag: '🇦🇺' },
  { code: 'ES', name: 'Spain',          flag: '🇪🇸' },
]

function CountryStrip() {
  const { data: countries } = useQuery({
    queryKey: queryKeys.countries.all(),
    queryFn: () => getCountries(),
  })

  // Merge static list with live station counts
  const enriched = FEATURED_COUNTRIES.map((c) => {
    const live = countries?.find((x) => x.iso_3166_1.toUpperCase() === c.code)
    return { ...c, stationcount: live?.stationcount ?? null }
  })

  return (
    <section className="page-wrap px-4">
      <SectionHeader
        title="Radio Around the World"
        subtitle="Tune into a country"
        href="/countries"
        hrefLabel="All countries"
      />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {enriched.map((c) => (
          <Link
            key={c.code}
            to="/countries/$country"
            params={{ country: c.code }}
            className="group island-shell flex flex-col items-center gap-2 rounded-2xl p-4 no-underline transition hover:-translate-y-0.5"
          >
            <span className="text-3xl">{c.flag}</span>
            <div className="text-center">
              <p className="text-xs font-semibold text-[var(--sea-ink)]">{c.name}</p>
              {c.stationcount !== null && (
                <p className="text-[10px] text-[var(--sea-ink-soft)]">
                  {c.stationcount.toLocaleString()} stations
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
