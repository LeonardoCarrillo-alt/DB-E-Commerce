import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'
import ProtectedRoute from '../components/common/ProtectedRoute'
import AdminRoutes from './AdminRoutes'

// Páginas públicas
import Home from '../pages/public/Home'
import Catalog from '../pages/public/Catalog'
import ProductPage from '../pages/public/ProductPage'
import Login from '../pages/public/Login'
import Register from '../pages/public/Register'
import NotFound from '../pages/public/NotFound'

// Páginas cliente
import Profile from '../pages/customer/Profile'
import Cart from '../pages/customer/Cart'
import Checkout from '../pages/customer/Checkout'
import Orders from '../pages/customer/Orders'
import Wishlist from '../pages/customer/Wishlist'

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Rutas Públicas ── */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/:id" element={<ProductPage />} />
        <Route path="/404" element={<NotFound />} />
      </Route>

      {/* ── Rutas de Autenticación ── */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* ── Rutas de Cliente (autenticado) ── */}
      <Route element={<ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN_TIENDA', 'VENDEDOR', 'CLIENTE']} />}>
        <Route element={<MainLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Route>
      </Route>

      {/* ── Rutas de Admin (definidas en AdminRoutes.tsx) ── */}
      {AdminRoutes()}

      {/* ── Catch-all ── */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
