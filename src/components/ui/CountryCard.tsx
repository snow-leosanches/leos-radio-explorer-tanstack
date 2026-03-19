import { Link } from '@tanstack/react-router'
import { flagEmoji } from '../../lib/genre-meta'
import type { Country } from '../../lib/radio-browser'

interface CountryCardProps {
  country: Country
}

export default function CountryCard({ country }: CountryCardProps) {
  const flag = flagEmoji(country.iso_3166_1)

  return (
    <Link
      to="/countries/$country"
      params={{ country: country.iso_3166_1.toUpperCase() }}
      className="island-shell group flex flex-col items-center gap-2 rounded-2xl p-4 no-underline transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <span className="text-4xl transition-transform duration-200 group-hover:scale-110">
        {flag}
      </span>
      <div className="text-center">
        <p className="text-sm font-semibold text-[var(--sea-ink)]">{country.name}</p>
        <p className="text-xs text-[var(--sea-ink-soft)]">
          {country.stationcount.toLocaleString()} stations
        </p>
      </div>
    </Link>
  )
}
