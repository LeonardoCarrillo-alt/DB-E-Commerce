import {
  Card, CardMedia, CardContent, CardActions,
  Typography, Button, IconButton, Chip, Box, Tooltip,
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Link } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks/useAuth'
import { addItem } from '../../store/slices/cartSlice'
import { cartService } from '../../services/cartService'
import { formatCurrency } from '../../utils/formatCurrency'
import type { Product } from '../../api/productApi'
import { truncateText } from '../../utils/helpers'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const dispatch = useAppDispatch()

  /**
   * Mapeo de IDs:
   * - MongoDB retorna "_id" (nativo de MongoDB)
   * - Frontend Redux normaliza a "productoId" internamente
   * - Backend espera "productoId" en requests (DTO AgregarItemDTO)
   * 
   * Este componente:
   * 1. Despacha a Redux con "productoId" (normalizado)
   * 2. Llama cartService con el _id real de MongoDB
   */
  const handleAddToCart = async () => {
    // 🔴 CRÍTICO: Extraer el ID real del documento MongoDB
    const mongoId = product._id || product.id
    
    if (!mongoId) {
      console.error('❌ ProductCard: producto sin ID válido:', product)
      return
    }

    console.log('=== ProductCard: handleAddToCart ===')
    console.log('MongoDB _id:', mongoId)
    console.log('Product:', product)

    // 1️⃣ Despachar a Redux con estructura normalizada
    dispatch(
      addItem({
        productoId: mongoId, // ← Redux usa "productoId" (normalizado)
        nombre: product.nombre,
        precio: product.precio,
        cantidad: 1,
        imagen: product.imagenes?.[0] || '',
      })
    )
    console.log('✅ Despachado a Redux con productoId:', mongoId)

    // 2️⃣ Sincronizar con backend
    try {
      const response = await cartService.addItem(mongoId, 1)
      console.log('✅ Backend sincronizado. Respuesta:', response)
    } catch (err) {
      console.error('❌ Error al sincronizar con backend:', err)
      // El Redux dispatch ya ocurrió, así que el carrito local refleja el cambio
      // El error del backend es lógica "eventual consistency"
    }
  }

  const imagenUrl = product.imagenes?.[0] || 'https://placehold.co/400x300?text=Sin+Imagen'
  const agotado = (product.stock_disponible ?? 0) === 0

  return (
    <Card
      component={Link}
      to={`/catalog/${product._id || product.id}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-4px)',
        },
      }}
    >
      {/* Imagen y badges */}
      <Box sx={{ position: 'relative', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
        <CardMedia
          component="img"
          height={220}
          image={imagenUrl}
          alt={product.nombre}
          sx={{
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />

        {/* Badge de agotado */}
        {agotado && (
          <Chip
            label="Agotado"
            size="small"
            color="error"
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              fontWeight: 700,
            }}
          />
        )}

        {/* Botón de favoritos */}
        <Tooltip title="Agregar a favoritos">
          <IconButton
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255,255,255,0.9)',
              '&:hover': {
                backgroundColor: 'white',
              },
              transition: 'all 0.2s',
            }}
            onClick={(e) => {
              e.preventDefault()
              // TODO: Implementar wishlist
            }}
          >
            <FavoriteBorderIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Contenido */}
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Categoría */}
        <Chip
          label={product.categoria || 'Sin categoría'}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mb: 1 }}
        />

        {/* Nombre */}
        <Typography
          variant="subtitle1"
          fontWeight={700}
          gutterBottom
          sx={{
            minHeight: '2.5em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {truncateText(product.nombre, 50)}
        </Typography>

        {/* Material (si existe) */}
        {product.atributos?.material && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            {product.atributos.material}
          </Typography>
        )}

        {/* Precio */}
        <Typography
          variant="h6"
          color="primary.main"
          fontWeight={800}
          sx={{ mt: 1 }}
        >
          {formatCurrency(product.precio)}
        </Typography>

        {/* Stock disponible */}
        <Typography
          variant="caption"
          color={agotado ? 'error.main' : 'success.main'}
          fontWeight={600}
          sx={{ mt: 0.5, display: 'block' }}
        >
          {agotado ? 'Sin stock' : `${product.stock} disponible(s)`}
        </Typography>
      </CardContent>

      {/* Acciones */}
      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={(e) => {
            e.preventDefault()
            handleAddToCart()
          }}
          disabled={agotado}
          size="small"
          sx={{
            fontWeight: 700,
            textTransform: 'none',
          }}
        >
          {agotado ? 'Agotado' : 'Agregar al carrito'}
        </Button>
      </CardActions>
    </Card>
  )
}