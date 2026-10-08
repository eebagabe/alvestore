import type { Address } from '../types/account'
import { onlyDigits } from '../utils/masks'

interface ViaCepResponse {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean | string
}

/** Consulta o ViaCEP. Retorna null se o CEP não existir. */
export async function lookupCep(cep: string): Promise<Partial<Address> | null> {
  const digits = onlyDigits(cep)
  if (digits.length !== 8) return null

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
  if (!response.ok) throw new Error('Não foi possível consultar o CEP.')

  const data = (await response.json()) as ViaCepResponse
  if (data.erro) return null

  return { street: data.logradouro, district: data.bairro, city: data.localidade, state: data.uf }
}
