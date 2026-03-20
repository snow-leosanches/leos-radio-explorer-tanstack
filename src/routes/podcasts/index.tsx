import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { searchPodcasts } from '../../lib/itunes'
import { usePodcasts } from '../../context/PodcastContext'

export const Route = createFileRoute('/podcasts/')({
  head: () => ({ meta: [{ title: "Podcasts · Leo's Radio Explorer" }] }),
  component: PodcastBrowser,
})

function PodcastBrowser() {
  const [term, setTerm] = useState('news')
  const [query, setQuery] = useState('news')
  const { subscriptions } = usePodcasts()

  const { data: results, isLoading } = useQuery({
    queryKey: ['podcasts', 'search', query],
    queryFn: () => searchPodcasts(query, 24),
    enabled: query.length > 0,
  })

  return (
    <main className="page-wrap px-4 py-12">
      <header className="mb-8">
        <p className="island-kicker mb-2">Listen</p>
        <h1 className="section-heading">Podcasts</h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--sea-ink-soft)]">
          Search millions of podcasts powered by iTunes.
        </p>
      </header>

      {/* Search bar */}
      <form
        className="mb-8 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setQuery(term)
        }}
      >
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sea-ink-soft)]"
          />
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search podcasts…"
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] py-2.5 pl-9 pr-4 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon-deep)]"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-[var(--lagoon-deep)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Search
        </button>
      </form>

      {/* Subscriptions */}
      {subscriptions.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--sea-ink-soft)]">
            Your Subscriptions
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {subscriptions.map((p) => (
              <Link
                key={p.id}
                to="/podcasts/$podcastId"
                params={{ podcastId: p.id }}
                className="group flex flex-col gap-2 no-underline"
              >
                <img
                  src={p.artwork}
                  alt={p.name}
                  className="aspect-square w-full rounded-xl object-cover transition group-hover:opacity-90"
                />
                <p className="line-clamp-2 text-xs font-semibold text-[var(--sea-ink)]">{p.name}</p>
                <p className="text-xs text-[var(--sea-ink-soft)]">{p.author}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Search results */}
      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--sea-ink-soft)]">
          Results for "{query}"
        </h2>
        {isLoading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="skeleton-pulse aspect-square w-full rounded-xl" />
                <div className="skeleton-pulse h-3 w-3/4 rounded" />
              </div>
            ))}
          </div>
        )}
        {results && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {results.map((p) => (
              <Link
                key={p.id}
                to="/podcasts/$podcastId"
                params={{ podcastId: p.id }}
                className="group flex flex-col gap-2 no-underline"
              >
                <img
                  src={p.artwork}
                  alt={p.name}
                  className="aspect-square w-full rounded-xl object-cover transition group-hover:opacity-90"
                />
                <p className="line-clamp-2 text-xs font-semibold text-[var(--sea-ink)]">{p.name}</p>
                <p className="text-xs text-[var(--sea-ink-soft)]">{p.author}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
