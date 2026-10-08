import type { ReactNode } from 'react'
import logo from '../../assets/logo.png'
import { Footer } from '../../components/Footer'
import { Header } from '../../components/Header'
import './Account.css'

const PERKS = [
  'Pedido montado em poucos cliques',
  'Endereço salvo para entrega em Maceió',
  'Atendimento direto pelo WhatsApp',
]

interface Props {
  title: string
  subtitle: string
  children: ReactNode
}

/** Moldura das telas de entrar/cadastrar: painel da marca à esquerda, formulário à direita. */
export function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <>
      <Header />
      <main className="container account-page">
        <div className="auth">
          <aside className="auth__brand">
            <img src={logo} alt="" className="auth__logo" />
            <h2>
              Alve<strong>Store</strong>
            </h2>
            <p>Qualidade e praticidade, sempre com você.</p>
            <ul>
              {PERKS.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
          </aside>
          <section className="auth__body">
            <h1>{title}</h1>
            <p className="account-card__sub">{subtitle}</p>
            {children}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
