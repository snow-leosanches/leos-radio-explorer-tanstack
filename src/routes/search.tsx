import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Globe, Mic2, Music, Radio } from 'lucide-react'
import SearchInput from '../components/search/SearchInput'
import StationCard from '../components/ui/StationCard'
import { SkeletonGrid } from '../components/ui/SkeletonCard'
import { searchStations, getTopTags } from '../lib/radio-browser'
import { queryKeys } from '../lib/query-keys'
import { useDebounce } from '../hooks/useDebounce'

// ─── Route definition ─────────────────────────────────────────────────────────

export const Route = createFileRoute('/search')({
  validateSearch: (raw: Record<string, unknown>) => ({
    q:           typeof raw['q'] === 'string'           ? raw['q']           : '',
    tag:         typeof raw['tag'] === 'string'         ? raw['tag']         : '',
    countrycode: typeof raw['countrycode'] === 'string' ? raw['countrycode'] : '',
  }),
  head: ({ search }) => ({
    meta: [{ title: search.q ? `"${search.q}" · Search · Leo's Radio Explorer` : "Search · Leo's Radio Explorer" }],
  }),
  component: SearchPage,
})

// ─── Featured country chips ───────────────────────────────────────────────────

const COUNTRY_CHIPS = [
  { code: 'US', label: '🇺🇸 USA' },
  { code: 'GB', label: '🇬🇧 UK' },
  { code: 'DE', label: '🇩🇪 Germany' },
  { code: 'BR', label: '🇧🇷 Brazil' },
  { code: 'FR', label: '🇫🇷 France' },
  { code: 'JP', label: '🇯🇵 Japan' },
  { code: 'AU', label: '🇦🇺 Australia' },
  { code: 'ES', label: '🇪🇸 Spain' },
]

// ─── Page component ───────────────────────────────────────────────────────────

function SearchPage() {
  const navigate = useNavigate({ from: '/search' })
  const { q, tag, countrycode } = Route.useSearch()

  // Local input state — driven by URL, debounced before writing back
  const [inputValue, setInputValue] = useState(q)
  const debouncedInput = useDebounce(inputValue, 300)

  // Sync local → URL whenever the debounced value changes
  useEffect(() => {
    if (debouncedInput === q) return
    void navigate({ search: (prev) => ({ ...prev, q: debouncedInput }), replace: true })
  }, [debouncedInput]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync URL → local when navigating back/forward
  useEffect(() => {
    setInputValue(q)
  }, [q])

  // Toggle a filter chip value in the URL
  function setFilter(key: 'tag' | 'countrycode', value: string) {
    void navigate({
      search: (prev) => ({
        ...prev,
        [key]: prev[key] === value ? '' : value,
      }),
      replace: true,
    })
  }

  // Fetch top tags for genre chips
  const { data: topTags } = useQuery({
    queryKey: queryKeys.tags.top(12),
    queryFn: () => getTopTags(12),
  })

  // Derive whether we have an active query
  const hasQuery = q.trim().length > 0 || tag !== '' || countrycode !== ''

  // Search query — only fires when there's something to search
  const {
    data: results,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: queryKeys.stations.search({ q, tag, countrycode }),
    queryFn: () =>
      searchStations({
        name: q.trim() || undefined,
        tag: tag || undefined,
        countrycode: countrycode || undefined,
        order: 'votes',
        reverse: true,
        limit: 48,
      }),
    enabled: hasQuery,
    placeholderData: (prev) => prev,
  })

  const showSkeleton = isLoading || (isFetching && !results)

  return (
    <main className="page-wrap px-4 py-10">
      {/* Search bar */}
      <div className="mb-8">
        <SearchInput
          value={inputValue}
          onChange={setInputValue}
          autoFocus={!q}
        />
      </div>

      {/* ── Filter chips ─────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4">

        {/* Genre chips */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--sea-ink-soft)]">
            <Music size={11} /> Genre
          </p>
          <div className="flex flex-wrap gap-2">
            {topTags?.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setFilter('tag', t.name)}
                className={[
                  'genre-pill cursor-pointer capitalize transition',
                  tag === t.name
                    ? 'border-[var(--lagoon-deep)] bg-[color-mix(in_oklab,var(--lagoon)_15%,var(--chip-bg))] text-[var(--lagoon-deep)]'
                    : 'hover:border-[var(--lagoon-deep)] hover:text-[var(--lagoon-deep)]',
                ].join(' ')}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Country chips */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--sea-ink-soft)]">
            <Globe size={11} /> Country
          </p>
          <div className="flex flex-wrap gap-2">
            {COUNTRY_CHIPS.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setFilter('countrycode', c.code)}
                className={[
                  'genre-pill cursor-pointer transition',
                  countrycode === c.code
                    ? 'border-[var(--lagoon-deep)] bg-[color-mix(in_oklab,var(--lagoon)_15%,var(--chip-bg))] text-[var(--lagoon-deep)]'
                    : 'hover:border-[var(--lagoon-deep)] hover:text-[var(--lagoon-deep)]',
                ].join(' ')}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────────────────── */}

      {/* Idle state */}
      {!hasQuery && (
        <IdleState />
      )}

      {/* Loading skeleton */}
      {hasQuery && showSkeleton && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <SkeletonGrid count={12} variant="card" />
        </div>
      )}

      {/* Error */}
      {hasQuery && isError && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-6 py-10 text-center">
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Something went wrong. Check your connection and try again.
          </p>
        </div>
      )}

      {/* Empty */}
      {hasQuery && !showSkeleton && !isError && results?.length === 0 && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-6 py-14 text-center">
          <p className="text-3xl">🔍</p>
          <p className="mt-3 text-base font-semibold text-[var(--sea-ink)]">No stations found</p>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            Try a different name, genre, or country.
          </p>
        </div>
      )}

      {/* Results grid */}
      {hasQuery && !showSkeleton && results && results.length > 0 && (
        <>
          <p className="mb-4 text-xs text-[var(--sea-ink-soft)]">
            {results.length} station{results.length !== 1 ? 's' : ''} found
            {isFetching && <span className="ml-1 opacity-60">· updating…</span>}
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((station, i) => (
              <div
                key={station.stationuuid}
                className="rise-in"
                style={{ animationDelay: `${Math.min(i, 11) * 40}ms` }}
              >
                <StationCard station={station} />
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}

// ─── Idle state ───────────────────────────────────────────────────────────────

function IdleState() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--lagoon)_14%,var(--surface))]">
        <Radio size={28} className="text-[var(--lagoon-deep)]" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-[var(--sea-ink)]">Search the world's radio</h2>
        <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
          Type a station name, or pick a genre or country filter above.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {['BBC World Service', 'Jazz FM', 'NPR', 'Radio Paradise'].map((s) => (
          <ExampleChip key={s} label={s} />
        ))}
      </div>
    </div>
  )
}

function ExampleChip({ label }: { label: string }) {
  const navigate = useNavigate({ from: '/search' })
  return (
    <button
      type="button"
      onClick={() =>
        void navigate({ search: (prev) => ({ ...prev, q: label }), replace: false })
      }
      className="flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--sea-ink-soft)] transition hover:-translate-y-0.5 hover:border-[var(--lagoon-deep)] hover:text-[var(--lagoon-deep)]"
    >
      <Mic2 size={13} />
      {label}
    </button>
  )
}
