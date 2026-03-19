import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import { Radio, Search } from 'lucide-react'
import { useEffect } from 'react'
import { useLibrary } from '../context/LibraryContext'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const navigate = useNavigate()
  const router = useRouter()
  const { savedStations } = useLibrary()

  // Global Cmd+K / Ctrl+K → focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const isOnSearch = router.state.location.pathname === '/search'
        if (isOnSearch) {
          // Already on the page — just fire the focus event
          window.dispatchEvent(new CustomEvent('focus-search', { detail: 'search' }))
        } else {
          void navigate({ to: '/search' }).then(() => {
            // Give the route a tick to mount before focusing
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('focus-search', { detail: 'search' }))
            }, 120)
          })
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, router])

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        {/* Logo */}
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
          >
            <Radio size={14} className="text-[var(--lagoon)]" />
            Leo&apos;s Radio Explorer
          </Link>
        </h2>

        {/* Right-side controls */}
        <div className="ml-auto flex items-center gap-1.5 sm:ml-0 sm:gap-2">
          <Link
            to="/search"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
            aria-label="Search stations (⌘K)"
            title="Search (⌘K)"
          >
            <Search size={18} />
          </Link>
          <ThemeToggle />
        </div>

        {/* Nav links */}
        <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-2 sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link
            to="/"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
            activeOptions={{ exact: true }}
          >
            Discover
          </Link>
          <Link
            to="/genres"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Genres
          </Link>
          <Link
            to="/countries"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Countries
          </Link>
          <Link
            to="/library"
            className="nav-link inline-flex items-center gap-1.5"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Library
            {savedStations.length > 0 && (
              <span className="rounded-full bg-[var(--lagoon-deep)] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {savedStations.length > 99 ? '99+' : savedStations.length}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  )
}
