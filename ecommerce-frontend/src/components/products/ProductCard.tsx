import {
  Card, CardMedia, CardContent, CardActions,
  Typography, Button, IconButton, Chip, Box, Tooltip,
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Link } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks/useAuth'
import { addItem } from '../../store/slices/cartSlice'
import { formatCurrency } from '../../utils/formatCurrency'
import type { Product } from '../../api/productApi'
import { truncateText } from '../../utils/helpers'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const dispatch = useAppDispatch()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    dispatch(
      addItem({
        productId: product.id,
        nombre: product.nombre,
        precio: product.precio,
        cantidad: 1,
        imagen: product.imagenes?.[0],
      })
    )
  }

  return (
    <Card
      component={Link}
      to={`/catalog/${product.id}`}
      sx={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none' }}
    >
      {/* Imagen */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height={220}
          image={product.imagenes?.[0] || 'https://placehold.co/400x300?text=Sin+Imagen'}
          alt={product.nombre}
          sx={{ objectFit: 'cover' }}
        />
        {product.stock === 0 && (
          <Chip
            label="Agotado"
            size="small"
            color="error"
            sx={{ position: 'absolute', top: 10, left: 10 }}
          />
        )}
        <Tooltip title="Agregar a favoritos">
          <IconButton
            size="small"
            sx={{
              position: 'absolute', top: 8, right: 8,
              bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' },
            }}
            onClick={(e) => e.preventDefault()}
          >
            <FavoriteBorderIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Chip label={product.categoria} size="small" color="primary" variant="outlined" sx={{ mb: 1 }} />
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          {truncateText(product.nombre, 50)}
        </Typography>
        {product.atributos?.material && (
          <Typography variant="caption" color="text.secondary">
            {product.atributos?.material}
          </Typography>
        )}
        <Typography variant="h6" color="primary.main" fontWeight={800} sx={{ mt: 1 }}>
          {formatCurrency(product.precio)}
        </Typography>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          size="small"
        >
          {product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
        </Button>
      </CardActions>
    </Card>
  )
}
