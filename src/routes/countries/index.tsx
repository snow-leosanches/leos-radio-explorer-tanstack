import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Search } from 'lucide-react'
import CountryCard from '../../components/ui/CountryCard'
import { getCountries } from '../../lib/radio-browser'
import { queryKeys } from '../../lib/query-keys'

export const Route = createFileRoute('/countries/')({
  head: () => ({ meta: [{ title: "Countries · Leo's Radio Explorer" }] }),
  component: CountryBrowser,
})

function CountryBrowser() {
  const [filter, setFilter] = useState('')

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

      {/* Country grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="skeleton-pulse h-28 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] py-12 text-center">
          <p className="text-2xl">🌐</p>
          <p className="mt-2 text-sm font-semibold text-[var(--sea-ink)]">No countries found</p>
          <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">Try a different search term.</p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-xs text-[var(--sea-ink-soft)]">
            {filtered.length} {filtered.length === 1 ? 'country' : 'countries'}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((country) => (
              <CountryCard key={country.iso_3166_1} country={country} />
            ))}
          </div>
        </>
      )}
    </main>
  )
}
