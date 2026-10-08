import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { PasswordInput } from '../../components/PasswordInput'
import { useCustomer } from '../../context/CustomerContext'
import { safeRedirect } from '../../utils/redirect'
import { AuthLayout } from './AuthLayout'

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
    <AuthLayout title="Entrar" subtitle="Acesse sua conta para agilizar seus pedidos.">
      <form className="account-form" onSubmit={handleSubmit}>
        <label>
          E-mail
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Senha
          <PasswordInput
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
    </AuthLayout>
  )
}
