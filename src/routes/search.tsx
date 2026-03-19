import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search['q'] === 'string' ? search['q'] : undefined,
  }),
  head: () => ({ meta: [{ title: "Search · Leo's Radio Explorer" }] }),
  component: () => {
    const { q } = Route.useSearch()
    return (
      <main className="page-wrap px-4 py-12">
        <h1 className="section-heading">Search{q ? `: "${q}"` : ''}</h1>
        <p className="mt-2 text-[var(--sea-ink-soft)]">Coming in Phase 4…</p>
      </main>
    )
  },
})
