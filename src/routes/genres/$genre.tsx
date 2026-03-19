import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/genres/$genre')({
  head: ({ params }) => ({
    meta: [{ title: `${params.genre} · Leo's Radio Explorer` }],
  }),
  component: () => {
    const { genre } = Route.useParams()
    return (
      <main className="page-wrap px-4 py-12">
        <h1 className="section-heading capitalize">{genre}</h1>
        <p className="mt-2 text-[var(--sea-ink-soft)]">Coming in Phase 3…</p>
      </main>
    )
  },
})
