import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import StationGrid from '../../components/ui/StationGrid'
import { getGenreMeta } from '../../lib/genre-meta'
import { getStationsByTag } from '../../lib/radio-browser'
import { queryKeys } from '../../lib/query-keys'
import { trackGenreVisitedSpec } from '../../../snowtype/snowplow'

export const Route = createFileRoute('/genres/$genre')({
  head: ({ params }) => ({
    meta: [{ title: `${params.genre} · Leo's Radio Explorer` }],
  }),
  component: GenreStations,
})

function GenreStations() {
  const { genre } = Route.useParams()
  const meta = getGenreMeta(genre)

  useEffect(() => {
    try {
      trackGenreVisitedSpec({ genre_name: genre })
    } catch (e) {
      console.error('[Snowplow] Error tracking genre_visited:', e)
    }
  }, [genre])

  return (
    <main className="pb-12">
      {/* Hero banner */}
      <div
        className="relative overflow-hidden px-4 py-14"
        style={{ background: meta.color }}
      >
        {/* Decorative blob */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${meta.textColor} 0%, transparent 70%)`,
          }}
        />
        <div className="page-wrap relative z-10">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1.5 text-xs font-medium" style={{ color: meta.textColor, opacity: 0.7 }}>
            <Link to="/genres" className="no-underline hover:opacity-100" style={{ color: 'inherit' }}>
              Genres
            </Link>
            <ChevronRight size={12} />
            <span className="capitalize opacity-100">{genre}</span>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-5xl">{meta.emoji}</span>
            <div>
              <h1
                className="section-heading capitalize"
                style={{ color: meta.textColor }}
              >
                {genre}
              </h1>
              <p className="mt-1 text-sm" style={{ color: meta.textColor, opacity: 0.7 }}>
                Live stations · sorted by popularity
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Station grid */}
      <div className="page-wrap mt-8 px-4">
        <StationGrid
          queryKey={queryKeys.stations.byTag(genre)}
          fetcher={(offset) => getStationsByTag(genre, undefined, offset)}
          emptyMessage={`No stations found for "${genre}".`}
        />
      </div>
    </main>
  )
}
