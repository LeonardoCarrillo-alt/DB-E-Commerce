import { Box, Typography, Grid } from '@mui/material'
import StatsCards from '../../components/dashboard/StatsCards'
import SalesChart from '../../components/dashboard/SalesChart'
import CategoryChart from '../../components/dashboard/CategoryChart'
import OrderTable from '../../components/orders/OrderTable'
import { useAllOrders } from '../../hooks/useOrders'

const mockSalesData = [
  { fecha: 'Ene', ventas: 12400, pedidos: 64 },
  { fecha: 'Feb', ventas: 9800, pedidos: 51 },
  { fecha: 'Mar', ventas: 15600, pedidos: 83 },
  { fecha: 'Abr', ventas: 14200, pedidos: 74 },
  { fecha: 'May', ventas: 19800, pedidos: 102 },
  { fecha: 'Jun', ventas: 17500, pedidos: 91 },
]

export default function Dashboard() {
  const { data: orders } = useAllOrders()

  const totalVentas = orders?.reduce((sum, o) => sum + o.total, 0) ?? 89300
  const totalPedidos = orders?.length ?? 465

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
          <SalesChart data={mockSalesData} />
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
