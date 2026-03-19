import { createFileRoute } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import StationCard from '../components/ui/StationCard'
import EmptyState from '../components/ui/EmptyState'
import { useLibrary } from '../context/LibraryContext'
import type { Station } from '../lib/radio-browser'

export const Route = createFileRoute('/library')({
  head: () => ({ meta: [{ title: "Library · Leo's Radio Explorer" }] }),
  component: LibraryPage,
})

function LibraryPage() {
  const { savedStations, remove, save } = useLibrary()

  function handleRemove(station: Station) {
    remove(station.stationuuid)
    toast(`Removed from Library`, {
      description: station.name,
      action: {
        label: 'Undo',
        onClick: () => save(station),
      },
    })
  }

  return (
    <main className="page-wrap px-4 py-12">
      {/* Header */}
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="island-kicker mb-2">Your collection</p>
          <h1 className="section-heading">Library</h1>
          {savedStations.length > 0 && (
            <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
              {savedStations.length} saved {savedStations.length === 1 ? 'station' : 'stations'}
            </p>
          )}
        </div>

        {savedStations.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (!confirm('Clear your entire library?')) return
              // Remove all one-by-one so localStorage stays in sync
              savedStations.forEach((s) => remove(s.stationuuid))
              toast('Library cleared')
            }}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--sea-ink-soft)] transition hover:border-red-400 hover:text-red-500"
          >
            <Trash2 size={13} />
            Clear all
          </button>
        )}
      </header>

      {/* Empty state */}
      {savedStations.length === 0 && (
        <EmptyState
          icon="🎧"
          title="Your library is empty"
          description="Save stations you love and they'll appear here — ready to play any time."
          action={{ label: 'Explore stations', href: '/' }}
        />
      )}

      {/* Station grid */}
      {savedStations.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {savedStations.map((station, i) => (
            <div
              key={station.stationuuid}
              className="rise-in group/lib relative"
              style={{ animationDelay: `${Math.min(i, 11) * 50}ms` }}
            >
              <StationCard station={station} />

              {/* Remove overlay button */}
              <button
                type="button"
                onClick={() => handleRemove(station)}
                className="absolute right-2 top-2 hidden h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white/80 opacity-0 transition hover:text-white group-hover/lib:opacity-100 sm:flex"
                aria-label={`Remove ${station.name} from library`}
                title="Remove from library"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
