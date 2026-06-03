import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchMe, loginUser, registerUser } from '../api/client'
import type { UserProfile } from '../types'

interface AuthContextValue {
  token: string | null
  user: UserProfile | null
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<UserProfile>
  register: (email: string, password: string, fullName: string) => Promise<UserProfile>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)
const TOKEN_KEY = 'rnmc_token'

/** Provide authentication state and actions to the React tree. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)))

  /** Load the current user profile when a token is present. */
  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const profile = await fetchMe()
      setUser(profile)
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      refreshUser()
    } else {
      setLoading(false)
    }
  }, [token, refreshUser])

  /** Persist token and user after successful authentication. */
  function persistSession(accessToken: string, profile: UserProfile) {
    localStorage.setItem(TOKEN_KEY, accessToken)
    setToken(accessToken)
    setUser(profile)
  }

  /** Log in with email and password. */
  async function login(email: string, password: string) {
    const response = await loginUser(email, password)
    persistSession(response.access_token, response.user)
    return response.user
  }

  /** Register a new account and sign in. */
  async function register(email: string, password: string, fullName: string) {
    const response = await registerUser(email, password, fullName)
    persistSession(response.access_token, response.user)
    return response.user
  }

  /** Clear session from memory and storage. */
  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      loading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [token, user, loading, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Hook to access authentication helpers. */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
