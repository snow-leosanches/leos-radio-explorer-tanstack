import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { useLibrary } from '../../context/LibraryContext'
import type { Station } from '../../lib/radio-browser'

interface FavoriteButtonProps {
  station: Station
  /** 'sm' = 14px icon (card), 'md' = 18px icon (detail page) */
  size?: 'sm' | 'md'
  className?: string
}

export default function FavoriteButton({ station, size = 'sm', className = '' }: FavoriteButtonProps) {
  const { isSaved, save, remove } = useLibrary()
  const saved = isSaved(station.stationuuid)
  const iconSize = size === 'md' ? 18 : 14

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (saved) {
      remove(station.stationuuid)
      toast(`Removed from Library`, {
        description: station.name,
        action: {
          label: 'Undo',
          onClick: () => save(station),
        },
      })
    } else {
      save(station)
      toast.success(`Saved to Library`, {
        description: station.name,
      })
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? `Remove ${station.name} from library` : `Save ${station.name} to library`}
      aria-pressed={saved}
      className={[
        'flex items-center justify-center rounded-lg transition',
        size === 'md'
          ? 'h-10 w-10 border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--lagoon-deep)]'
          : '',
        saved
          ? 'text-[var(--lagoon-deep)]'
          : 'text-[var(--sea-ink-soft)] hover:text-[var(--lagoon-deep)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Heart
        size={iconSize}
        className={saved ? 'fill-[var(--lagoon-deep)]' : ''}
      />
    </button>
  )
}
