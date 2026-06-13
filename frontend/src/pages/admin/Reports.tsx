import { Box, Typography, Grid, Card, CardContent, MenuItem, Select, FormControl, InputLabel, Stack } from '@mui/material'
import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import SalesChart from '../../components/dashboard/SalesChart'
import CategoryChart from '../../components/dashboard/CategoryChart'
import StatsCards from '../../components/dashboard/StatsCards'
import { formatCurrency } from '../../utils/formatCurrency'

const topProductsData = [
  { producto: 'Laptop HP', ventas: 45 },
  { producto: 'Polera Básica', ventas: 38 },
  { producto: 'Silla Oficina', ventas: 29 },
  { producto: 'Smart TV 55"', ventas: 24 },
  { producto: 'Juego de Ollas', ventas: 21 },
]

const monthlySales = [
  { fecha: 'Ene', ventas: 12400, pedidos: 64 },
  { fecha: 'Feb', ventas: 9800, pedidos: 51 },
  { fecha: 'Mar', ventas: 15600, pedidos: 83 },
  { fecha: 'Abr', ventas: 14200, pedidos: 74 },
  { fecha: 'May', ventas: 19800, pedidos: 102 },
  { fecha: 'Jun', ventas: 17500, pedidos: 91 },
]

export default function Reports() {
  const [period, setPeriod] = useState('6m')

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Reportes</Typography>
          <Typography variant="body2" color="text.secondary">
            Análisis y estadísticas de la plataforma
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Período</InputLabel>
          <Select value={period} label="Período" onChange={(e) => setPeriod(e.target.value)}>
            <MenuItem value="1m">Último mes</MenuItem>
            <MenuItem value="3m">Últimos 3 meses</MenuItem>
            <MenuItem value="6m">Últimos 6 meses</MenuItem>
            <MenuItem value="1y">Último año</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Box sx={{ mb: 3 }}>
        <StatsCards ventas={89300} clientes={248} productos={132} pedidos={465} />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <SalesChart data={monthlySales} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <CategoryChart />
        </Grid>

        {/* Top productos */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Productos más vendidos
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductsData} layout="vertical" margin={{ left: 30, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="producto" tick={{ fontSize: 12 }} width={110} />
                  <Tooltip formatter={(value) => [`${value} unidades`, 'Vendidos']} />
                  <Legend />
                  <Bar dataKey="ventas" fill="#5c6bc0" radius={[0, 6, 6, 0]} name="Unidades vendidas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Resumen financiero */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Resumen financiero
              </Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'Ingresos brutos', value: 89300 },
                  { label: 'Ticket promedio', value: 192 },
                  { label: 'Ingresos por envío', value: 3450 },
                  { label: 'Devoluciones', value: -1240 },
                ].map((item) => (
                  <Grid item xs={6} sm={3} key={item.label}>
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    <Typography variant="h6" fontWeight={800} color={item.value < 0 ? 'error.main' : 'text.primary'}>
                      {formatCurrency(item.value)}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
