export interface GenreMeta {
  emoji: string
  color: string
  textColor: string
}

export const GENRE_META: Record<string, GenreMeta> = {
  jazz:        { emoji: '🎷', color: '#1a2e4a', textColor: '#a8c8f0' },
  pop:         { emoji: '🎤', color: '#4a1a3a', textColor: '#f0a8d8' },
  rock:        { emoji: '🎸', color: '#2e1a0e', textColor: '#f0c8a8' },
  classical:   { emoji: '🎻', color: '#1a2a1a', textColor: '#a8d8a8' },
  electronic:  { emoji: '🎹', color: '#0e1a2e', textColor: '#a8c8f8' },
  news:        { emoji: '📰', color: '#2a2a1a', textColor: '#e8d8a8' },
  talk:        { emoji: '🎙️', color: '#2a1a1a', textColor: '#e8b8a8' },
  country:     { emoji: '🤠', color: '#2e2010', textColor: '#e8c890' },
  hip_hop:     { emoji: '🎧', color: '#1a0e2e', textColor: '#c8a8f8' },
  'hip-hop':   { emoji: '🎧', color: '#1a0e2e', textColor: '#c8a8f8' },
  rnb:         { emoji: '🎵', color: '#2a0e2a', textColor: '#e8a8e8' },
  soul:        { emoji: '🎵', color: '#2a1a0e', textColor: '#f0c8a0' },
  reggae:      { emoji: '🌴', color: '#0e2a0e', textColor: '#a8e8a8' },
  latin:       { emoji: '💃', color: '#2a1010', textColor: '#f8a8a8' },
  dance:       { emoji: '🕺', color: '#0e102a', textColor: '#a8b8f8' },
  metal:       { emoji: '🤘', color: '#1a1010', textColor: '#c8a8a8' },
  punk:        { emoji: '⚡', color: '#20100e', textColor: '#f0b8a8' },
  blues:       { emoji: '🎶', color: '#0e1a2a', textColor: '#a8c0e8' },
  folk:        { emoji: '🪕', color: '#1e1a0e', textColor: '#d8c8a0' },
  ambient:     { emoji: '🌊', color: '#0e1e1e', textColor: '#a8d8d8' },
  world:       { emoji: '🌍', color: '#0e1e14', textColor: '#a8d8b8' },
  sports:      { emoji: '⚽', color: '#0e2010', textColor: '#a8e0a8' },
  christian:   { emoji: '✝️', color: '#1e1a10', textColor: '#e8d8a8' },
  religious:   { emoji: '🙏', color: '#1e1a10', textColor: '#e8d8a8' },
  oldies:      { emoji: '📻', color: '#1e140a', textColor: '#e8c8a0' },
  house:       { emoji: '🔊', color: '#0e0e2a', textColor: '#b8b8f8' },
  techno:      { emoji: '⚙️', color: '#141414', textColor: '#d8d8d8' },
  indie:       { emoji: '🎸', color: '#1a1a2e', textColor: '#c8c8f0' },
  alternative: { emoji: '🎵', color: '#1e1e1e', textColor: '#d0d0d0' },
  rap:         { emoji: '🎤', color: '#1a0e10', textColor: '#e8b8c0' },
  gospel:      { emoji: '🙌', color: '#1e1810', textColor: '#e8d0b0' },
  comedy:      { emoji: '😄', color: '#2a200a', textColor: '#f0e0a0' },
  children:    { emoji: '🧸', color: '#1a1e0e', textColor: '#d0e8b0' },
}

export const GENRE_FALLBACK: GenreMeta = { emoji: '📻', color: '#1a1e1a', textColor: '#b8d0c0' }

export function getGenreMeta(name: string): GenreMeta {
  return GENRE_META[name.toLowerCase()] ?? GENRE_FALLBACK
}

/** Convert an ISO 3166-1 alpha-2 code to a flag emoji */
export function flagEmoji(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join('')
}
