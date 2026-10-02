import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { Catalog } from './pages/Catalog'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminLogin } from './pages/admin/AdminLogin'
import { Estoque, Financeiro, Marketing } from './pages/admin/sections'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/painel" element={<AdminLayout />}>
              <Route index element={<Navigate to="estoque" replace />} />
              <Route path="financeiro" element={<Financeiro />} />
              <Route path="marketing" element={<Marketing />} />
              <Route path="estoque" element={<Estoque />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
