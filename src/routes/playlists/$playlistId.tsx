import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { ChevronRight, Play } from 'lucide-react'
import { usePlaylists } from '../../context/PlaylistContext'
import { usePlayer } from '../../context/PlayerContext'
import StationCard from '../../components/ui/StationCard'
import { trackPlaylistStartedSpec } from '../../../snowtype/snowplow'

export const Route = createFileRoute('/playlists/$playlistId')({
  head: () => ({ meta: [{ title: "Playlist · Leo's Radio Explorer" }] }),
  component: PlaylistDetailPage,
})

function PlaylistDetailPage() {
  const { playlistId } = Route.useParams()
  const { playlists } = usePlaylists()
  const { play } = usePlayer()
  const trackedRef = useRef(false)

  const playlist = playlists.find((p) => p.id === playlistId)

  useEffect(() => {
    if (!playlist) return
    trackedRef.current = false
  }, [playlistId])

  function handlePlayAll() {
    if (!playlist || playlist.stations.length === 0) return
    play(playlist.stations[0])

    if (!trackedRef.current) {
      trackedRef.current = true
      try {
        trackPlaylistStartedSpec({ playlist_id: playlist.id, playlist_name: playlist.name })
      } catch (e) {
        console.error('[Snowplow] Error tracking playlist_started:', e)
      }
    }
  }

  if (!playlist) {
    return (
      <main className="page-wrap px-4 py-16 text-center">
        <p className="text-3xl">🎵</p>
        <p className="mt-3 text-base font-semibold text-[var(--sea-ink)]">Playlist not found</p>
        <Link to="/playlists" className="mt-4 inline-block text-sm text-[var(--lagoon-deep)] no-underline">
          ← Back to Playlists
        </Link>
      </main>
    )
  }

  return (
    <main className="pb-16">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--line)] bg-[var(--header-bg)]">
        <nav className="page-wrap flex items-center gap-1.5 px-4 py-3 text-xs font-medium text-[var(--sea-ink-soft)]">
          <Link to="/playlists" className="nav-link text-xs">Playlists</Link>
          <ChevronRight size={12} />
          <span className="text-[var(--sea-ink)]">{playlist.name}</span>
        </nav>
      </div>

      <div className="page-wrap mt-8 px-4">
        <h1 className="section-heading">{playlist.name}</h1>
        <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
          {playlist.stations.length} station{playlist.stations.length !== 1 ? 's' : ''}
        </p>

        {playlist.stations.length > 0 && (
          <button
            onClick={handlePlayAll}
            data-sp-button-label="Play all stations in playlist"
            className="mt-4 flex items-center gap-2 rounded-xl bg-[var(--lagoon-deep)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Play size={16} />
            Play All
          </button>
        )}

        {playlist.stations.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-[var(--sea-ink-soft)]">
              This playlist is empty. Visit a station page to add it here.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {playlist.stations.map((station) => (
              <StationCard key={station.stationuuid} station={station} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
