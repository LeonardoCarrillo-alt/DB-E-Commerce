import { Grid, Card, CardContent, Typography, Box } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import PeopleIcon from '@mui/icons-material/People'
import InventoryIcon from '@mui/icons-material/Inventory'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import { formatCurrency } from '../../utils/formatCurrency'

interface Stat {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
  change?: string
}

interface Props {
  ventas?: number
  clientes?: number
  productos?: number
  pedidos?: number
}

export default function StatsCards({ ventas = 0, clientes = 0, productos = 0, pedidos = 0 }: Props) {
  const stats: Stat[] = [
    {
      label: 'Ventas totales',
      value: formatCurrency(ventas),
      icon: <TrendingUpIcon />,
      color: '#5c6bc0',
      change: '+12.5% este mes',
    },
    {
      label: 'Clientes',
      value: clientes,
      icon: <PeopleIcon />,
      color: '#ff6f61',
      change: '+8 nuevos hoy',
    },
    {
      label: 'Productos activos',
      value: productos,
      icon: <InventoryIcon />,
      color: '#66bb6a',
    },
    {
      label: 'Pedidos totales',
      value: pedidos,
      icon: <ShoppingBagIcon />,
      color: '#ffa726',
      change: '3 pendientes',
    },
  ]

  return (
    <Grid container spacing={3}>
      {stats.map((stat) => (
        <Grid item xs={12} sm={6} xl={3} key={stat.label}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, color: stat.color }}>
                    {stat.value}
                  </Typography>
                  {stat.change && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {stat.change}
                    </Typography>
                  )}
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: stat.color + '18',
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
