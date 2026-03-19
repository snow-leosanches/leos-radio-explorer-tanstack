import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getTopTags } from '../../lib/radio-browser'
import { queryKeys } from '../../lib/query-keys'
import SectionHeader from '../ui/SectionHeader'

// Curated icon + color map for known genres
const GENRE_META: Record<string, { emoji: string; color: string; textColor: string }> = {
  jazz:        { emoji: '🎷', color: '#1a2e4a', textColor: '#a8c8f0' },
  pop:         { emoji: '🎤', color: '#4a1a3a', textColor: '#f0a8d8' },
  rock:        { emoji: '🎸', color: '#2e1a0e', textColor: '#f0c8a8' },
  classical:   { emoji: '🎻', color: '#1a2a1a', textColor: '#a8d8a8' },
  electronic:  { emoji: '🎹', color: '#0e1a2e', textColor: '#a8c8f8' },
  news:        { emoji: '📰', color: '#2a2a1a', textColor: '#e8d8a8' },
  talk:        { emoji: '🎙️', color: '#2a1a1a', textColor: '#e8b8a8' },
  country:     { emoji: '🤠', color: '#2e2010', textColor: '#e8c890' },
  hip_hop:     { emoji: '🎧', color: '#1a0e2e', textColor: '#c8a8f8' },
  'hip-hop':   { emoji: '🎧', color: '#1a0e2e', textColor: '#c8a8f8' },
  rnb:         { emoji: '🎵', color: '#2a0e2a', textColor: '#e8a8e8' },
  soul:        { emoji: '🎵', color: '#2a1a0e', textColor: '#f0c8a0' },
  reggae:      { emoji: '🌴', color: '#0e2a0e', textColor: '#a8e8a8' },
  latin:       { emoji: '💃', color: '#2a1010', textColor: '#f8a8a8' },
  dance:       { emoji: '🕺', color: '#0e102a', textColor: '#a8b8f8' },
  metal:       { emoji: '🤘', color: '#1a1010', textColor: '#c8a8a8' },
  punk:        { emoji: '⚡', color: '#20100e', textColor: '#f0b8a8' },
  blues:       { emoji: '🎶', color: '#0e1a2a', textColor: '#a8c0e8' },
  folk:        { emoji: '🪕', color: '#1e1a0e', textColor: '#d8c8a0' },
  ambient:     { emoji: '🌊', color: '#0e1e1e', textColor: '#a8d8d8' },
  world:       { emoji: '🌍', color: '#0e1e14', textColor: '#a8d8b8' },
  sports:      { emoji: '⚽', color: '#0e2010', textColor: '#a8e0a8' },
  christian:   { emoji: '✝️', color: '#1e1a10', textColor: '#e8d8a8' },
  religious:   { emoji: '🙏', color: '#1e1a10', textColor: '#e8d8a8' },
  oldies:      { emoji: '📻', color: '#1e140a', textColor: '#e8c8a0' },
}

const FALLBACK = { emoji: '📻', color: '#1a1e1a', textColor: '#b8d0c0' }

export default function GenreGrid() {
  const { data: tags, isLoading } = useQuery({
    queryKey: queryKeys.tags.top(8),
    queryFn: () => getTopTags(8),
  })

  return (
    <section className="page-wrap px-4">
      <SectionHeader
        title="Browse by Genre"
        subtitle="Find your sound"
        href="/genres"
        hrefLabel="All genres"
      />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="skeleton-pulse aspect-[4/3] rounded-2xl"
            />
          ))}

        {tags?.map((tag) => {
          const meta = GENRE_META[tag.name.toLowerCase()] ?? FALLBACK
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
    </section>
  )
}
