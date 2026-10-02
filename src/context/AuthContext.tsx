import { createContext, useContext, useState, type ReactNode } from 'react'
import { ApiError, apiRequest } from '../services/api'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

interface Session {
  token: string
  expiresAt: string
  user: AuthUser
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const STORAGE_KEY = 'alvestore.admin'

function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as Session
    if (new Date(session.expiresAt) <= new Date()) {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
    return session
  } catch {
    sessionStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession)

  const login = async (email: string, password: string) => {
    if (!email || !password) throw new Error('Informe e-mail e senha.')

    let result: Session
    try {
      result = await apiRequest<Session>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 400)) {
        throw new Error('E-mail ou senha inválidos.')
      }
      throw err
    }

    if (result.user.role !== 'Admin') throw new Error('Acesso restrito a administradores.')

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result))
    setSession(result)
  }

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, token: session?.token ?? null, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
