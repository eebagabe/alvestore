import { NavLink, Navigate, Outlet } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { useAuth } from '../../context/AuthContext'
import './Admin.css'

const sections = [
  { to: 'financeiro', label: 'Financeiro' },
  { to: 'marketing', label: 'Marketing' },
  { to: 'estoque', label: 'Estoque' },
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
          <small>{user.name} · {user.email}</small>
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
