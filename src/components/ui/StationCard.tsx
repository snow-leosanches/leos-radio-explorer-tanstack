import { Heart, Loader2, Pause, Play } from 'lucide-react'
import { useLibrary } from '../../context/LibraryContext'
import { usePlayer } from '../../context/PlayerContext'
import { parseTags, stationGradient, type Station } from '../../lib/radio-browser'

interface StationCardProps {
  station: Station
  /** Show as a compact horizontal row instead of a vertical card */
  variant?: 'card' | 'row'
}

export default function StationCard({ station, variant = 'card' }: StationCardProps) {
  const { state, toggle } = usePlayer()
  const { isSaved, toggle: toggleLibrary } = useLibrary()

  const isActive = state.station?.stationuuid === station.stationuuid
  const isPlaying = isActive && state.status === 'playing'
  const isLoading = isActive && state.status === 'loading'
  const saved = isSaved(station.stationuuid)
  const gradient = stationGradient(station.stationuuid)
  const tags = parseTags(station.tags)

  if (variant === 'row') {
    return (
      <div className="station-card flex items-center gap-3 p-3">
        {/* Artwork */}
        <div
          className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg"
          style={{ background: gradient }}
        >
          {station.favicon && (
            <img
              src={station.favicon}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          )}
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              {isLoading ? (
                <Loader2 size={16} className="animate-spin text-white" />
              ) : isPlaying ? (
                <span className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-0.5 rounded-full bg-white"
                      style={{
                        height: '12px',
                        animation: `eq-bar 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                      }}
                    />
                  ))}
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--sea-ink)]">{station.name}</p>
          <p className="truncate text-xs text-[var(--sea-ink-soft)]">
            {tags[0] ?? station.country ?? 'Radio'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleLibrary(station)
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--sea-ink-soft)] transition hover:text-[var(--lagoon-deep)]"
            aria-label={saved ? 'Remove from library' : 'Save to library'}
          >
            <Heart
              size={15}
              className={saved ? 'fill-[var(--lagoon-deep)] text-[var(--lagoon-deep)]' : ''}
            />
          </button>
          <button
            onClick={() => toggle(station)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--lagoon-deep)] text-white transition hover:opacity-90"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={14} fill="currentColor" />
            ) : (
              <Play size={14} fill="currentColor" />
            )}
          </button>
        </div>
      </div>
    )
  }

  // Default: card variant
  return (
    <div className="station-card group flex flex-col" onClick={() => toggle(station)}>
      {/* Artwork area */}
      <div
        className="relative aspect-square w-full overflow-hidden rounded-t-[calc(1rem-1px)]"
        style={{ background: gradient }}
      >
        {station.favicon && (
          <img
            src={station.favicon}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg">
            {isLoading ? (
              <Loader2 size={20} className="animate-spin text-[var(--lagoon-deep)]" />
            ) : isPlaying ? (
              <Pause size={20} fill="var(--lagoon-deep)" className="text-[var(--lagoon-deep)]" />
            ) : (
              <Play
                size={20}
                fill="var(--lagoon-deep)"
                className="translate-x-0.5 text-[var(--lagoon-deep)]"
              />
            )}
          </div>
        </div>

        {/* Live badge when playing */}
        {isPlaying && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-[var(--lagoon)] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Live
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-start justify-between gap-1">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--sea-ink)]">
            {station.name}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleLibrary(station)
            }}
            className="mt-0.5 flex-shrink-0 text-[var(--sea-ink-soft)] transition hover:text-[var(--lagoon-deep)]"
            aria-label={saved ? 'Remove from library' : 'Save to library'}
          >
            <Heart
              size={14}
              className={saved ? 'fill-[var(--lagoon-deep)] text-[var(--lagoon-deep)]' : ''}
            />
          </button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <span key={tag} className="genre-pill">
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="mt-auto text-xs text-[var(--sea-ink-soft)]">
          {station.country || 'International'}
          {station.bitrate > 0 && ` · ${station.bitrate}kbps`}
        </p>
      </div>
    </div>
  )
}
