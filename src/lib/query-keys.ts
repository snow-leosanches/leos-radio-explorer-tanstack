// Centralised query key factory for TanStack Query
// Keeps keys consistent and supports targeted cache invalidation.

export const queryKeys = {
  stations: {
    top: (limit?: number) => ['stations', 'top', limit ?? 20] as const,
    search: (params: Record<string, unknown>) => ['stations', 'search', params] as const,
    byUuid: (uuid: string) => ['stations', 'uuid', uuid] as const,
    byTag: (tag: string, limit?: number) => ['stations', 'tag', tag, limit ?? 40] as const,
    byCountry: (countrycode: string, limit?: number) =>
      ['stations', 'country', countrycode, limit ?? 40] as const,
  },
  tags: {
    top: (limit?: number) => ['tags', 'top', limit ?? 60] as const,
  },
  countries: {
    all: (limit?: number) => ['countries', 'all', limit ?? 200] as const,
  },
} as const
