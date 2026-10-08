import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useCart } from '../context/CartContext'
import './Header.css'

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 3h3l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h9.2a1.5 1.5 0 0 0 1.5-1.2L21 7H6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="20" r="1.5" />
      <circle cx="17.5" cy="20" r="1.5" />
    </svg>
  )
}

export function Header() {
  const { count } = useCart()

  return (
    <header className="header">
      <div className="header__topbar">Entrega rápida em toda Maceió</div>
      <div className="container header__main">
        <Link to="/" className="header__brand">
          <img src={logo} alt="AlveStore" />
          <span>
            Alve<strong>Store</strong>
          </span>
        </Link>

        <div className="header__actions">
          {/* TODO: rota de login do cliente */}
          <button type="button" className="header__action">
            <UserIcon />
            <span className="header__action-text">
              <small>Olá, faça seu login</small>
              <strong>Entrar ou cadastrar</strong>
            </span>
          </button>

          <Link to="/carrinho" className="header__action">
            <span className="header__cart">
              <CartIcon />
              {count > 0 && <span className="header__badge">{count}</span>}
            </span>
            <span className="header__action-text">
              <small>Meu</small>
              <strong>Carrinho</strong>
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}
