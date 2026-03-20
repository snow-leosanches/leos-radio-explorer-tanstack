import { createContext, useContext, useMemo, ReactNode } from 'react'

interface SnowplowSignalsContextValue {
  baseUrl: string | null
}

const SnowplowSignalsContext = createContext<SnowplowSignalsContextValue | null>(null)

interface SnowplowSignalsProviderProps {
  children: ReactNode
}

export function SnowplowSignalsProvider({ children }: SnowplowSignalsProviderProps) {
  const contextValue = useMemo(
    () => ({
      baseUrl: import.meta.env.VITE_SNOWPLOW_SIGNALS_ENDPOINT ?? null,
    }),
    [],
  )

  return (
    <SnowplowSignalsContext.Provider value={contextValue}>
      {children}
    </SnowplowSignalsContext.Provider>
  )
}

export function useSnowplowSignals(): SnowplowSignalsContextValue {
  const context = useContext(SnowplowSignalsContext)
  if (!context) {
    throw new Error('useSnowplowSignals must be used within a SnowplowSignalsProvider')
  }
  return context
}

export function useSnowplowSignalsOptional(): SnowplowSignalsContextValue | null {
  return useContext(SnowplowSignalsContext)
}
