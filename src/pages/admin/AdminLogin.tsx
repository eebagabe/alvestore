import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { useAuth } from '../../context/AuthContext'
import './Admin.css'

export function AdminLogin() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) return <Navigate to="/admin/painel" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/admin/painel')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar.')
    }
  }

  return (
    <div className="login">
      <form className="login__box" onSubmit={handleSubmit}>
        <img src={logo} alt="AlveStore" className="login__logo" />
        <h1>Área administrativa</h1>
        <p>Entre para gerenciar a loja.</p>

        <label>
          E-mail
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
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

        {error && <span className="login__error">{error}</span>}

        <button type="submit" className="btn btn-primary">
          Entrar
        </button>
      </form>
    </div>
  )
}
