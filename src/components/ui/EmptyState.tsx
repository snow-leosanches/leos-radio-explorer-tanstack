import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
  children?: ReactNode
}

export default function EmptyState({ icon = '📭', title, description, action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-8 py-16 text-center">
      <span className="text-5xl">{icon}</span>
      <div>
        <p className="text-base font-semibold text-[var(--sea-ink)]">{title}</p>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-[var(--sea-ink-soft)]">{description}</p>
        )}
      </div>
      {action && (
        <Link
          to={action.href}
          className="rounded-xl bg-[var(--lagoon-deep)] px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:opacity-90"
        >
          {action.label}
        </Link>
      )}
      {children}
    </div>
  )
}
