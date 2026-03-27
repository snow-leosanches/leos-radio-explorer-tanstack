import { useQuery } from '@tanstack/react-query'
import { snowplowTracker } from '../lib/snowplow'

/** Prefix for React Query keys that load Snowplow Signals attribute-group data. */
export const SIGNALS_QUERY_KEY_PREFIX = ['signals'] as const

export interface AttributeGroupData {
  countries_count?: Record<string, number>
  genres_count?: Record<string, number>
  last_country_visited?: string
  last_genre_visited?: string
  last_region_name?: string
  last_zip_code?: string
}

export interface PersonalisedProfile {
  topCountryCode: string | null
  topGenre: string | null
  lastCountryCode: string | null
  lastGenre: string | null
  lastRegionName: string | null
}

function topKey(dict: Record<string, number> | undefined): string | null {
  if (!dict) return null
  const entries = Object.entries(dict)
  if (entries.length === 0) return null
  return entries.reduce((best, curr) => (curr[1] > best[1] ? curr : best))[0]
}

export function usePersonalisedProfile(): { profile: PersonalisedProfile; attributes: AttributeGroupData | null; isLoading: boolean } {
  const domainUserId = snowplowTracker?.getDomainUserId() ?? null

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [...SIGNALS_QUERY_KEY_PREFIX, 'attribute-groups', 'leos_radio_explorer_domain_userid', domainUserId],
    queryFn: async (): Promise<AttributeGroupData> => {
      const params = new URLSearchParams({
        attribute_key: 'domain_userid',
        identifier: domainUserId!,
        name: 'leos_radio_explorer_domain_userid',
        version: '2',
        attributes: 'countries_count,genres_count,last_country_visited,last_genre_visited,last_region_name,last_zip_code',
      })
      const res = await fetch(`/api/attribute-groups?${params.toString()}`)
      if (!res.ok) return {}
      return res.json()
    },
    enabled: !!domainUserId,
    staleTime: 0,
  })

  return {
    profile: {
      topCountryCode: topKey(data?.countries_count) ?? null,
      topGenre: topKey(data?.genres_count) ?? null,
      lastCountryCode: data?.last_country_visited ?? null,
      lastGenre: data?.last_genre_visited ?? null,
      lastRegionName: data?.last_region_name ?? null,
    },
    attributes: data ?? null,
    isLoading: isLoading || isFetching,
  }
}
