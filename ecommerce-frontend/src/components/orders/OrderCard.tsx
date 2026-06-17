import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, Typography, Box, Chip, Grid, Divider } from '@mui/material'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import { ORDER_STATUS_COLOR } from '../../utils/constants'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { productApi } from '../../api/productApi'
import { useEnvioByPedido } from '../../hooks/useEnvio'
import type { Order } from '../../api/orderApi'

interface Props {
  order: Order
}

export default function OrderCard({ order }: Props) {
  const { data: products } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => productApi.getAll().then((res) => res.data),
  })

  const { data: envio } = useEnvioByPedido(order.id)

  const productMap = new Map<string, string>()
  products?.forEach((p) => {
    const id = p._id || p.id
    if (id) productMap.set(id, p.nombre)
  })

  const fechaOrden = order.createdAt || order.fecha_creacion || new Date().toISOString()
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

        {items.length > 0 ? (
          items.map((item, i) => {
            const precio = item.precio_unitario ?? 0
            const nombre = productMap.get(item.producto_id) || `Producto #${item.producto_id.slice(0, 8)}`
            const cantidad = item.cantidad || 0
            const monto = precio * cantidad

            return (
              <Grid container key={i} sx={{ mb: 0.5 }}>
                <Grid item xs={8}>
                  <Typography variant="body2">
                    {nombre} × {cantidad}
                  </Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontWeight={600}>
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

        {order.direccion_envio && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Dirección de envío:
            </Typography>
            <Typography variant="body2">{order.direccion_envio}</Typography>
          </Box>
        )}

        {envio && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocalShippingIcon fontSize="small" color="primary" />
            <Box>
              <Typography variant="caption" color="text.secondary">
                {envio.proveedor} — {envio.tracking_number}
              </Typography>
              <Chip
                label={envio.estado}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ ml: 1, fontWeight: 600, height: 20, fontSize: 11 }}
              />
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            Total: {isNaN(parseFloat((order.total || 0).toString()))
              ? 'Bs 0,00'
              : formatCurrency(parseFloat((order.total || 0).toString()))}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}