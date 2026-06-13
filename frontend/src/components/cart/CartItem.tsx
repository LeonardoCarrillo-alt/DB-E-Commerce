import {
  Box, Typography, IconButton, TextField, Avatar,
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useAppDispatch } from '../../store/hooks/useAuth'
import { removeItem, updateQuantity } from '../../store/slices/cartSlice'
import { formatCurrency } from '../../utils/formatCurrency'
import type { CartItem as CartItemType } from '../../store/slices/cartSlice'

interface Props {
  item: CartItemType
}

export default function CartItem({ item }: Props) {
  const dispatch = useAppDispatch()

  return (
    <Box sx={{ display: 'flex', gap: 2, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Avatar
        src={item.imagen}
        variant="rounded"
        sx={{ width: 70, height: 70, bgcolor: 'grey.100' }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>{item.nombre}</Typography>
        <Typography variant="caption" color="primary.main" fontWeight={700}>
          {formatCurrency(item.precio)}
        </Typography>

        {/* Cantidad */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
          <IconButton
            size="small"
            onClick={() => dispatch(updateQuantity({ productId: item.productId, cantidad: item.cantidad - 1 }))}
            disabled={item.cantidad <= 1}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          <TextField
            value={item.cantidad}
            size="small"
            inputProps={{ style: { textAlign: 'center', width: 32, padding: '4px' } }}
            onChange={(e) => {
              const val = parseInt(e.target.value)
              if (!isNaN(val) && val > 0) {
                dispatch(updateQuantity({ productId: item.productId, cantidad: val }))
              }
            }}
          />
          <IconButton
            size="small"
            onClick={() => dispatch(updateQuantity({ productId: item.productId, cantidad: item.cantidad + 1 }))}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <IconButton size="small" color="error" onClick={() => dispatch(removeItem(item.productId))}>
          <DeleteOutlineIcon />
        </IconButton>
        <Typography variant="body2" fontWeight={700}>
          {formatCurrency(item.precio * item.cantidad)}
        </Typography>
      </Box>
    </Box>
  )
}
