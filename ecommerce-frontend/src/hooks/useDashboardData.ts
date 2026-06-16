import { useQuery } from '@tanstack/react-query'
import { orderApi } from '../api/orderApi'
import { productApi } from '../api/productApi'
import { userApi } from '../api/userApi'

export function useDashboardData() {
  const ordersQuery = useQuery({
    queryKey: ['orders', 'all'],
    queryFn: () => orderApi.getAll().then((res) => res.data),
  })

  const productsQuery = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => productApi.getAll().then((res) => res.data),
  })

  const usersQuery = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => userApi.getAll().then((res) => res.data),
  })

  const orders = ordersQuery.data ?? []
  const products = productsQuery.data ?? []
  const users = usersQuery.data ?? []

  const isLoading = ordersQuery.isLoading || productsQuery.isLoading || usersQuery.isLoading

  const totalVentas = orders.reduce((sum, o) => sum + o.total, 0)
  const totalPedidos = orders.length
  const activeProducts = products.filter((p) => p.activo !== false).length
  const clientes = users.filter((u) => u.rol === 'CLIENTE').length

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const monthlyMap: Record<string, { ventas: number; pedidos: number }> = {}

  orders.forEach((order) => {
    if (!order.fecha_creacion) return
    const date = new Date(order.fecha_creacion)
    if (isNaN(date.getTime())) return
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyMap[key]) monthlyMap[key] = { ventas: 0, pedidos: 0 }
    monthlyMap[key].ventas += order.total
    monthlyMap[key].pedidos += 1
  })

  const salesData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, val]) => ({
      fecha: monthNames[parseInt(key.split('-')[1], 10) - 1] || key,
      ventas: val.ventas,
      pedidos: val.pedidos,
    }))

  const categoryMap: Record<string, number> = {}
  products.forEach((p) => {
    const cat = p.categoria || 'Sin categoría'
    categoryMap[cat] = (categoryMap[cat] || 0) + 1
  })

  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const productMap = new Map<string, string>()
  products.forEach((p) => {
    const id = p._id || p.id
    if (id) productMap.set(id, p.nombre)
  })

  const productSalesMap: Record<string, { producto: string; ventas: number }> = {}
  orders.forEach((order) => {
    ;(order.items ?? []).forEach((item) => {
      const id = item.producto_id
      const nombre = productMap.get(id) || `ID: ${id.slice(0, 8)}...`
      if (!productSalesMap[id]) productSalesMap[id] = { producto: nombre, ventas: 0 }
      productSalesMap[id].ventas += item.cantidad
    })
  })

  const topProductsData = Object.values(productSalesMap)
    .sort((a, b) => b.ventas - a.ventas)
    .slice(0, 5)
    .map((p) => ({ producto: p.producto, ventas: p.ventas }))

  return {
    totalVentas,
    totalPedidos,
    activeProducts,
    clientes,
    salesData,
    categoryData,
    orders,
    topProductsData,
    isLoading,
  }
}
