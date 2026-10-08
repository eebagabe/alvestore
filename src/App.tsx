import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { CustomerProvider } from './context/CustomerContext'
import { ScrollToTop } from './components/ScrollToTop'
import { Login } from './pages/account/Login'
import { MyAccount } from './pages/account/MyAccount'
import { Register } from './pages/account/Register'
import { Cart } from './pages/Cart'
import { Catalog } from './pages/Catalog'
import { ProductDetail } from './pages/ProductDetail'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminLogin } from './pages/admin/AdminLogin'
import { ProductForm } from './pages/admin/products/ProductForm'
import { ProductList } from './pages/admin/products/ProductList'
import { SaleForm } from './pages/admin/sales/SaleForm'
import { SalesPage } from './pages/admin/sales/SalesPage'
import { CashPage } from './pages/admin/cash/CashPage'
import { DashboardPage } from './pages/admin/dashboard/DashboardPage'
import { PurchasesPage } from './pages/admin/purchases/PurchasesPage'
import { Financeiro, Marketing } from './pages/admin/sections'
import { StockPage } from './pages/admin/stock/StockPage'

export default function App() {
  return (
    <AuthProvider>
      <CustomerProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Catalog />} />
              <Route path="/produto/:id" element={<ProductDetail />} />
              <Route path="/carrinho" element={<Cart />} />
              <Route path="/entrar" element={<Login />} />
              <Route path="/cadastro" element={<Register />} />
              <Route path="/minha-conta" element={<MyAccount />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/painel" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="produtos" element={<ProductList />} />
                <Route path="produtos/novo" element={<ProductForm />} />
                <Route path="produtos/:id" element={<ProductForm />} />
                <Route path="compras" element={<PurchasesPage />} />
                <Route path="vendas" element={<SalesPage />} />
                <Route path="vendas/nova" element={<SaleForm />} />
                <Route path="caixa" element={<CashPage />} />
                <Route path="financeiro" element={<Financeiro />} />
                <Route path="marketing" element={<Marketing />} />
                <Route path="estoque" element={<StockPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </CustomerProvider>
    </AuthProvider>
  )
}
