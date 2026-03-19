import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/countries/')({
  head: () => ({ meta: [{ title: "Countries · Leo's Radio Explorer" }] }),
  component: () => (
    <main className="page-wrap px-4 py-12">
      <h1 className="section-heading">Radio Around the World</h1>
      <p className="mt-2 text-[var(--sea-ink-soft)]">Coming in Phase 3…</p>
    </main>
  ),
})
