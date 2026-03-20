export interface Podcast {
  id: string
  name: string
  author: string
  description: string
  artwork: string
  feedUrl: string
  genre: string
}

export interface PodcastEpisode {
  id: string
  podcastId: string
  name: string
  description: string
  audioUrl: string
  publishedAt: string
  durationMs: number
  guestName: string | null
}
