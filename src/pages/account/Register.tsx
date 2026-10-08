import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { AddressFields } from '../../components/AddressFields'
import { Footer } from '../../components/Footer'
import { Header } from '../../components/Header'
import { useCustomer } from '../../context/CustomerContext'
import { apiRequest } from '../../services/api'
import { emptyAddress, type Address } from '../../types/account'
import { maskPhone, onlyDigits } from '../../utils/masks'
import { safeRedirect } from '../../utils/redirect'
import './Account.css'

export function Register() {
  const { account, register } = useCustomer()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = safeRedirect(params.get('voltar'))
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [address, setAddress] = useState<Address>(emptyAddress)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (account) return <Navigate to={redirect} replace />

  const handleStep1 = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (onlyDigits(phone).length < 10) return setError('Informe um telefone com DDD.')
    if (password.length < 8) return setError('A senha deve ter pelo menos 8 caracteres.')
    if (password !== confirmPassword) return setError('As senhas não conferem.')

    setLoading(true)
    try {
      const { available } = await apiRequest<{ available: boolean }>(
        `/api/account/email-available?email=${encodeURIComponent(email)}`,
      )
      if (!available) {
        setError('Este e-mail já está cadastrado. Faça login.')
        return
      }
      setStep(2)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleStep2 = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ name, phone, email, password, address })
      navigate(redirect, { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="container account-page">
        <div className="account-card">
          <h1>Criar conta</h1>
          <ol className="steps">
            <li className={step === 1 ? 'is-active' : 'is-done'}>1. Seus dados</li>
            <li className={step === 2 ? 'is-active' : ''}>2. Endereço</li>
          </ol>

          {step === 1 ? (
            <form className="account-form" onSubmit={handleStep1}>
              <label>
                Nome completo
                <input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={150} required />
              </label>
              <label>
                Telefone (WhatsApp)
                <input
                  type="tel"
                  autoComplete="tel"
                  placeholder="(82) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  required
                />
              </label>
              <label>
                E-mail
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={200}
                  required
                />
              </label>
              <label>
                Senha
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <small>Mínimo de 8 caracteres.</small>
              </label>
              <label>
                Confirmar senha
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </label>
              {error && <p className="account-form__error">{error}</p>}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Verificando...' : 'Continuar'}
              </button>
            </form>
          ) : (
            <form className="account-form" onSubmit={handleStep2}>
              <p className="account-card__sub">Digite o CEP que preenchemos o resto para você.</p>
              <AddressFields value={address} onChange={setAddress} />
              {error && <p className="account-form__error">{error}</p>}
              <div className="account-form__actions">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                  Voltar
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Criando conta...' : 'Criar conta'}
                </button>
              </div>
            </form>
          )}

          <p className="account-card__footer">
            Já tem conta? <Link to={`/entrar?voltar=${encodeURIComponent(redirect)}`}>Entrar</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
