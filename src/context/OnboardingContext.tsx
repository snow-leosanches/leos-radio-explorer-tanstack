import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useUser } from './UserContext'

const STORAGE_KEY_PREFIX = 'radio-explorer:onboarding:'

export interface OnboardingData {
  dateOfBirth: string   // YYYY-MM-DD
  zipCode: string
  interests: string[]   // topic IDs
  completedAt: string   // ISO timestamp
}

interface OnboardingContextValue {
  onboardingData: OnboardingData | null
  isOnboarded: boolean
  saveOnboarding: (data: Omit<OnboardingData, 'completedAt'>) => void
  clearOnboarding: () => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

function storageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}${userId}`
}

export function getStoredOnboardingData(userId: string): OnboardingData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(storageKey(userId))
    return raw ? (JSON.parse(raw) as OnboardingData) : null
  } catch {
    return null
  }
}

function writeOnboardingData(userId: string, data: OnboardingData): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(data))
  } catch {
    // ignore quota errors
  }
}

function removeOnboardingData(userId: string): void {
  try {
    localStorage.removeItem(storageKey(userId))
  } catch {
    // ignore
  }
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)

  // Re-read from storage whenever the logged-in user changes
  useEffect(() => {
    if (!user) {
      setOnboardingData(null)
      return
    }
    setOnboardingData(getStoredOnboardingData(user.id))
  }, [user?.id])

  const saveOnboarding = useCallback(
    (data: Omit<OnboardingData, 'completedAt'>) => {
      if (!user) return
      const full: OnboardingData = { ...data, completedAt: new Date().toISOString() }
      writeOnboardingData(user.id, full)
      setOnboardingData(full)
    },
    [user],
  )

  const clearOnboarding = useCallback(() => {
    if (!user) return
    removeOnboardingData(user.id)
    setOnboardingData(null)
  }, [user])

  return (
    <OnboardingContext.Provider
      value={{ onboardingData, isOnboarded: !!onboardingData, saveOnboarding, clearOnboarding }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within <OnboardingProvider>')
  return ctx
}
