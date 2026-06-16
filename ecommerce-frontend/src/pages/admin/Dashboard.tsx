import { Box, Typography, Grid } from '@mui/material'
import StatsCards from '../../components/dashboard/StatsCards'
import SalesChart from '../../components/dashboard/SalesChart'
import CategoryChart from '../../components/dashboard/CategoryChart'
import OrderTable from '../../components/orders/OrderTable'
import { useAllOrders } from '../../hooks/useOrders'

export default function Dashboard() {
  const { data: orders } = useAllOrders()

  const totalVentas = orders?.reduce((sum, o) => sum + o.total, 0) ?? 0
  const totalPedidos = orders?.length ?? 0
  const ventasPorMes = orders?.reduce<Record<string, { ventas: number; pedidos: number }>>((acc, order) => {
    const fecha = new Date(order.createdAt).toLocaleString('es-VE', { month: 'short' })
    if (!acc[fecha]) acc[fecha] = { ventas: 0, pedidos: 0 }
    acc[fecha].ventas += order.total
    acc[fecha].pedidos += 1
    return acc
  }, {})

  const salesData = Object.entries(ventasPorMes ?? {})
    .slice(0, 6)
    .map(([fecha, values]) => ({ fecha, ...values }))

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Resumen general de la plataforma
      </Typography>

      <StatsCards ventas={totalVentas} clientes={248} productos={132} pedidos={totalPedidos} />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} lg={8}>
          <SalesChart data={salesData.length ? salesData : [{ fecha: 'Sin datos', ventas: 0, pedidos: 0 }]} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <CategoryChart />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Pedidos recientes
        </Typography>
        <OrderTable orders={(orders ?? []).slice(0, 5)} />
      </Box>
    </Box>
  )
}
