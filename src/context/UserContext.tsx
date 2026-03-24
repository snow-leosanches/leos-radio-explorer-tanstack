import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'radio-explorer:user'

export interface User {
  id: string
  name: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface UserContextValue {
  user: User | null
  setUser: (user: User | null) => void
  clearUser: () => void
}

const UserContext = createContext<UserContextValue | null>(null)

function readFromStorage(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function writeToStorage(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // ignore quota errors
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)

  useEffect(() => {
    setUserState(readFromStorage())
  }, [])

  const setUser = useCallback((u: User | null) => {
    setUserState(u)
    writeToStorage(u)
  }, [])

  const clearUser = useCallback(() => {
    setUserState(null)
    writeToStorage(null)
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within <UserProvider>')
  return ctx
}
