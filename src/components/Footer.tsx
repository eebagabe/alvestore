import './Footer.css'

const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        © {CURRENT_YEAR} AlveStore · Maceió - AL · Qualidade • Praticidade • Sempre com você
      </div>
    </footer>
  )
}
