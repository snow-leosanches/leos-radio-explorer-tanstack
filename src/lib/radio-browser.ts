// Radio Browser API client
// Docs: https://api.radio-browser.info

const BASE_URL = 'https://de1.api.radio-browser.info/json'

const DEFAULT_HEADERS = {
  'User-Agent': 'LeoRadioExplorer/1.0',
  'Content-Type': 'application/json',
}

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }
  const res = await fetch(url.toString(), { headers: DEFAULT_HEADERS })
  if (!res.ok) throw new Error(`Radio Browser API error: ${res.status}`)
  return res.json() as Promise<T>
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Station {
  stationuuid: string
  name: string
  url: string
  url_resolved: string
  homepage: string
  favicon: string
  tags: string
  country: string
  countrycode: string
  language: string
  languagecodes: string
  votes: number
  codec: string
  bitrate: number
  clickcount: number
  clicktrend: number
  lastcheckoktime: string
  hls: number
}

export interface Tag {
  name: string
  stationcount: number
}

export interface Country {
  name: string
  iso_3166_1: string
  stationcount: number
}

export interface SearchParams {
  name?: string
  tag?: string
  country?: string
  countrycode?: string
  language?: string
  limit?: number
  offset?: number
  order?: string
  reverse?: boolean
}

// ─── API functions ─────────────────────────────────────────────────────────────

export async function getTopStations(limit = 20): Promise<Station[]> {
  return apiFetch<Station[]>(`/stations/topvote/${limit}`)
}

export async function searchStations(params: SearchParams): Promise<Station[]> {
  const query: Record<string, string> = {}
  if (params.name) query['name'] = params.name
  if (params.tag) query['tag'] = params.tag
  if (params.country) query['country'] = params.country
  if (params.countrycode) query['countrycode'] = params.countrycode
  if (params.language) query['language'] = params.language
  if (params.limit != null) query['limit'] = String(params.limit)
  if (params.offset != null) query['offset'] = String(params.offset)
  if (params.order) query['order'] = params.order
  if (params.reverse != null) query['reverse'] = String(params.reverse)
  return apiFetch<Station[]>('/stations/search', query)
}

export async function getStationByUuid(uuid: string): Promise<Station | null> {
  const results = await apiFetch<Station[]>(`/stations/byuuid/${uuid}`)
  return results[0] ?? null
}

export async function getStationsByTag(tag: string, limit = 40): Promise<Station[]> {
  return apiFetch<Station[]>(`/stations/bytag/${encodeURIComponent(tag)}`, {
    limit: String(limit),
    order: 'votes',
    reverse: 'true',
  })
}

export async function getStationsByCountry(countrycode: string, limit = 40): Promise<Station[]> {
  return apiFetch<Station[]>(`/stations/bycountryexact/${encodeURIComponent(countrycode)}`, {
    limit: String(limit),
    order: 'votes',
    reverse: 'true',
  })
}

export async function getTopTags(limit = 60): Promise<Tag[]> {
  return apiFetch<Tag[]>('/tags', {
    order: 'stationcount',
    reverse: 'true',
    limit: String(limit),
  })
}

export async function getCountries(limit = 200): Promise<Country[]> {
  const raw = await apiFetch<Array<{ name: string; iso_3166_1: string; stationcount: number }>>(
    '/countries',
    { order: 'stationcount', reverse: 'true', limit: String(limit) },
  )
  return raw.filter((c) => c.name && c.iso_3166_1 && c.stationcount > 0)
}

/** Notify the API a station was clicked (courtesy call). Fire-and-forget. */
export function registerClick(uuid: string): void {
  fetch(`${BASE_URL}/url/${uuid}`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
  }).catch(() => {
    // best-effort only
  })
}

/** Derive a stable gradient for stations without artwork. */
export function stationGradient(uuid: string): string {
  let hash = 0
  for (let i = 0; i < uuid.length; i++) {
    hash = (hash * 31 + uuid.charCodeAt(i)) >>> 0
  }
  const hue1 = hash % 360
  const hue2 = (hue1 + 40) % 360
  return `linear-gradient(135deg, hsl(${hue1},55%,52%), hsl(${hue2},60%,40%))`
}

/** Parse the comma-separated tags string into an array. */
export function parseTags(tags: string): string[] {
  return tags
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5)
}
