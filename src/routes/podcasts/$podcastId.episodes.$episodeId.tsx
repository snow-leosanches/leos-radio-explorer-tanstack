import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Play, Pause } from 'lucide-react'
import { getPodcastById, getPodcastEpisodes } from '../../lib/itunes'
import { trackPodcastEpisodeStartedSpec } from '../../../snowtype/snowplow'

export const Route = createFileRoute('/podcasts/$podcastId/episodes/$episodeId')({
  head: () => ({ meta: [{ title: "Episode · Leo's Radio Explorer" }] }),
  component: EpisodePage,
})

function EpisodePage() {
  const { podcastId, episodeId } = Route.useParams()
  const [playing, setPlaying] = useState(false)
  const [tracked, setTracked] = useState(false)

  const { data: podcast } = useQuery({
    queryKey: ['podcasts', 'detail', podcastId],
    queryFn: () => getPodcastById(podcastId),
  })

  const { data: episodes } = useQuery({
    queryKey: ['podcasts', 'episodes', podcastId],
    queryFn: () => getPodcastEpisodes(podcastId, 50),
    enabled: !!podcast,
  })

  const episode = episodes?.find((ep) => ep.id === episodeId)

  function handlePlay() {
    if (!episode) return
    setPlaying((p) => !p)

    if (!tracked) {
      setTracked(true)
      try {
        trackPodcastEpisodeStartedSpec({
          episode_id: episode.id,
          episode_name: episode.name,
          guest_name: episode.guestName,
        })
      } catch (e) {
        console.error('[Snowplow] Error tracking podcast_episode_started:', e)
      }
    }
  }

  // Reset tracked state when episode changes
  useEffect(() => {
    setTracked(false)
    setPlaying(false)
  }, [episodeId])

  if (!episode && episodes) {
    return (
      <main className="page-wrap px-4 py-16 text-center">
        <p className="text-3xl">🎙️</p>
        <p className="mt-3 text-base font-semibold text-[var(--sea-ink)]">Episode not found</p>
        <Link to="/podcasts/$podcastId" params={{ podcastId }} className="mt-4 inline-block text-sm text-[var(--lagoon-deep)] no-underline">
          ← Back to Podcast
        </Link>
      </main>
    )
  }

  return (
    <main className="pb-16">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--line)] bg-[var(--header-bg)]">
        <nav className="page-wrap flex items-center gap-1.5 px-4 py-3 text-xs font-medium text-[var(--sea-ink-soft)]">
          <Link to="/podcasts" className="nav-link text-xs">Podcasts</Link>
          <ChevronRight size={12} />
          <Link to="/podcasts/$podcastId" params={{ podcastId }} className="nav-link text-xs">
            {podcast?.name ?? 'Podcast'}
          </Link>
          <ChevronRight size={12} />
          <span className="text-[var(--sea-ink)]">{episode?.name ?? 'Episode'}</span>
        </nav>
      </div>

      <div className="page-wrap mt-8 px-4">
        {!episode ? (
          <div className="flex flex-col gap-4">
            <div className="skeleton-pulse h-8 w-3/4 rounded-lg" />
            <div className="skeleton-pulse h-4 w-1/3 rounded" />
            <div className="skeleton-pulse mt-4 h-32 rounded-2xl" />
          </div>
        ) : (
          <>
            <p className="island-kicker mb-2">{podcast?.name}</p>
            <h1 className="section-heading">{episode.name}</h1>
            <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
              {new Date(episode.publishedAt).toLocaleDateString()} ·{' '}
              {episode.durationMs > 0 ? `${Math.round(episode.durationMs / 60000)} min` : 'Unknown length'}
            </p>

            {/* Play button */}
            <button
              onClick={handlePlay}
              disabled={!episode.audioUrl}
              data-sp-button-label={playing ? 'Pause episode' : 'Play episode'}
              className="mt-6 flex items-center gap-2 rounded-xl bg-[var(--lagoon-deep)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
              {playing ? 'Pause' : 'Play Episode'}
            </button>

            {episode.description && (
              <div className="island-shell mt-8 rounded-2xl p-6">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-[var(--sea-ink-soft)]">
                  About this episode
                </h2>
                <p className="text-sm leading-relaxed text-[var(--sea-ink)]">{episode.description}</p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
