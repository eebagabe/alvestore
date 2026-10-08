import { useState } from 'react'
import { lookupCep } from '../services/cep'
import type { Address } from '../types/account'
import { maskCep, onlyDigits } from '../utils/masks'

interface Props {
  value: Address
  onChange: (address: Address) => void
}

export function AddressFields({ value, onChange }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'notfound' | 'error'>('idle')

  const set = (patch: Partial<Address>) => onChange({ ...value, ...patch })

  const handleCep = async (raw: string) => {
    const zipCode = maskCep(raw)
    set({ zipCode })
    if (onlyDigits(zipCode).length !== 8) {
      setStatus('idle')
      return
    }

    setStatus('loading')
    try {
      const found = await lookupCep(zipCode)
      if (!found) {
        setStatus('notfound')
        return
      }
      onChange({ ...value, zipCode, ...found })
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="account-form__grid">
      <label>
        CEP
        <input
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          value={value.zipCode}
          onChange={(e) => handleCep(e.target.value)}
          required
        />
        {status === 'loading' && <small>Buscando endereço...</small>}
        {status === 'notfound' && <small className="account-form__warn">CEP não encontrado. Preencha manualmente.</small>}
        {status === 'error' && <small className="account-form__warn">Busca indisponível. Preencha manualmente.</small>}
      </label>
      <label>
        UF
        <input
          maxLength={2}
          value={value.state}
          onChange={(e) => set({ state: e.target.value.toUpperCase() })}
          required
        />
      </label>
      <label className="account-form__full">
        Rua
        <input
          autoComplete="address-line1"
          value={value.street}
          onChange={(e) => set({ street: e.target.value })}
          maxLength={150}
          required
        />
      </label>
      <label>
        Número
        <input value={value.number} onChange={(e) => set({ number: e.target.value })} maxLength={20} required />
      </label>
      <label>
        Complemento
        <input
          autoComplete="address-line2"
          value={value.complement ?? ''}
          onChange={(e) => set({ complement: e.target.value })}
          maxLength={100}
          placeholder="Apto, bloco..."
        />
      </label>
      <label>
        Bairro
        <input value={value.district} onChange={(e) => set({ district: e.target.value })} maxLength={100} required />
      </label>
      <label>
        Cidade
        <input
          autoComplete="address-level2"
          value={value.city}
          onChange={(e) => set({ city: e.target.value })}
          maxLength={100}
          required
        />
      </label>
    </div>
  )
}
