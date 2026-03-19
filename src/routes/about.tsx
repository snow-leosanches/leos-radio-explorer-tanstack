import { createFileRoute, Link } from '@tanstack/react-router'
import { Globe, Headphones, Library, Radio, Search } from 'lucide-react'

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: "About · Leo's Radio Explorer" }] }),
  component: About,
})

function About() {
  return (
    <main className="page-wrap px-4 py-12">

      {/* Hero */}
      <section className="island-shell mb-10 rounded-2xl p-6 sm:p-10">
        <p className="island-kicker mb-2">About</p>
        <h1 className="display-title mb-4 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          The world&apos;s radio,<br />in one place.
        </h1>
        <p className="m-0 max-w-2xl text-base leading-8 text-[var(--sea-ink-soft)]">
          Leo&apos;s Radio Explorer lets you discover and stream thousands of live radio
          stations from every genre and every corner of the globe — completely free,
          with no sign-up required. From jazz to k-pop, BBC World Service to local
          community radio, it&apos;s all here.
        </p>
      </section>

      {/* Feature cards */}
      <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: <Globe size={22} className="text-[var(--lagoon)]" />,
            title: 'Worldwide coverage',
            body: 'Browse stations from over 190 countries, filtered by genre, language, and region.',
          },
          {
            icon: <Search size={22} className="text-[var(--lagoon)]" />,
            title: 'Instant search',
            body: 'Find any station by name, genre, or country in real time. Use ⌘K from anywhere.',
          },
          {
            icon: <Headphones size={22} className="text-[var(--lagoon)]" />,
            title: 'Persistent player',
            body: 'Keep listening while you browse. The bottom player stays with you across every page.',
          },
          {
            icon: <Library size={22} className="text-[var(--lagoon)]" />,
            title: 'Your library',
            body: 'Save favourite stations and revisit them any time — stored locally in your browser.',
          },
        ].map(({ icon, title, body }) => (
          <div
            key={title}
            className="feature-card island-shell rounded-2xl border border-[var(--line)] p-5"
          >
            <div className="mb-3">{icon}</div>
            <h3 className="mb-1 text-sm font-semibold text-[var(--sea-ink)]">{title}</h3>
            <p className="m-0 text-xs leading-relaxed text-[var(--sea-ink-soft)]">{body}</p>
          </div>
        ))}
      </section>

      {/* Data source */}
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <Radio size={28} className="mt-0.5 flex-shrink-0 text-[var(--lagoon)]" />
          <div>
            <h2 className="mb-1 text-base font-semibold text-[var(--sea-ink)]">
              Powered by Radio Browser
            </h2>
            <p className="m-0 max-w-2xl text-sm leading-7 text-[var(--sea-ink-soft)]">
              Station data is sourced from{' '}
              <a
                href="https://www.radio-browser.info"
                target="_blank"
                rel="noreferrer"
              >
                Radio Browser
              </a>
              , a free, community-maintained, open database of internet radio stations.
              No API key is required. Stream counts and votes come directly from their
              real-time API.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:opacity-90"
              >
                Start exploring
              </Link>
              <a
                href="https://www.radio-browser.info"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink-soft)] no-underline transition hover:border-[var(--lagoon-deep)] hover:text-[var(--sea-ink)]"
              >
                Radio Browser API ↗
              </a>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
