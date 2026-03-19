import { useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useState } from 'react'

export default function HeroBanner() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      void navigate({ to: '/search', search: { q } })
    }
  }

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:pb-20 sm:pt-20">
      {/* Background blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(79,184,178,0.5) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(47,106,74,0.4) 0%, transparent 70%)',
        }}
      />

      <div className="page-wrap relative z-10 flex flex-col items-center text-center">
        {/* Kicker */}
        <span className="island-kicker mb-4 inline-block">
          🌍 World Radio — Live &amp; Free
        </span>

        {/* Headline */}
        <h1 className="display-title mb-5 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-[var(--sea-ink)] sm:text-5xl lg:text-6xl">
          Discover the world&apos;s
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(90deg, var(--lagoon-deep), var(--palm))',
            }}
          >
            radio stations
          </span>
        </h1>

        <p className="mb-8 max-w-xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          Stream thousands of live stations from every genre and corner of the planet — free, no sign-up needed.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="w-full max-w-xl">
          <div className="island-shell flex items-center gap-2 rounded-2xl p-2">
            <Search size={18} className="ml-2 flex-shrink-0 text-[var(--sea-ink-soft)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stations, genres, countries…"
              className="flex-1 bg-transparent text-sm text-[var(--sea-ink)] placeholder-[var(--sea-ink-soft)] outline-none"
              aria-label="Search radio stations"
            />
            <button
              type="submit"
              className="flex-shrink-0 rounded-xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0"
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick suggestion chips */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {['jazz', 'pop', 'news', 'classical', 'electronic', 'rock'].map((tag) => (
            <button
              key={tag}
              onClick={() => void navigate({ to: '/genres/$genre', params: { genre: tag } })}
              className="genre-pill cursor-pointer capitalize transition hover:border-[var(--lagoon-deep)] hover:text-[var(--lagoon-deep)]"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
