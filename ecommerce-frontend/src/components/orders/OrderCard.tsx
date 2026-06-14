import { Card, CardContent, Typography, Box, Chip, Grid, Divider } from '@mui/material'
import { ORDER_STATUS_COLOR } from '../../utils/constants'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import type { Order } from '../../api/orderApi'

interface Props {
  order: Order
}

export default function OrderCard({ order }: Props) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Pedido #{order.id}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(order.createdAt)}
            </Typography>
          </Box>
          <Chip
            label={order.estado}
            color={ORDER_STATUS_COLOR[order.estado] ?? 'default'}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Items */}
        {order.items.map((item, i) => (
          <Grid container key={i} sx={{ mb: 0.5 }}>
            <Grid item xs={8}>
              <Typography variant="body2">{item.nombre} × {item.cantidad}</Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'right' }}>
              <Typography variant="body2" fontWeight={600}>
                {formatCurrency(item.precio * item.cantidad)}
              </Typography>
            </Grid>
          </Grid>
        ))}

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            Total: {formatCurrency(order.total)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
