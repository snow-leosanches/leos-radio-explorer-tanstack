import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/library')({
  head: () => ({ meta: [{ title: "Library · Leo's Radio Explorer" }] }),
  component: () => (
    <main className="page-wrap px-4 py-12">
      <h1 className="section-heading">Your Library</h1>
      <p className="mt-2 text-[var(--sea-ink-soft)]">Coming in Phase 5…</p>
    </main>
  ),
})
