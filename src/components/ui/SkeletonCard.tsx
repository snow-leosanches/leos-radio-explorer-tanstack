interface SkeletonCardProps {
  variant?: 'card' | 'row' | 'featured'
}

export default function SkeletonCard({ variant = 'card' }: SkeletonCardProps) {
  if (variant === 'row') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
        <div className="skeleton-pulse h-12 w-12 flex-shrink-0 rounded-lg" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="skeleton-pulse h-3.5 w-3/4 rounded" />
          <div className="skeleton-pulse h-3 w-1/2 rounded" />
        </div>
        <div className="skeleton-pulse h-8 w-8 flex-shrink-0 rounded-lg" />
      </div>
    )
  }

  if (variant === 'featured') {
    return (
      <div className="w-44 flex-shrink-0 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
        <div className="skeleton-pulse aspect-square w-full" />
        <div className="flex flex-col gap-2 p-3">
          <div className="skeleton-pulse h-3.5 w-4/5 rounded" />
          <div className="skeleton-pulse h-3 w-2/3 rounded" />
        </div>
      </div>
    )
  }

  // Default card
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
      <div className="skeleton-pulse aspect-square w-full" />
      <div className="flex flex-col gap-2 p-3">
        <div className="skeleton-pulse h-3.5 w-4/5 rounded" />
        <div className="skeleton-pulse h-3 w-1/2 rounded" />
        <div className="skeleton-pulse mt-1 h-3 w-1/3 rounded" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8, variant = 'card' }: { count?: number; variant?: 'card' | 'row' | 'featured' }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </>
  )
}
