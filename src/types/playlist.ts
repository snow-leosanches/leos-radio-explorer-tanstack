import type { Station } from '../lib/radio-browser'

export interface Playlist {
  id: string
  name: string
  createdAt: string
  stations: Station[]
}
