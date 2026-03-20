import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Bell, BellOff } from 'lucide-react'
import { getPodcastById, getPodcastEpisodes } from '../../lib/itunes'
import { usePodcasts } from '../../context/PodcastContext'
import {
  trackPodcastVisitedSpec,
  trackPodcastSubscribedSpec,
  trackPodcastUnsubscribedSpec,
} from '../../../snowtype/snowplow'

export const Route = createFileRoute('/podcasts/$podcastId')({
  head: () => ({ meta: [{ title: "Podcast · Leo's Radio Explorer" }] }),
  component: PodcastDetailPage,
})

function PodcastDetailPage() {
  const { podcastId } = Route.useParams()
  const { subscribe, unsubscribe, isSubscribed } = usePodcasts()
  const subscribed = isSubscribed(podcastId)

  const { data: podcast, isLoading: podcastLoading } = useQuery({
    queryKey: ['podcasts', 'detail', podcastId],
    queryFn: () => getPodcastById(podcastId),
  })

  const { data: episodes, isLoading: episodesLoading } = useQuery({
    queryKey: ['podcasts', 'episodes', podcastId],
    queryFn: () => getPodcastEpisodes(podcastId, 20),
    enabled: !!podcast,
  })

  useEffect(() => {
    if (!podcast) return
    try {
      trackPodcastVisitedSpec({ podcast_id: podcast.id, podcast_name: podcast.name })
    } catch (e) {
      console.error('[Snowplow] Error tracking podcast_visited:', e)
    }
  }, [podcast?.id])

  function handleSubscribeToggle() {
    if (!podcast) return
    if (subscribed) {
      unsubscribe(podcast.id)
      try {
        trackPodcastUnsubscribedSpec({ podcast_id: podcast.id, podcast_name: podcast.name })
      } catch (e) {
        console.error('[Snowplow] Error tracking podcast_unsubscribed:', e)
      }
    } else {
      subscribe(podcast)
      try {
        trackPodcastSubscribedSpec({ podcast_id: podcast.id, podcast_name: podcast.name })
      } catch (e) {
        console.error('[Snowplow] Error tracking podcast_subscribed:', e)
      }
    }
  }

  if (podcastLoading) {
    return (
      <main className="page-wrap px-4 py-12">
        <div className="skeleton-pulse mb-6 h-8 w-64 rounded-lg" />
        <div className="skeleton-pulse h-48 w-full rounded-2xl" />
      </main>
    )
  }

  if (!podcast) {
    return (
      <main className="page-wrap px-4 py-16 text-center">
        <p className="text-3xl">🎙️</p>
        <p className="mt-3 text-base font-semibold text-[var(--sea-ink)]">Podcast not found</p>
        <Link to="/podcasts" className="mt-4 inline-block text-sm text-[var(--lagoon-deep)] no-underline">
          ← Back to Podcasts
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
          <span className="text-[var(--sea-ink)]">{podcast.name}</span>
        </nav>
      </div>

      {/* Hero */}
      <div className="page-wrap mt-8 flex flex-col gap-6 px-4 sm:flex-row sm:items-start sm:gap-8">
        <img
          src={podcast.artwork}
          alt={podcast.name}
          className="h-40 w-40 flex-shrink-0 rounded-2xl object-cover shadow-lg sm:h-52 sm:w-52"
        />
        <div className="flex flex-1 flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--sea-ink-soft)]">
            {podcast.genre}
          </p>
          <h1 className="section-heading">{podcast.name}</h1>
          <p className="text-sm text-[var(--sea-ink-soft)]">{podcast.author}</p>
          {podcast.description && (
            <p className="mt-1 line-clamp-3 text-sm text-[var(--sea-ink-soft)]">
              {podcast.description}
            </p>
          )}
          <button
            onClick={handleSubscribeToggle}
            data-sp-button-label={subscribed ? 'Unsubscribe from podcast' : 'Subscribe to podcast'}
            className="mt-2 flex w-fit items-center gap-2 rounded-xl bg-[var(--lagoon-deep)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {subscribed ? <BellOff size={16} /> : <Bell size={16} />}
            {subscribed ? 'Unsubscribe' : 'Subscribe'}
          </button>
        </div>
      </div>

      {/* Episodes */}
      <div className="page-wrap mt-10 px-4">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--sea-ink-soft)]">
          Episodes
        </h2>
        {episodesLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-pulse h-20 rounded-2xl" />
            ))}
          </div>
        )}
        {episodes && (
          <div className="flex flex-col gap-3">
            {episodes.map((ep) => (
              <Link
                key={ep.id}
                to="/podcasts/$podcastId/episodes/$episodeId"
                params={{ podcastId, episodeId: ep.id }}
                className="island-shell flex flex-col gap-1 rounded-2xl p-4 no-underline transition hover:-translate-y-0.5"
              >
                <p className="text-sm font-semibold text-[var(--sea-ink)]">{ep.name}</p>
                <p className="text-xs text-[var(--sea-ink-soft)]">
                  {new Date(ep.publishedAt).toLocaleDateString()} ·{' '}
                  {ep.durationMs > 0 ? `${Math.round(ep.durationMs / 60000)} min` : 'Unknown length'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
