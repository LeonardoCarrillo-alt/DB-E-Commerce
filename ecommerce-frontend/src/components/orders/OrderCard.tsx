import { Card, CardContent, Typography, Box, Chip, Grid, Divider } from '@mui/material'
import { ORDER_STATUS_COLOR } from '../../utils/constants'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import type { Order } from '../../api/orderApi'

interface Props {
  order: Order
}

export default function OrderCard({ order }: Props) {
  // ✅ Extraer fecha con fallbacks
  const fechaOrden = order.createdAt || order.fecha_creacion || new Date().toISOString()
  
  // ✅ Validar que items existe
  const items = order.items || []

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Pedido #{order.id}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {/* ✅ Usar fecha con fallback */}
              {formatDate(fechaOrden) !== 'Fecha no disponible' ? formatDate(fechaOrden) : 'Fecha no disponible'}
            </Typography>
          </Box>
          <Chip
            label={order.estado || 'PENDIENTE'}
            color={ORDER_STATUS_COLOR[order.estado] ?? 'default'}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Items - ✅ Con validaciones */}
        {items.length > 0 ? (
          items.map((item, i) => {
            // ✅ Extraer precio con múltiples fallbacks
            const precio = item.precio || item.precioUnitario || 0
            const nombre = item.nombre || 'Producto sin nombre'
            const cantidad = item.cantidad || 0
            const monto = parseFloat(precio.toString()) * cantidad

            return (
              <Grid container key={i} sx={{ mb: 0.5 }}>
                <Grid item xs={8}>
                  <Typography variant="body2">
                    {nombre} × {cantidad}
                  </Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontWeight={600}>
                    {/* ✅ Verificar que monto es un número válido */}
                    {isNaN(monto) ? 'Bs 0,00' : formatCurrency(monto)}
                  </Typography>
                </Grid>
              </Grid>
            )
          })
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            Sin productos
          </Typography>
        )}

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            Total: {/* ✅ Validar total */}
            {isNaN(parseFloat((order.total || 0).toString()))
              ? 'Bs 0,00'
              : formatCurrency(parseFloat((order.total || 0).toString()))}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}