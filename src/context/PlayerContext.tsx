import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import { registerClick, type Station } from '../lib/radio-browser'
import { trackStructEvent } from '../lib/snowplow'

// ─── State ────────────────────────────────────────────────────────────────────

export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

export interface PlayerState {
  station: Station | null
  status: PlayerStatus
  volume: number
  muted: boolean
  errorMessage: string | null
}

const initialState: PlayerState = {
  station: null,
  status: 'idle',
  volume: 0.8,
  muted: false,
  errorMessage: null,
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type PlayerAction =
  | { type: 'LOAD'; station: Station }
  | { type: 'PLAYING' }
  | { type: 'PAUSED' }
  | { type: 'ERROR'; message: string }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'STOP' }

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, station: action.station, status: 'loading', errorMessage: null }
    case 'PLAYING':
      return { ...state, status: 'playing' }
    case 'PAUSED':
      return { ...state, status: 'paused' }
    case 'ERROR':
      return { ...state, status: 'error', errorMessage: action.message }
    case 'SET_VOLUME':
      return { ...state, volume: action.volume, muted: false }
    case 'TOGGLE_MUTE':
      return { ...state, muted: !state.muted }
    case 'STOP':
      return { ...state, status: 'idle', station: null, errorMessage: null }
    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

export interface PlayerContextValue {
  state: PlayerState
  play: (station: Station) => void
  pause: () => void
  resume: () => void
  toggle: (station: Station) => void
  stop: () => void
  setVolume: (volume: number) => void
  toggleMute: () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hlsRef = useRef<any>(null)

  // Create the audio element once
  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.volume = initialState.volume

    const audio = audioRef.current

    const onPlaying = () => dispatch({ type: 'PLAYING' })
    const onPause = () => dispatch({ type: 'PAUSED' })
    const onError = () =>
      dispatch({ type: 'ERROR', message: 'Stream unavailable. Try another station.' })
    const onWaiting = () => dispatch({ type: 'LOAD', station: state.station! })

    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)
    audio.addEventListener('waiting', onWaiting)

    return () => {
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('waiting', onWaiting)
      audio.pause()
      audio.src = ''
      hlsRef.current?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync volume + muted
  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = state.volume
    audioRef.current.muted = state.muted
  }, [state.volume, state.muted])

  const loadStream = useCallback((station: Station) => {
    const audio = audioRef.current
    if (!audio) return

    // Destroy previous HLS instance if any
    hlsRef.current?.destroy()
    hlsRef.current = null
    audio.pause()
    audio.src = ''

    const url = station.url_resolved || station.url

    if (station.hls === 1) {
      // Lazy-load hls.js only when an HLS stream is actually needed.
      // This keeps it out of the initial JS bundle (~1.1 MB minified).
      import('hls.js').then(({ default: Hls }) => {
        if (!Hls.isSupported()) {
          // Safari has native HLS — fall through to direct src
          const a = audioRef.current
          if (!a) return
          a.src = url
          a.play().catch(() => {
            dispatch({ type: 'ERROR', message: 'Stream unavailable. Try another station.' })
          })
          return
        }
        const hls = new Hls({ enableWorker: false })
        hlsRef.current = hls
        hls.loadSource(url)
        hls.attachMedia(audio)
        hls.on(Hls.Events.MANIFEST_PARSED, () => audio.play().catch(() => null))
        hls.on(Hls.Events.ERROR, (_evt, data) => {
          if (data.fatal) {
            dispatch({ type: 'ERROR', message: 'Stream unavailable. Try another station.' })
          }
        })
      }).catch(() => {
        dispatch({ type: 'ERROR', message: 'Stream unavailable. Try another station.' })
      })
    } else {
      audio.src = url
      audio.play().catch(() => {
        dispatch({ type: 'ERROR', message: 'Stream unavailable. Try another station.' })
      })
    }

    registerClick(station.stationuuid)
  }, [])

  const play = useCallback(
    (station: Station) => {
      dispatch({ type: 'LOAD', station })
      loadStream(station)
    },
    [loadStream],
  )

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => null)
  }, [])

  const toggle = useCallback(
    (station: Station) => {
      if (state.station?.stationuuid === station.stationuuid) {
        if (state.status === 'playing') {
          pause()
        } else {
          resume()
        }
      } else {
        play(station)
      }
    },
    [state.station, state.status, play, pause, resume],
  )

  const stop = useCallback(() => {
    audioRef.current?.pause()
    if (audioRef.current) audioRef.current.src = ''
    hlsRef.current?.destroy()
    hlsRef.current = null
    dispatch({ type: 'STOP' })
  }, [])

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: 'SET_VOLUME', volume: Math.max(0, Math.min(1, volume)) })
  }, [])

  const toggleMute = useCallback(() => {
    dispatch({ type: 'TOGGLE_MUTE' })
  }, [])

  // ─── Media Session API ───────────────────────────────────────────────────────
  // Updates the OS media controls (lock screen, notification shade, hardware keys)
  // whenever the current station or playback status changes.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return

    if (!state.station) {
      navigator.mediaSession.metadata = null
      navigator.mediaSession.playbackState = 'none'
      return
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: state.station.name,
      artist: state.station.country || 'Live Radio',
      album: "Leo's Radio Explorer",
      artwork: state.station.favicon
        ? [{ src: state.station.favicon, sizes: 'any', type: 'image/jpeg' }]
        : [],
    })

    navigator.mediaSession.playbackState =
      state.status === 'playing' ? 'playing'
      : state.status === 'paused' ? 'paused'
      : 'none'

    navigator.mediaSession.setActionHandler('play', () =>
      audioRef.current?.play().catch(() => null),
    )
    navigator.mediaSession.setActionHandler('pause', () => audioRef.current?.pause())
    navigator.mediaSession.setActionHandler('stop', () => {
      audioRef.current?.pause()
      if (audioRef.current) audioRef.current.src = ''
      hlsRef.current?.destroy()
      hlsRef.current = null
      dispatch({ type: 'STOP' })
    })
  }, [state.station, state.status])

  // ─── Play / pause analytics ──────────────────────────────────────────────────
  // Fires a Snowplow structured event when playback starts or pauses.
  // No-ops silently when no Snowplow collector is configured.
  useEffect(() => {
    if (!state.station) return
    if (state.status === 'playing') {
      trackStructEvent({
        category: 'player',
        action: 'play',
        label: state.station.name,
        property: state.station.stationuuid,
      })
    } else if (state.status === 'paused') {
      trackStructEvent({
        category: 'player',
        action: 'pause',
        label: state.station.name,
        property: state.station.stationuuid,
      })
    }
  }, [state.status, state.station?.stationuuid]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PlayerContext.Provider
      value={{ state, play, pause, resume, toggle, stop, setVolume, toggleMute }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within <PlayerProvider>')
  return ctx
}
