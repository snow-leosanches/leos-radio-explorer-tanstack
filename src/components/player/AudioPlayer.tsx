import {
  Loader2,
  Pause,
  Play,
  Radio,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { stationGradient } from '../../lib/radio-browser'

export default function AudioPlayer() {
  const { state, pause, resume, stop, setVolume, toggleMute } = usePlayer()
  const { station, status, volume, muted } = state

  if (!station) return null

  const isPlaying = status === 'playing'
  const isLoading = status === 'loading'
  const isError = status === 'error'

  const gradient = stationGradient(station.stationuuid)

  return (
    <div className="player-bar" role="region" aria-label="Audio player">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        {/* Station artwork */}
        <div
          className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg"
          style={{ background: gradient }}
          aria-hidden="true"
        >
          {station.favicon ? (
            <img
              src={station.favicon}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : null}
        </div>

        {/* Station info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{station.name}</p>
          <p className="truncate text-xs text-white/60">
            {isLoading && 'Connecting…'}
            {isError && (state.errorMessage ?? 'Stream unavailable')}
            {isPlaying && (station.tags?.split(',')[0]?.trim() || station.country || 'Live Radio')}
            {status === 'paused' && 'Paused'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-shrink-0 items-center gap-1">
          {/* Play / Pause */}
          <button
            onClick={isPlaying ? pause : resume}
            disabled={isLoading || isError}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={isPlaying ? 'Pause' : 'Resume'}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
          </button>

          {/* Live indicator / restart stream */}
          {!isError && (
            <button
              className="hidden h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:text-white/80 sm:flex"
              aria-label="Live"
              title="Live stream"
              onClick={resume}
            >
              <SkipForward size={16} />
            </button>
          )}

          {/* Volume — hidden on mobile */}
          <div className="hidden items-center gap-1.5 sm:flex">
            <button
              onClick={toggleMute}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:text-white"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted || volume === 0 ? (
                <VolumeX size={16} />
              ) : volume < 0.5 ? (
                <Volume1 size={16} />
              ) : (
                <Volume2 size={16} />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={muted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="volume-slider w-20"
              aria-label="Volume"
            />
          </div>

          {/* Live badge */}
          <span className="hidden items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/70 sm:flex">
            <Radio size={10} className={isPlaying ? 'text-[var(--lagoon)]' : 'text-white/40'} />
            LIVE
          </span>

          {/* Stop / close */}
          <button
            onClick={stop}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:text-white/80"
            aria-label="Stop and close player"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
