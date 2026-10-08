import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AddressFields } from '../../components/AddressFields'
import { Footer } from '../../components/Footer'
import { Header } from '../../components/Header'
import { useCustomer } from '../../context/CustomerContext'
import { emptyAddress, formatAddress, type Account, type Address } from '../../types/account'
import { maskPhone } from '../../utils/masks'
import './Account.css'

export function MyAccount() {
  const { account, loading, logout } = useCustomer()

  if (loading) {
    return (
      <>
        <Header />
        <main className="container account-page">
          <p>Carregando...</p>
        </main>
        <Footer />
      </>
    )
  }

  if (!account) return <Navigate to="/entrar?voltar=/minha-conta" replace />

  return (
    <>
      <Header />
      <main className="container account-page">
        <AccountDetails key={account.id} account={account} onLogout={logout} />
      </main>
      <Footer />
    </>
  )
}

function AccountDetails({ account, onLogout }: { account: Account; onLogout: () => void }) {
  const { update } = useCustomer()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(account.name)
  const [phone, setPhone] = useState(maskPhone(account.phone ?? ''))
  const [address, setAddress] = useState<Address>(() =>
    account.address
      ? { ...account.address, zipCode: account.address.zipCode.replace(/^(\d{5})(\d{3})$/, '$1-$2') }
      : emptyAddress(),
  )
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await update({ name, phone, address })
      setEditing(false)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  if (!editing) {
    return (
      <div className="account-card account-card--wide">
        <h1>Olá, {account.name.split(' ')[0]}!</h1>
        <dl className="account-info">
          <dt>Nome</dt>
          <dd>{account.name}</dd>
          <dt>E-mail</dt>
          <dd>{account.email}</dd>
          <dt>Telefone</dt>
          <dd>{account.phone ? maskPhone(account.phone) : '—'}</dd>
          <dt>Endereço</dt>
          <dd>{account.address ? formatAddress(account.address) : 'Não cadastrado'}</dd>
        </dl>
        <div className="account-form__actions">
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Sair
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setEditing(true)}>
            Editar dados
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="account-card account-card--wide account-form" onSubmit={handleSubmit}>
      <h1>Editar dados</h1>
      <div className="account-form__grid">
        <label className="account-form__full">
          Nome completo
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={150} required />
        </label>
        <label className="account-form__full">
          Telefone (WhatsApp)
          <input type="tel" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} required />
        </label>
      </div>
      <h2>Endereço</h2>
      <AddressFields value={address} onChange={setAddress} />
      {error && <p className="account-form__error">{error}</p>}
      <div className="account-form__actions">
        <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
