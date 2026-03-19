import { Link } from '@tanstack/react-router'
import { Radio } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer mt-20 px-4 pb-14 pt-10 text-[var(--sea-ink-soft)]">
      <div className="page-wrap flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--sea-ink)] no-underline"
          >
            <Radio size={14} className="text-[var(--lagoon)]" />
            Leo&apos;s Radio Explorer
          </Link>
          <p className="m-0 max-w-xs text-center text-xs leading-relaxed sm:text-left">
            Discover and stream thousands of live radio stations from every genre
            and corner of the world — free, no sign-up needed.
          </p>
          <p className="m-0 text-xs text-[var(--sea-ink-soft)]/60">
            &copy; {year} Leo&apos;s Radio Explorer
          </p>
        </div>

        {/* Nav columns */}
        <div className="flex gap-10 text-sm">
          <div className="flex flex-col gap-2">
            <p className="island-kicker m-0 mb-1">Explore</p>
            <Link to="/" className="nav-link text-xs">Discover</Link>
            <Link to="/genres" className="nav-link text-xs">Genres</Link>
            <Link to="/countries" className="nav-link text-xs">Countries</Link>
            <Link to="/search" className="nav-link text-xs">Search</Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="island-kicker m-0 mb-1">More</p>
            <Link to="/library" className="nav-link text-xs">Library</Link>
            <Link to="/about" className="nav-link text-xs">About</Link>
            <a
              href="https://www.radio-browser.info"
              target="_blank"
              rel="noreferrer"
              className="nav-link text-xs"
            >
              Radio Browser API
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="page-wrap mt-8 border-t border-[var(--line)] pt-6 text-center text-xs text-[var(--sea-ink-soft)]/60">
        Station data provided by{' '}
        <a
          href="https://www.radio-browser.info"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-[var(--lagoon-deep)]/40 underline-offset-2 hover:text-[var(--sea-ink)]"
        >
          Radio Browser
        </a>{' '}
        — a community-driven, open database of internet radio stations.
      </div>
    </footer>
  )
}
