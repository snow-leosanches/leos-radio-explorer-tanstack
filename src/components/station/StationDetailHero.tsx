import { Link } from '@tanstack/react-router'
import { ExternalLink, Loader2, Pause, Play, Radio } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { flagEmoji } from '../../lib/genre-meta'
import { parseTags, stationGradient, type Station } from '../../lib/radio-browser'
import FavoriteButton from '../ui/FavoriteButton'
import GenrePill from '../ui/GenrePill'

interface StationDetailHeroProps {
  station: Station
}

export default function StationDetailHero({ station }: StationDetailHeroProps) {
  const { state, toggle } = usePlayer()

  const isActive = state.station?.stationuuid === station.stationuuid
  const isPlaying = isActive && state.status === 'playing'
  const isLoading = isActive && state.status === 'loading'
  const gradient = stationGradient(station.stationuuid)
  const tags = parseTags(station.tags)
  const flag = station.countrycode ? flagEmoji(station.countrycode) : null

  return (
    <div className="relative overflow-hidden">
      {/* Blurred background gradient from the station colour */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ background: gradient }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 backdrop-blur-3xl"
      />

      <div className="page-wrap relative z-10 px-4 py-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8">
          {/* Artwork */}
          <div
            className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-2xl shadow-2xl sm:h-52 sm:w-52"
            style={{ background: gradient }}
          >
            {station.favicon && (
              <img
                src={station.favicon}
                alt={station.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                }}
              />
            )}
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <span className="flex items-end gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-white"
                      style={{
                        height: '20px',
                        animation: `eq-bar 0.7s ease-in-out ${i * 0.12}s infinite alternate`,
                      }}
                    />
                  ))}
                </span>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <p className="island-kicker flex items-center gap-1.5">
              <Radio size={11} />
              Live Radio
            </p>

            <h1 className="section-heading leading-tight">{station.name}</h1>

            {/* Country + language */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--sea-ink-soft)]">
              {flag && station.countrycode && (
                <Link
                  to="/countries/$country"
                  params={{ country: station.countrycode.toUpperCase() }}
                  className="flex items-center gap-1.5 no-underline hover:text-[var(--lagoon-deep)]"
                >
                  <span>{flag}</span>
                  <span>{station.country || station.countrycode}</span>
                </Link>
              )}
              {station.language && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{station.language}</span>
                </>
              )}
              {station.bitrate > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{station.bitrate} kbps {station.codec && station.codec.toUpperCase()}</span>
                </>
              )}
            </div>

            {/* Genre tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <GenrePill key={tag} genre={tag} />
                ))}
              </div>
            )}

            {/* Actions row */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Play / Pause */}
              <button
                onClick={() => toggle(station)}
                className="flex items-center gap-2.5 rounded-xl bg-[var(--lagoon-deep)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isPlaying ? (
                  <Pause size={16} fill="currentColor" />
                ) : (
                  <Play size={16} fill="currentColor" className="translate-x-0.5" />
                )}
                {isLoading ? 'Connecting…' : isPlaying ? 'Pause' : 'Play'}
              </button>

              {/* Save to Library */}
              <FavoriteButton station={station} size="md" />

              {/* Homepage link */}
              {station.homepage && (
                <a
                  href={station.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink-soft)] transition hover:border-[var(--lagoon-deep)] hover:text-[var(--lagoon-deep)]"
                  aria-label="Visit station website"
                  title="Station website"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>

            {/* Vote count */}
            {station.votes > 0 && (
              <p className="text-xs text-[var(--sea-ink-soft)]">
                {station.votes.toLocaleString()} votes
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
