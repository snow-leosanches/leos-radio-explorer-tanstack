import { useQuery } from '@tanstack/react-query'
import { Loader2, Pause, Play } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { getTopStations, parseTags, stationGradient, type Station } from '../../lib/radio-browser'
import { queryKeys } from '../../lib/query-keys'
import SectionHeader from '../ui/SectionHeader'
import { SkeletonGrid } from '../ui/SkeletonCard'

export default function FeaturedRail() {
  const {
    data: stations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.stations.top(20),
    queryFn: () => getTopStations(20),
  })

  return (
    <section className="page-wrap px-4">
      <SectionHeader
        title="Featured Stations"
        subtitle="Top-voted stations from around the world"
        href="/genres"
        hrefLabel="Browse all genres"
      />

      <div className="-mx-4 mt-6 overflow-x-auto px-4">
        <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
          {isLoading && (
            <div className="flex gap-4">
              <SkeletonGrid count={8} variant="featured" />
            </div>
          )}

          {isError && (
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Could not load stations. Check your connection and try again.
            </p>
          )}

          {stations?.map((station, i) => (
            <FeaturedCard key={station.stationuuid} station={station} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedCard({ station, index }: { station: Station; index: number }) {
  const { state, toggle } = usePlayer()
  const isActive = state.station?.stationuuid === station.stationuuid
  const isPlaying = isActive && state.status === 'playing'
  const isLoading = isActive && state.status === 'loading'
  const gradient = stationGradient(station.stationuuid)
  const tags = parseTags(station.tags)

  return (
    <button
      onClick={() => toggle(station)}
      className="group w-44 flex-shrink-0 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-left transition hover:-translate-y-1 hover:shadow-lg"
      style={{ animationDelay: `${index * 40}ms` }}
      aria-label={`Play ${station.name}`}
    >
      {/* Artwork */}
      <div
        className="relative aspect-square w-full overflow-hidden"
        style={{ background: gradient }}
      >
        {station.favicon && (
          <img
            src={station.favicon}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        )}

        {/* Play overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-200 ${
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
            {isLoading ? (
              <Loader2 size={18} className="animate-spin text-[var(--lagoon-deep)]" />
            ) : isPlaying ? (
              <Pause size={18} fill="var(--lagoon-deep)" className="text-[var(--lagoon-deep)]" />
            ) : (
              <Play
                size={18}
                fill="var(--lagoon-deep)"
                className="translate-x-0.5 text-[var(--lagoon-deep)]"
              />
            )}
          </div>
        </div>

        {isPlaying && (
          <span className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-[var(--lagoon)] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            <span className="flex items-end gap-px" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-px rounded-full bg-white"
                  style={{
                    height: '9px',
                    animation: `eq-bar 0.7s ease-in-out ${i * 0.13}s infinite alternate`,
                  }}
                />
              ))}
            </span>
            Live
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-3">
        <p className="line-clamp-2 text-xs font-semibold leading-snug text-[var(--sea-ink)]">
          {station.name}
        </p>
        <p className="truncate text-[11px] text-[var(--sea-ink-soft)]">
          {tags[0] ?? station.country ?? 'Radio'}
        </p>
      </div>
    </button>
  )
}
