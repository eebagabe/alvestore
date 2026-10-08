const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5181'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Resolve caminhos servidos pela API (ex.: /uploads/foto.jpg) para URL absoluta. */
export const assetUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${API_URL}${path}`)

function errorMessage(body: unknown): string {
  if (body && typeof body === 'object') {
    const { message, errors } = body as { message?: string; errors?: Record<string, string[]> }
    if (message) return message
    if (errors) return 'Verifique os campos informados.'
  }
  return 'Erro inesperado no servidor.'
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor.')
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(response.status, errorMessage(body))
  }

  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}
