import { useState } from 'react'
import {
  Box, Typography, Grid, Button, Chip, Stack, Divider,
  IconButton, Card, CardMedia,
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useAppDispatch } from '../../store/hooks/useAuth'
import { addItem, openCart } from '../../store/slices/cartSlice'
import { formatCurrency } from '../../utils/formatCurrency'
import type { Product } from '../../api/productApi'

interface Props {
  product: Product
}

// Atributos dinámicos relevantes a mostrar por categoría (esquema BSON flexible)
const DYNAMIC_ATTR_LABELS: Record<string, string> = {
  voltaje: 'Voltaje',
  ram: 'Memoria RAM',
  tallas: 'Tallas disponibles',
  material: 'Material',
  dimensiones: 'Dimensiones',
  estilo: 'Estilo',
  capacidad: 'Capacidad',
}

export default function ProductDetails({ product }: Props) {
  const dispatch = useAppDispatch()
  const [selectedImage, setSelectedImage] = useState(0)
  const [cantidad, setCantidad] = useState(1)

  const images = product.imagenes?.length ? product.imagenes : ['https://via.placeholder.com/600x500?text=Sin+imagen']

  const handleAddToCart = () => {
    dispatch(addItem({
      productId: product._id,
      nombre: product.nombre,
      precio: product.precio,
      cantidad,
      imagen: images[0],
    }))
    dispatch(openCart())
  }

  // Extrae atributos dinámicos presentes en el documento (no estándar)
  const dynamicAttrs = Object.entries(DYNAMIC_ATTR_LABELS)
    .filter(([key]) => (product.atributos as Record<string, unknown>)[key] !== undefined)
    .map(([key, label]) => ({
      label,
      value: Array.isArray((product.atributos as Record<string, unknown>)[key]) ? ((product.atributos as Record<string, unknown>)[key] as string[]).join(', ') : String((product.atributos as Record<string, unknown>)[key]),
    }))

  return (
    <Grid container spacing={4}>
      {/* Galería de imágenes */}
      <Grid item xs={12} md={6}>
        <Card sx={{ mb: 1.5, '&:hover': { transform: 'none' } }}>
          <CardMedia
            component="img"
            image={images[selectedImage]}
            alt={product.nombre}
            sx={{ height: { xs: 300, md: 460 }, objectFit: 'cover' }}
          />
        </Card>
        {images.length > 1 && (
          <Stack direction="row" spacing={1}>
            {images.map((img, idx) => (
              <Box
                key={idx}
                component="img"
                src={img}
                onClick={() => setSelectedImage(idx)}
                sx={{
                  width: 70, height: 70, objectFit: 'cover', borderRadius: 1.5,
                  cursor: 'pointer', border: '2px solid',
                  borderColor: selectedImage === idx ? 'primary.main' : 'transparent',
                  opacity: selectedImage === idx ? 1 : 0.6,
                  transition: 'all 0.15s',
                }}
              />
            ))}
          </Stack>
        )}
      </Grid>

      {/* Información del producto */}
      <Grid item xs={12} md={6}>
        <Chip label={product.categoria} color="primary" variant="outlined" size="small" sx={{ mb: 1.5 }} />
        <Typography variant="h4" fontWeight={800} gutterBottom>
          {product.nombre}
        </Typography>

        {product.atributos?.material && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Marca: <strong>{product.atributos?.material}</strong>
          </Typography>
        )}

        <Typography variant="h3" color="primary.main" fontWeight={900} sx={{ my: 2 }}>
          {formatCurrency(product.precio)}
        </Typography>

        <Chip
          label={((product.stock ?? 0) ?? 0) > 0 ? `${(product.stock ?? 0)} disponibles` : 'Agotado'}
          color={((product.stock ?? 0) ?? 0) > 0 ? 'success' : 'error'}
          size="small"
          sx={{ mb: 3, fontWeight: 600 }}
        />

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
          {product.descripcion}
        </Typography>

        {/* Atributos dinámicos (esquema BSON) */}
        {dynamicAttrs.length > 0 && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Especificaciones
            </Typography>
            <Grid container spacing={1} sx={{ mb: 3 }}>
              {dynamicAttrs.map((attr) => (
                <Grid item xs={6} key={attr.label}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {attr.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {attr.value}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* Etiquetas */}
        {product.etiquetas && product.etiquetas.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5} sx={{ mb: 3 }}>
            {product.etiquetas.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Selector de cantidad + acciones */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Stack direction="row" alignItems="center" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <IconButton onClick={() => setCantidad((c) => Math.max(1, c - 1))} disabled={cantidad <= 1}>
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ px: 2, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{cantidad}</Typography>
            <IconButton onClick={() => setCantidad((c) => Math.min((product.stock ?? 0), c + 1))} disabled={cantidad >= (product.stock ?? 0)}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Button
            variant="contained"
            size="large"
            startIcon={<ShoppingCartIcon />}
            onClick={handleAddToCart}
            disabled={((product.stock ?? 0) ?? 0) === 0}
            sx={{ flex: 1, py: 1.5 }}
          >
            Agregar al carrito
          </Button>

          <IconButton sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <FavoriteBorderIcon />
          </IconButton>
        </Stack>
      </Grid>
    </Grid>
  )
}
