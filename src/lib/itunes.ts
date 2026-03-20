// iTunes Search API — free, no auth required
// https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI

import type { Podcast, PodcastEpisode } from '../types/podcast'

interface ItunesResult {
  collectionId: number
  collectionName: string
  artistName: string
  description?: string
  artworkUrl600?: string
  artworkUrl100?: string
  feedUrl?: string
  primaryGenreName: string
}

interface ItunesFeedEpisode {
  trackId: number
  trackName: string
  description?: string
  episodeUrl?: string
  releaseDate: string
  trackTimeMillis?: number
}

export async function searchPodcasts(term: string, limit = 20): Promise<Podcast[]> {
  const url = new URL('https://itunes.apple.com/search')
  url.searchParams.set('term', term)
  url.searchParams.set('media', 'podcast')
  url.searchParams.set('limit', String(limit))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`iTunes API error: ${res.status}`)
  const json = await res.json()
  return (json.results as ItunesResult[]).map(mapPodcast)
}

export async function getPodcastById(id: string): Promise<Podcast | null> {
  const url = new URL('https://itunes.apple.com/lookup')
  url.searchParams.set('id', id)
  url.searchParams.set('media', 'podcast')
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`iTunes API error: ${res.status}`)
  const json = await res.json()
  const result = (json.results as ItunesResult[])[0]
  return result ? mapPodcast(result) : null
}

export async function getPodcastEpisodes(podcastId: string, limit = 20): Promise<PodcastEpisode[]> {
  const url = new URL('https://itunes.apple.com/lookup')
  url.searchParams.set('id', podcastId)
  url.searchParams.set('media', 'podcast')
  url.searchParams.set('entity', 'podcastEpisode')
  url.searchParams.set('limit', String(limit + 1))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`iTunes API error: ${res.status}`)
  const json = await res.json()
  // First result is the podcast itself; rest are episodes
  return (json.results as ItunesFeedEpisode[])
    .slice(1)
    .map((ep) => mapEpisode(ep, podcastId))
}

function mapPodcast(r: ItunesResult): Podcast {
  return {
    id: String(r.collectionId),
    name: r.collectionName,
    author: r.artistName,
    description: r.description ?? '',
    artwork: r.artworkUrl600 ?? r.artworkUrl100 ?? '',
    feedUrl: r.feedUrl ?? '',
    genre: r.primaryGenreName,
  }
}

function mapEpisode(ep: ItunesFeedEpisode, podcastId: string): PodcastEpisode {
  return {
    id: String(ep.trackId),
    podcastId,
    name: ep.trackName,
    description: ep.description ?? '',
    audioUrl: ep.episodeUrl ?? '',
    publishedAt: ep.releaseDate,
    durationMs: ep.trackTimeMillis ?? 0,
    guestName: null,
  }
}
