import Hls from 'hls.js'
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
  const hlsRef = useRef<Hls | null>(null)

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

    if (station.hls === 1 && Hls.isSupported()) {
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
