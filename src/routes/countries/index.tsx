import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { Search } from 'lucide-react'
import CountryCard from '../../components/ui/CountryCard'
import { getCountries } from '../../lib/radio-browser'
import { queryKeys } from '../../lib/query-keys'

export const Route = createFileRoute('/countries/')({
  head: () => ({ meta: [{ title: "Countries · Leo's Radio Explorer" }] }),
  component: CountryBrowser,
})

// Derive column count from viewport width, matching Tailwind breakpoints:
// xl(1280+)→5, lg(1024+)→4, sm(640+)→3, default→2
function getColCount(): number {
  if (typeof window === 'undefined') return 2
  const w = window.innerWidth
  if (w >= 1280) return 5
  if (w >= 1024) return 4
  if (w >= 640) return 3
  return 2
}

// Estimated card height (px) + gap — must match the CSS grid gap (12px)
const CARD_HEIGHT = 116
const CARD_GAP = 12
const ROW_HEIGHT = CARD_HEIGHT + CARD_GAP

function CountryBrowser() {
  const [filter, setFilter] = useState('')
  const [cols, setCols] = useState(getColCount)

  // Track viewport width for column recalculation
  useEffect(() => {
    function update() { setCols(getColCount()) }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const { data: countries, isLoading } = useQuery({
    queryKey: queryKeys.countries.all(),
    queryFn: () => getCountries(),
  })

  const filtered = filter.trim()
    ? (countries ?? []).filter((c) =>
        c.name.toLowerCase().includes(filter.toLowerCase()) ||
        c.iso_3166_1.toLowerCase().includes(filter.toLowerCase()),
      )
    : (countries ?? [])

  // Group flat list into rows for the virtualizer
  const rowCount = Math.ceil(filtered.length / cols)

  const listRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => ROW_HEIGHT,
    overscan: 4,
    // scrollMargin: offset of the list container from the top of the document
    scrollMargin: listRef.current?.offsetTop ?? 0,
  })

  return (
    <main className="page-wrap px-4 py-12">
      {/* Hero */}
      <header className="mb-8">
        <p className="island-kicker mb-2">Explore</p>
        <h1 className="section-heading">Radio Around the World</h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--sea-ink-soft)]">
          Tune into live stations from every corner of the planet.
        </p>
      </header>

      {/* Search filter */}
      <div className="island-shell mb-8 flex items-center gap-2 rounded-2xl p-2">
        <Search size={16} className="ml-2 flex-shrink-0 text-[var(--sea-ink-soft)]" />
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by country name…"
          className="flex-1 bg-transparent text-sm text-[var(--sea-ink)] placeholder-[var(--sea-ink-soft)] outline-none"
          aria-label="Filter countries"
        />
        {filter && (
          <button
            onClick={() => setFilter('')}
            className="mr-1 text-xs text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
          >
            Clear
          </button>
        )}
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="skeleton-pulse h-28 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Empty filtered result */}
      {!isLoading && filtered.length === 0 && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] py-12 text-center">
          <p className="text-2xl">🌐</p>
          <p className="mt-2 text-sm font-semibold text-[var(--sea-ink)]">No countries found</p>
          <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">Try a different search term.</p>
        </div>
      )}

      {/* Virtualized grid */}
      {!isLoading && filtered.length > 0 && (
        <>
          <p className="mb-4 text-xs text-[var(--sea-ink-soft)]">
            {filtered.length} {filtered.length === 1 ? 'country' : 'countries'}
          </p>

          <div ref={listRef}>
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const startIdx = virtualRow.index * cols
                const rowItems = filtered.slice(startIdx, startIdx + cols)

                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
                      paddingBottom: `${CARD_GAP}px`,
                    }}
                  >
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {rowItems.map((country) => (
                        <CountryCard key={country.iso_3166_1} country={country} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </main>
  )
}
