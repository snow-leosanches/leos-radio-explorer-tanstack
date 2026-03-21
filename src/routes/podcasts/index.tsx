import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { searchPodcasts } from '../../lib/itunes'
import { usePodcasts } from '../../context/PodcastContext'
import { trackGenreVisitedSpec } from '../../../snowtype/snowplow'
import type { Podcast } from '../../types/podcast'

export const Route = createFileRoute('/podcasts/')({
  head: () => ({ meta: [{ title: "Podcasts · Leo's Radio Explorer" }] }),
  component: PodcastDiscovery,
})

const CATEGORIES = [
  { label: 'Trending', term: 'trending podcasts 2024' },
  { label: 'News', term: 'news daily' },
  { label: 'True Crime', term: 'true crime' },
  { label: 'Comedy', term: 'comedy' },
  { label: 'Sports', term: 'sports' },
  { label: 'Business', term: 'business entrepreneurship' },
  { label: 'Science', term: 'science' },
  { label: 'Technology', term: 'technology' },
  { label: 'Society', term: 'society culture' },
  { label: 'Health', term: 'health wellness' },
]

function PodcastCard({ podcast, featured = false }: { podcast: Podcast; featured?: boolean }) {
  if (featured) {
    return (
      <Link
        to="/podcasts/$podcastId"
        params={{ podcastId: podcast.id }}
        className="group relative flex-shrink-0 w-56 sm:w-64 overflow-hidden rounded-2xl no-underline"
      >
        <img
          src={podcast.artwork}
          alt={podcast.name}
          className="h-56 w-full sm:h-64 object-cover transition group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">{podcast.genre}</p>
          <p className="mt-0.5 line-clamp-2 text-sm font-bold text-white leading-tight">{podcast.name}</p>
          <p className="text-xs text-white/70 mt-0.5 truncate">{podcast.author}</p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to="/podcasts/$podcastId"
      params={{ podcastId: podcast.id }}
      className="group flex flex-col gap-2 no-underline"
    >
      <img
        src={podcast.artwork}
        alt={podcast.name}
        className="aspect-square w-full rounded-xl object-cover transition group-hover:opacity-90"
      />
      <p className="line-clamp-2 text-xs font-semibold text-[var(--sea-ink)]">{podcast.name}</p>
      <p className="text-xs text-[var(--sea-ink-soft)] truncate">{podcast.author}</p>
    </Link>
  )
}

function FeaturedSection({ podcasts }: { podcasts: Podcast[] }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--sea-ink-soft)]">
        Featured Today
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {podcasts.slice(0, 8).map((p) => (
          <PodcastCard key={p.id} podcast={p} featured />
        ))}
      </div>
    </section>
  )
}

function CategoryPills({
  active,
  onChange,
}: {
  active: string
  onChange: (label: string, term: string) => void
}) {
  return (
    <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.label}
          onClick={() => onChange(cat.label, cat.term)}
          className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
            active === cat.label
              ? 'bg-[var(--lagoon-deep)] text-white'
              : 'bg-[var(--surface-strong)] text-[var(--sea-ink)] hover:bg-[var(--lagoon-deep)]/10'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}

function PodcastDiscovery() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const { subscriptions } = usePodcasts()

  const { data: featured, isLoading: featuredLoading } = useQuery({
    queryKey: ['podcasts', 'featured'],
    queryFn: () => searchPodcasts('best podcasts 2024', 8),
    staleTime: 1000 * 60 * 10,
  })

  const { data: categoryResults, isLoading: categoryLoading } = useQuery({
    queryKey: ['podcasts', 'category', activeCategory.term],
    queryFn: () => searchPodcasts(activeCategory.term, 18),
    staleTime: 1000 * 60 * 5,
  })

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['podcasts', 'search', searchQuery],
    queryFn: () => searchPodcasts(searchQuery, 24),
    enabled: searchQuery.length > 0,
  })

  function handleCategoryChange(label: string, term: string) {
    setActiveCategory({ label, term })
    setSearchQuery('')
    setSearchTerm('')
    try {
      trackGenreVisitedSpec({ genre_name: label })
    } catch (e) {
      console.error('[Snowplow] Error tracking genre_visited:', e)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearchQuery(searchTerm)
  }

  const showSearch = searchQuery.length > 0

  return (
    <main className="page-wrap px-4 py-10">
      {/* Page header */}
      <header className="mb-8">
        <p className="island-kicker mb-2">Listen</p>
        <h1 className="section-heading">Podcasts</h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--sea-ink-soft)]">
          Discover trending shows, browse by category, or search millions of podcasts.
        </p>
      </header>

      {/* Search bar */}
      <form className="mb-8 flex gap-2" onSubmit={handleSearch}>
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sea-ink-soft)]"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      {showSearch ? (
        /* Search results view */
        <section>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--sea-ink-soft)]">
              Results for "{searchQuery}"
            </h2>
            <button
              onClick={() => { setSearchQuery(''); setSearchTerm('') }}
              className="text-xs text-[var(--lagoon-deep)] hover:underline"
            >
              Clear
            </button>
          </div>
          {searchLoading && <PodcastGrid count={12} loading />}
          {searchResults && <PodcastGrid podcasts={searchResults} />}
        </section>
      ) : (
        <>
          {/* Featured horizontal scroll */}
          {featuredLoading ? (
            <section className="mb-10">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--sea-ink-soft)]">
                Featured Today
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton-pulse flex-shrink-0 w-56 h-56 rounded-2xl" />
                ))}
              </div>
            </section>
          ) : featured ? (
            <FeaturedSection podcasts={featured} />
          ) : null}

          {/* Your subscriptions */}
          {subscriptions.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--sea-ink-soft)]">
                Your Subscriptions
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {subscriptions.map((p) => (
                  <PodcastCard key={p.id} podcast={p} />
                ))}
              </div>
            </section>
          )}

          {/* Category pills */}
          <CategoryPills active={activeCategory.label} onChange={handleCategoryChange} />

          {/* Category results */}
          <section>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--sea-ink-soft)]">
              {activeCategory.label === 'Trending' ? 'Trending Now' : `Top in ${activeCategory.label}`}
            </h2>
            {categoryLoading ? <PodcastGrid count={18} loading /> : null}
            {categoryResults && !categoryLoading ? <PodcastGrid podcasts={categoryResults} /> : null}
          </section>
        </>
      )}
    </main>
  )
}

function PodcastGrid({ podcasts, count = 12, loading = false }: { podcasts?: Podcast[]; count?: number; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="skeleton-pulse aspect-square w-full rounded-xl" />
            <div className="skeleton-pulse h-3 w-3/4 rounded" />
            <div className="skeleton-pulse h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {podcasts?.map((p) => (
        <PodcastCard key={p.id} podcast={p} />
      ))}
    </div>
  )
}
