import { Box, Typography, Grid, CircularProgress } from '@mui/material'
import StatsCards from '../../components/dashboard/StatsCards'
import SalesChart from '../../components/dashboard/SalesChart'
import CategoryChart from '../../components/dashboard/CategoryChart'
import OrderTable from '../../components/orders/OrderTable'
import { useDashboardData } from '../../hooks/useDashboardData'

export default function Dashboard() {
  const { totalVentas, totalPedidos, activeProducts, clientes, salesData, categoryData, orders, isLoading } = useDashboardData()

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Resumen general de la plataforma
      </Typography>

      <StatsCards ventas={totalVentas} clientes={clientes} productos={activeProducts} pedidos={totalPedidos} />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} lg={8}>
          <SalesChart data={salesData} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <CategoryChart data={categoryData} title="Productos por categoría" />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Pedidos recientes
        </Typography>
        <OrderTable orders={orders.slice(0, 5)} />
      </Box>
    </Box>
  )
}
