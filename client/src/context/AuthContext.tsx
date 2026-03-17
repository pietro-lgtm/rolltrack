import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api, setCurrentUserId } from '../api/client'
import type { User } from '../types'

interface AuthContextType {
  userId: string
  user: User | null
  loading: boolean
  error: string | null
  login: (userId: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string>('user1')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      setCurrentUserId(id)
      const data = await api.get<User>('/users/me')
      setUser(data)
    } catch (err) {
      console.warn('Failed to fetch user, using default:', err)
      setUser({
        id,
        name: 'You',
        email: 'you@rolltrack.app',
        beltRank: 'blue',
        academy: 'Gracie Barra Downtown',
      })
      setError(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser(userId)
  }, [userId, fetchUser])

  const login = useCallback((newUserId: string) => {
    setUserId(newUserId)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setUserId('user1')
    setCurrentUserId('user1')
  }, [])

  return (
    <AuthContext.Provider value={{ userId, user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
