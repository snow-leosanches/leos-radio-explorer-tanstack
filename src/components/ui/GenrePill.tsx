import { Link } from '@tanstack/react-router'

interface GenrePillProps {
  genre: string
  /** When true, renders as a <span> instead of a navigable link */
  static?: boolean
  onClick?: () => void
}

export default function GenrePill({ genre, static: isStatic, onClick }: GenrePillProps) {
  if (isStatic || onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="genre-pill cursor-pointer"
      >
        {genre}
      </button>
    )
  }

  return (
    <Link
      to="/genres/$genre"
      params={{ genre }}
      className="genre-pill no-underline"
    >
      {genre}
    </Link>
  )
}
