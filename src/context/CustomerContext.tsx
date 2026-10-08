import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { ApiError, apiRequest } from '../services/api'
import type { Account, Address } from '../types/account'

interface Session {
  token: string
  expiresAt: string
}

export interface RegisterData {
  name: string
  phone: string
  email: string
  password: string
  address: Address
}

interface CustomerContextValue {
  account: Account | null
  /** true enquanto restaura a sessão salva */
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  update: (data: { name: string; phone: string; address: Address }) => Promise<void>
  logout: () => void
}

const CustomerContext = createContext<CustomerContextValue | null>(null)
const STORAGE_KEY = 'alvestore.customer'

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as Session
    if (new Date(session.expiresAt) <= new Date()) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

function saveSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Sem storage: sessão vale só enquanto a página estiver aberta.
  }
}

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession)
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(() => session !== null)

  const logout = useCallback(() => {
    saveSession(null)
    setSession(null)
    setAccount(null)
  }, [])

  useEffect(() => {
    if (!session) return
    apiRequest<Account>('/api/account', {}, session.token)
      .then(setAccount)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) logout()
      })
      .finally(() => setLoading(false))
  }, [session, logout])

  const start = (result: Session) => {
    const next = { token: result.token, expiresAt: result.expiresAt }
    saveSession(next)
    setLoading(true)
    setSession(next)
  }

  const login = async (email: string, password: string) => {
    try {
      start(
        await apiRequest<Session>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }),
      )
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 400))
        throw new Error('E-mail ou senha inválidos.')
      throw err
    }
  }

  const register = async (data: RegisterData) => {
    start(await apiRequest<Session>('/api/account/register', { method: 'POST', body: JSON.stringify(data) }))
  }

  const update = async (data: { name: string; phone: string; address: Address }) => {
    if (!session) throw new Error('Sessão expirada. Entre novamente.')
    try {
      setAccount(
        await apiRequest<Account>('/api/account', { method: 'PUT', body: JSON.stringify(data) }, session.token),
      )
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) logout()
      throw err
    }
  }

  return (
    <CustomerContext.Provider value={{ account, loading, login, register, update, logout }}>
      {children}
    </CustomerContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useCustomer() {
  const ctx = useContext(CustomerContext)
  if (!ctx) throw new Error('useCustomer deve ser usado dentro de CustomerProvider')
  return ctx
}
