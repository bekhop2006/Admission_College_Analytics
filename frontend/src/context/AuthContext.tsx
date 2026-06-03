import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

interface AuthContextValue {
  token: string | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Provide admin auth state to the React tree. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('rnmc_token'))

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login: (newToken: string) => {
        localStorage.setItem('rnmc_token', newToken)
        setToken(newToken)
      },
      logout: () => {
        localStorage.removeItem('rnmc_token')
        setToken(null)
      },
    }),
    [token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Hook to access admin authentication helpers. */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
