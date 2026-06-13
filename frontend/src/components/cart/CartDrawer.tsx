import {
  Drawer, Box, Typography, Button, Divider, IconButton, Badge,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks/useAuth'
import { useCart } from '../../store/hooks/useAuth'
import { closeCart } from '../../store/slices/cartSlice'
import { formatCurrency } from '../../utils/formatCurrency'
import CartItem from './CartItem'
import CartSummary from './CartSummary'

export default function CartDrawer() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, isOpen, total } = useCart()

  const handleCheckout = () => {
    dispatch(closeCart())
    navigate('/checkout')
  }

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={() => dispatch(closeCart())}
      PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}
    >
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Badge badgeContent={items.length} color="secondary">
          <ShoppingCartCheckoutIcon color="primary" />
        </Badge>
        <Typography variant="h6" fontWeight={700} sx={{ ml: 1.5, flex: 1 }}>
          Tu carrito
        </Typography>
        <IconButton onClick={() => dispatch(closeCart())}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Items */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5 }}>
        {items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">Tu carrito está vacío</Typography>
          </Box>
        ) : (
          items.map((item) => <CartItem key={item.productId} item={item} />)
        )}
      </Box>

      {/* Footer */}
      {items.length > 0 && (
        <Box sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <CartSummary compact />
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleCheckout}
            sx={{ mt: 2, py: 1.5 }}
          >
            Proceder al pago — {formatCurrency(total)}
          </Button>
        </Box>
      )}
    </Drawer>
  )
}
