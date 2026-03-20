const UTM_STORAGE_KEY = 'snowplow_utm_params'

export interface UTMParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

export function extractUTMFromURL(url: string = window.location.href): UTMParams {
  const urlObj = new URL(url)
  const params: UTMParams = {}

  const keys: (keyof UTMParams)[] = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
  ]

  for (const key of keys) {
    const value = urlObj.searchParams.get(key)
    if (value) params[key] = value
  }

  return params
}

export function storeUTMParams(params: UTMParams): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params))
}

export function getStoredUTMParams(): UTMParams | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(UTM_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UTMParams
  } catch {
    return null
  }
}

export function clearUTMParams(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(UTM_STORAGE_KEY)
}

export function applyUTMToURL(url: string, params: UTMParams): string {
  const urlObj = new URL(url)
  for (const [key, value] of Object.entries(params)) {
    if (value) urlObj.searchParams.set(key, value)
  }
  return urlObj.toString()
}

export function simulateUTMParams(params: UTMParams): void {
  const urlWithUTM = applyUTMToURL(window.location.href, params)
  window.history.replaceState({}, '', urlWithUTM)
  storeUTMParams(params)
}
