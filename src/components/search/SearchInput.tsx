import { Search, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search stations, genres, countries…',
  autoFocus = false,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Expose focus to Cmd+K handler via custom event
  useEffect(() => {
    function handleFocusSearch(e: Event) {
      if (e instanceof CustomEvent && e.detail === 'search') {
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('focus-search', handleFocusSearch)
    return () => window.removeEventListener('focus-search', handleFocusSearch)
  }, [])

  // Auto-focus on mount when requested
  useEffect(() => {
    if (autoFocus) {
      // Slight delay so the page transition completes first
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [autoFocus])

  return (
    <div className="island-shell flex items-center gap-2 rounded-2xl p-2">
      <Search size={18} className="ml-2 flex-shrink-0 text-[var(--sea-ink-soft)]" />

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-base text-[var(--sea-ink)] placeholder-[var(--sea-ink-soft)] outline-none"
        aria-label="Search radio stations"
        spellCheck={false}
        autoComplete="off"
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('')
            inputRef.current?.focus()
          }}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}

      {/* Keyboard hint — hidden when there's a value */}
      {!value && (
        <kbd className="mr-1 hidden flex-shrink-0 items-center gap-0.5 rounded-lg border border-[var(--line)] bg-[var(--chip-bg)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--sea-ink-soft)] sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      )}
    </div>
  )
}
