import { useInfiniteQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { PAGE_SIZE, type Station } from '../../lib/radio-browser'
import StationCard from './StationCard'
import { SkeletonGrid } from './SkeletonCard'

interface StationGridProps {
  /** Unique query key for this grid */
  queryKey: readonly unknown[]
  /** Fetcher — receives page offset, returns a page of stations */
  fetcher: (offset: number) => Promise<Station[]>
  emptyMessage?: string
}

export default function StationGrid({ queryKey, fetcher, emptyMessage }: StationGridProps) {
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 0 }) => fetcher(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      return allPages.reduce((sum, page) => sum + page.length, 0)
    },
  })

  const stations = data?.pages.flat() ?? []

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <SkeletonGrid count={PAGE_SIZE} variant="card" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-6 py-10 text-center">
        <p className="text-sm text-[var(--sea-ink-soft)]">
          Could not load stations. Check your connection and try again.
        </p>
      </div>
    )
  }

  if (stations.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-6 py-10 text-center">
        <p className="text-2xl">📻</p>
        <p className="mt-2 text-sm font-semibold text-[var(--sea-ink)]">No stations found</p>
        <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
          {emptyMessage ?? 'Try a different genre or country.'}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stations.map((station, i) => (
          <div
            key={station.stationuuid}
            className="rise-in"
            style={{ animationDelay: `${Math.min(i, 11) * 50}ms` }}
          >
            <StationCard station={station} />
          </div>
        ))}

        {isFetchingNextPage && <SkeletonGrid count={4} variant="card" />}
      </div>

      {hasNextPage && !isFetchingNextPage && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => void fetchNextPage()}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-6 py-2.5 text-sm font-semibold text-[var(--sea-ink)] transition hover:-translate-y-0.5 hover:border-[var(--lagoon-deep)] hover:text-[var(--lagoon-deep)]"
          >
            Load more stations
          </button>
        </div>
      )}

      {isFetchingNextPage && (
        <div className="mt-6 flex justify-center">
          <Loader2 size={20} className="animate-spin text-[var(--lagoon-deep)]" />
        </div>
      )}
    </div>
  )
}
