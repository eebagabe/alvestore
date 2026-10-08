import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { ApiError, apiRequest } from '../services/api'

/** Requisições autenticadas do painel; encerra a sessão se o token expirar. */
export function useAdminApi() {
  const { token, logout } = useAuth()

  return useCallback(
    async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
      try {
        return await apiRequest<T>(`/api/admin${path}`, init, token ?? undefined)
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) logout()
        throw err
      }
    },
    [token, logout],
  )
}
