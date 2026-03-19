import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  href?: string
  hrefLabel?: string
}

export default function SectionHeader({ title, subtitle, href, hrefLabel = 'See all' }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="section-heading">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          to={href}
          className="flex flex-shrink-0 items-center gap-1 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:gap-2"
        >
          {hrefLabel}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  )
}
