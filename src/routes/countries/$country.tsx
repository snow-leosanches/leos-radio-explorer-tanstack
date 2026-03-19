import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/countries/$country')({
  head: ({ params }) => ({
    meta: [{ title: `${params.country} · Leo's Radio Explorer` }],
  }),
  component: () => {
    const { country } = Route.useParams()
    return (
      <main className="page-wrap px-4 py-12">
        <h1 className="section-heading">{country}</h1>
        <p className="mt-2 text-[var(--sea-ink-soft)]">Coming in Phase 3…</p>
      </main>
    )
  },
})
