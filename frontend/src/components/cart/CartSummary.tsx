import { Box, Typography, Divider } from '@mui/material'
import { useCart } from '../../store/hooks/useAuth'
import { formatCurrency } from '../../utils/formatCurrency'

interface Props {
  compact?: boolean
}

export default function CartSummary({ compact = false }: Props) {
  const { items, total } = useCart()

  const subtotal = total
  const shipping = subtotal > 200 ? 0 : 15
  const finalTotal = subtotal + shipping

  return (
    <Box>
      {!compact && (
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Resumen del pedido
        </Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography variant="body2" color="text.secondary">
          Subtotal ({items.reduce((s, i) => s + i.cantidad, 0)} artículos)
        </Typography>
        <Typography variant="body2" fontWeight={600}>{formatCurrency(subtotal)}</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography variant="body2" color="text.secondary">Envío</Typography>
        <Typography variant="body2" fontWeight={600} color={shipping === 0 ? 'success.main' : 'inherit'}>
          {shipping === 0 ? 'Gratis' : formatCurrency(shipping)}
        </Typography>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant={compact ? 'body1' : 'h6'} fontWeight={700}>Total</Typography>
        <Typography variant={compact ? 'body1' : 'h6'} fontWeight={800} color="primary.main">
          {formatCurrency(finalTotal)}
        </Typography>
      </Box>

      {shipping === 0 && (
        <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
          ¡Envío gratis en pedidos mayores a {formatCurrency(200)}!
        </Typography>
      )}
    </Box>
  )
}
