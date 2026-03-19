import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { getTopTags } from '../../lib/radio-browser'
import { queryKeys } from '../../lib/query-keys'
import { getGenreMeta } from '../../lib/genre-meta'

export const Route = createFileRoute('/genres/')({
  head: () => ({ meta: [{ title: "Genres · Leo's Radio Explorer" }] }),
  component: GenreBrowser,
})

function GenreBrowser() {
  const { data: tags, isLoading } = useQuery({
    queryKey: queryKeys.tags.top(60),
    queryFn: () => getTopTags(60),
  })

  return (
    <main className="page-wrap px-4 py-12">
      {/* Hero */}
      <header className="mb-10">
        <p className="island-kicker mb-2">Explore</p>
        <h1 className="section-heading">Browse by Genre</h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--sea-ink-soft)]">
          From jazz to techno, news to gospel — find your perfect station.
        </p>
      </header>

      {/* Genre grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {isLoading &&
          Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="skeleton-pulse aspect-[4/3] rounded-2xl" />
          ))}

        {tags?.map((tag) => {
          const meta = getGenreMeta(tag.name)
          return (
            <Link
              key={tag.name}
              to="/genres/$genre"
              params={{ genre: tag.name }}
              className="group relative overflow-hidden rounded-2xl p-4 no-underline transition hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: meta.color, aspectRatio: '4/3' }}
            >
              <span
                className="pointer-events-none absolute -bottom-4 -right-4 text-7xl opacity-20 transition-transform duration-300 group-hover:scale-110 group-hover:opacity-30"
                aria-hidden="true"
              >
                {meta.emoji}
              </span>
              <div className="relative z-10 flex h-full flex-col justify-between">
                <span className="text-3xl">{meta.emoji}</span>
                <div>
                  <p
                    className="text-sm font-bold capitalize leading-tight"
                    style={{ color: meta.textColor }}
                  >
                    {tag.name}
                  </p>
                  <p className="mt-0.5 text-xs opacity-60" style={{ color: meta.textColor }}>
                    {tag.stationcount.toLocaleString()} stations
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
