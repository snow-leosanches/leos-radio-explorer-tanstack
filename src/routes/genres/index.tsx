import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/genres/')({
  head: () => ({ meta: [{ title: "Genres · Leo's Radio Explorer" }] }),
  component: () => (
    <main className="page-wrap px-4 py-12">
      <h1 className="section-heading">Browse by Genre</h1>
      <p className="mt-2 text-[var(--sea-ink-soft)]">Coming in Phase 3…</p>
    </main>
  ),
})
