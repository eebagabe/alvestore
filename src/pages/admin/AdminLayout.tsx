import { NavLink, Navigate, Outlet } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { useAuth } from '../../context/AuthContext'
import './Admin.css'

const sections = [
  { to: 'dashboard', label: 'Dashboard' },
  { to: 'produtos', label: 'Produtos' },
  { to: 'estoque', label: 'Estoque' },
  { to: 'compras', label: 'Compras' },
  { to: 'vendas', label: 'Vendas' },
  { to: 'caixa', label: 'Caixa' },
  { to: 'financeiro', label: 'Financeiro' },
  { to: 'marketing', label: 'Marketing' },
]

export function AdminLayout() {
  const { user, logout } = useAuth()

  if (!user) return <Navigate to="/admin" replace />

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__brand">
          <img src={logo} alt="" />
          <span>
            Alve<strong>Store</strong>
          </span>
        </div>
        <nav>
          {sections.map((s) => (
            <NavLink key={s.to} to={s.to}>
              {s.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin__user">
          <div className="admin__account">
            <span className="admin__avatar">{user.name.charAt(0).toUpperCase()}</span>
            <span className="admin__who">
              <strong>{user.name}</strong>
              <small title={user.email}>{user.email}</small>
            </span>
          </div>
          <button className="btn btn-ghost" onClick={logout}>
            Sair
          </button>
        </div>
      </aside>
      <main className="admin__content">
        <Outlet />
      </main>
    </div>
  )
}
