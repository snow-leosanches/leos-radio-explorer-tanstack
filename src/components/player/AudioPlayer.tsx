import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
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
import { parseTags, stationGradient } from '../../lib/radio-browser'

export default function AudioPlayer() {
  const { state, pause, resume, stop, setVolume, toggleMute } = usePlayer()
  const { station, status, volume, muted } = state

  if (!station) return null

  const isPlaying = status === 'playing'
  const isLoading = status === 'loading'
  const isError = status === 'error'
  const isPaused = status === 'paused'

  const gradient = stationGradient(station.stationuuid)
  const subtitle =
    isLoading ? 'Connecting…'
    : isError   ? (state.errorMessage ?? 'Stream unavailable')
    : isPlaying ? (parseTags(station.tags)[0] ?? station.country ?? 'Live Radio')
    : isPaused  ? 'Paused'
    : ''

  return (
    <div className="player-bar" role="region" aria-label="Audio player">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">

        {/* ── Left: artwork + station info ── */}
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/stations/$stationId"
            params={{ stationId: station.stationuuid }}
            className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-md transition hover:opacity-80"
            style={{ background: gradient, minHeight: 'unset', minWidth: 'unset' }}
            aria-label={`View ${station.name} details`}
          >
            {station.favicon && (
              <img
                src={station.favicon}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                }}
              />
            )}
          </Link>

          <div className="min-w-0">
            <Link
              to="/stations/$stationId"
              params={{ stationId: station.stationuuid }}
              className="block truncate text-sm font-semibold text-white no-underline hover:underline"
              style={{ minHeight: 'unset' }}
            >
              {station.name}
            </Link>
            <p className={['flex items-center truncate text-xs', isError ? 'text-red-400' : 'text-white/50'].join(' ')}>
              {isError && <AlertCircle size={11} className="mr-1 flex-shrink-0" aria-hidden="true" />}
              {subtitle}
            </p>
          </div>
        </div>

        {/* ── Right: controls ── */}
        <div className="flex flex-shrink-0 items-center gap-1">

          {/* Play / Pause */}
          <button
            onClick={isPlaying ? pause : resume}
            disabled={isLoading || isError}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0a1216] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={isPlaying ? 'Pause' : 'Play / Resume'}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            ) : isPlaying ? (
              <Pause size={18} fill="currentColor" aria-hidden="true" />
            ) : (
              <Play size={18} fill="currentColor" aria-hidden="true" />
            )}
          </button>

          {/* Re-buffer / skip to live */}
          {!isError && (
            <button
              onClick={resume}
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white/80 sm:flex"
              aria-label="Re-buffer stream"
              title="Back to live"
            >
              <SkipForward size={16} aria-hidden="true" />
            </button>
          )}

          {/* Live badge */}
          <span
            className="hidden items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide text-white/60 sm:flex"
            aria-label={isPlaying ? 'Live stream playing' : 'Live stream'}
          >
            <Radio
              size={10}
              className={isPlaying ? 'animate-pulse text-[var(--lagoon)]' : 'text-white/40'}
              aria-hidden="true"
            />
            LIVE
          </span>

          {/* Volume — desktop only */}
          <div className="hidden items-center gap-1.5 sm:flex" role="group" aria-label="Volume controls">
            <button
              onClick={toggleMute}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
              aria-label={muted ? 'Unmute' : 'Mute'}
              aria-pressed={muted}
            >
              {muted || volume === 0 ? (
                <VolumeX size={16} aria-hidden="true" />
              ) : volume < 0.5 ? (
                <Volume1 size={16} aria-hidden="true" />
              ) : (
                <Volume2 size={16} aria-hidden="true" />
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
              style={{ minHeight: 'unset', minWidth: 'unset' }}
            />
          </div>

          {/* Stop / close */}
          <button
            onClick={stop}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white/80"
            aria-label="Stop playback and close player"
            title="Stop"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

      </div>
    </div>
  )
}
