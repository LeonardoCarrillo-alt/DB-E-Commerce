import { Route, Navigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import ProtectedRoute from '../components/common/ProtectedRoute'

import Dashboard from '../pages/admin/Dashboard'
import AdminProducts from '../pages/admin/Products'
import AdminOrders from '../pages/admin/Orders'
import Customers from '../pages/admin/Customers'
import Reports from '../pages/admin/Reports'

/**
 * Define las rutas anidadas del panel administrativo.
 * Se usa dentro de <Routes> en AppRoutes.tsx:
 *
 *   <Routes>
 *     ...rutas públicas...
 *     {AdminRoutes()}
 *   </Routes>
 *
 * Todas las rutas están protegidas y requieren rol ADMIN.
 */
export default function AdminRoutes() {
  return (
    <Route element={<ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN_TIENDA']} />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Route>
  )
}
