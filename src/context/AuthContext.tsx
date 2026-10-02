import { createContext, useContext, useState, type ReactNode } from 'react'

interface AuthContextValue {
  user: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const STORAGE_KEY = 'alvestore.admin'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEY))

  // TODO: substituir por chamada real à API de autenticação
  const login = async (email: string, password: string) => {
    if (!email || !password) throw new Error('Informe e-mail e senha.')
    sessionStorage.setItem(STORAGE_KEY, email)
    setUser(email)
  }

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
