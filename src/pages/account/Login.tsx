import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Footer } from '../../components/Footer'
import { Header } from '../../components/Header'
import { useCustomer } from '../../context/CustomerContext'
import { safeRedirect } from '../../utils/redirect'
import './Account.css'

export function Login() {
  const { account, login } = useCustomer()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = safeRedirect(params.get('voltar'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (account) return <Navigate to={redirect} replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
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
        <form className="account-card account-form" onSubmit={handleSubmit}>
          <h1>Entrar</h1>
          <p className="account-card__sub">Acesse sua conta para agilizar seus pedidos.</p>
          <label>
            E-mail
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Senha
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="account-form__error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="account-card__footer">
            Ainda não tem conta? <Link to={`/cadastro?voltar=${encodeURIComponent(redirect)}`}>Cadastre-se</Link>
          </p>
        </form>
      </main>
      <Footer />
    </>
  )
}
