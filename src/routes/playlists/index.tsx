import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, ListMusic, Trash2 } from 'lucide-react'
import { usePlaylists } from '../../context/PlaylistContext'

export const Route = createFileRoute('/playlists/')({
  head: () => ({ meta: [{ title: "Playlists · Leo's Radio Explorer" }] }),
  component: PlaylistBrowser,
})

function PlaylistBrowser() {
  const { playlists, createPlaylist, deletePlaylist } = usePlaylists()
  const [newName, setNewName] = useState('')

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    createPlaylist(trimmed)
    setNewName('')
  }

  return (
    <main className="page-wrap px-4 py-12">
      <header className="mb-8">
        <p className="island-kicker mb-2">Your Music</p>
        <h1 className="section-heading">Playlists</h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--sea-ink-soft)]">
          Curate your own collections of radio stations.
        </p>
      </header>

      {/* Create form */}
      <form className="mb-8 flex gap-2" onSubmit={handleCreate}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New playlist name…"
          className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2.5 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon-deep)]"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="flex items-center gap-2 rounded-xl bg-[var(--lagoon-deep)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <Plus size={16} />
          Create
        </button>
      </form>

      {/* List */}
      {playlists.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <ListMusic size={40} className="text-[var(--sea-ink-soft)] opacity-40" />
          <p className="text-sm text-[var(--sea-ink-soft)]">No playlists yet — create your first one above.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {playlists.map((pl) => (
            <div key={pl.id} className="island-shell flex items-center justify-between rounded-2xl px-5 py-4">
              <Link
                to="/playlists/$playlistId"
                params={{ playlistId: pl.id }}
                className="flex flex-1 flex-col gap-0.5 no-underline"
              >
                <p className="text-sm font-semibold text-[var(--sea-ink)]">{pl.name}</p>
                <p className="text-xs text-[var(--sea-ink-soft)]">
                  {pl.stations.length} station{pl.stations.length !== 1 ? 's' : ''}
                </p>
              </Link>
              <button
                onClick={() => deletePlaylist(pl.id)}
                className="ml-4 rounded-lg p-2 text-[var(--sea-ink-soft)] transition hover:text-red-500"
                aria-label={`Delete ${pl.name}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
