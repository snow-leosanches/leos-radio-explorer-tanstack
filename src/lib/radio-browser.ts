// Radio Browser API client
// Docs: https://api.radio-browser.info

import { getMockStationsByCountry } from './mock-stations'

// all.api.radio-browser.info is a DNS round-robin that resolves to the nearest
// community-operated server, improving reliability over a single hardcoded host.
const BASE_URL = 'https://all.api.radio-browser.info/json'

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
  state: string
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

export const PAGE_SIZE = 24

export async function getStationsByTag(
  tag: string,
  limit = PAGE_SIZE,
  offset = 0,
): Promise<Station[]> {
  return apiFetch<Station[]>(`/stations/bytag/${encodeURIComponent(tag)}`, {
    limit: String(limit),
    offset: String(offset),
    order: 'votes',
    reverse: 'true',
  })
}

export async function getStationsByCountry(
  countrycode: string,
  limit = PAGE_SIZE,
  offset = 0,
): Promise<Station[]> {
  try {
    // Use the search endpoint with countrycode (ISO 3166-1 alpha-2) so that
    // passing "BR" finds Brazilian stations — bycountryexact expects the full
    // country name and would return nothing for a two-letter code.
    const results = await apiFetch<Station[]>('/stations/search', {
      countrycode: countrycode.toUpperCase(),
      limit: String(limit),
      offset: String(offset),
      order: 'votes',
      reverse: 'true',
    })
    if (results.length > 0) return results
  } catch {
    // fall through to mock data
  }

  // Fall back to curated mock stations when the API returns nothing.
  const mock = getMockStationsByCountry(countrycode)
  return mock.slice(offset, offset + limit)
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
  apiFetch(`/url/${uuid}`, undefined).catch(() => {
    // best-effort only
  })
}

/** Submit a community vote for a station. */
export async function voteStation(uuid: string): Promise<void> {
  await apiFetch<{ ok: boolean; message: string }>(`/vote/${uuid}`)
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
