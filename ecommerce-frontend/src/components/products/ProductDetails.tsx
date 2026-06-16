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
import { cartService } from '../../services/cartService'
import { formatCurrency } from '../../utils/formatCurrency'
import type { Product } from '../../api/productApi'

interface Props {
  product: Product
}

// Mapeo de atributos dinámicos (esquema BSON flexible)
const DYNAMIC_ATTR_LABELS: Record<string, string> = {
  voltaje: 'Voltaje',
  ram: 'Memoria RAM',
  tallas: 'Tallas disponibles',
  material: 'Material',
  dimensiones: 'Dimensiones',
  estilo: 'Estilo',
  capacidad: 'Capacidad',
  color: 'Color',
  peso: 'Peso',
}

export default function ProductDetails({ product }: Props) {
  const dispatch = useAppDispatch()
  const [selectedImage, setSelectedImage] = useState(0)
  const [cantidad, setCantidad] = useState(1)

  const images = product.imagenes?.length
    ? product.imagenes
    : ['https://via.placeholder.com/600x500?text=Sin+imagen']

  const agotado = (product.stock ?? 0) === 0

  /**
   * Agregar al carrito.
   * 
   * Mapeo de IDs:
   * - MongoDB retorna "_id"
   * - Redux usa "productoId" (normalizado)
   * - Backend espera "productoId" en DTO
   */
  const handleAddToCart = async () => {
    // 🔴 CRÍTICO: Extraer el ID real del documento MongoDB
    const mongoId = product._id || product.id

    if (!mongoId) {
      console.error('❌ ProductDetails: producto sin ID válido:', product)
      return
    }

    console.log('=== ProductDetails: handleAddToCart ===')
    console.log('MongoDB _id:', mongoId)
    console.log('Cantidad:', cantidad)

    // 1️⃣ Despachar a Redux con estructura normalizada
    dispatch(
      addItem({
        productoId: mongoId, // ← Redux usa "productoId"
        nombre: product.nombre,
        precio: product.precio,
        cantidad: cantidad,
        imagen: images[0],
      })
    )

    // 2️⃣ Abrir carrito (animar el panel)
    dispatch(openCart())

    // 3️⃣ Sincronizar con backend
    try {
      const response = await cartService.addItem(mongoId, cantidad)
      console.log('✅ Backend sincronizado. Items:', response.items?.length)
    } catch (err) {
      console.error('❌ Error al sincronizar con backend:', err)
      // Redux ya fue actualizado, así que el carrito local refleja el cambio
    }
  }

  // Extrae atributos dinámicos del documento BSON
  const dynamicAttrs = Object.entries(DYNAMIC_ATTR_LABELS)
    .filter(([key]) => (product.atributos as Record<string, unknown>)?.[key] !== undefined)
    .map(([key, label]) => {
      const value = (product.atributos as Record<string, unknown>)?.[key]
      return {
        label,
        value: Array.isArray(value)
          ? (value as string[]).join(', ')
          : String(value),
      }
    })

  return (
    <Grid container spacing={4}>
      {/* ════════════════════════════════════════════════════════════ */}
      {/* GALERÍA DE IMÁGENES (Izquierda) */}
      {/* ════════════════════════════════════════════════════════════ */}
      <Grid item xs={12} md={6}>
        {/* Imagen principal */}
        <Card sx={{ mb: 1.5, backgroundColor: '#f5f5f5' }}>
          <CardMedia
            component="img"
            image={images[selectedImage]}
            alt={product.nombre}
            sx={{
              height: { xs: 300, md: 460 },
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
            }}
          />
        </Card>

        {/* Miniaturas */}
        {images.length > 1 && (
          <Stack direction="row" spacing={1}>
            {images.map((img, idx) => (
              <Box
                key={idx}
                component="img"
                src={img}
                onClick={() => setSelectedImage(idx)}
                alt={`Imagen ${idx + 1}`}
                sx={{
                  width: 70,
                  height: 70,
                  objectFit: 'cover',
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: selectedImage === idx ? 'primary.main' : 'transparent',
                  opacity: selectedImage === idx ? 1 : 0.6,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    opacity: 0.9,
                  },
                }}
              />
            ))}
          </Stack>
        )}
      </Grid>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* INFORMACIÓN DEL PRODUCTO (Derecha) */}
      {/* ════════════════════════════════════════════════════════════ */}
      <Grid item xs={12} md={6}>
        {/* Categoría */}
        <Chip
          label={product.categoria || 'Sin categoría'}
          color="primary"
          variant="outlined"
          size="small"
          sx={{ mb: 1.5 }}
        />

        {/* Nombre */}
        <Typography variant="h4" fontWeight={800} gutterBottom>
          {product.nombre}
        </Typography>

        {/* Marca/Material */}
        {(product.atributos?.material || product.atributos?.marca) && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Marca:{' '}
            <strong>
              {product.atributos?.material || product.atributos?.marca}
            </strong>
          </Typography>
        )}

        {/* Precio */}
        <Typography
          variant="h3"
          color="primary.main"
          fontWeight={900}
          sx={{ my: 2 }}
        >
          {formatCurrency(product.precio)}
        </Typography>

        {/* Stock */}
        <Chip
          label={
            agotado
              ? 'Agotado'
              : `${product.stock ?? 0} disponible(s)`
          }
          color={agotado ? 'error' : 'success'}
          size="small"
          sx={{ mb: 3, fontWeight: 700 }}
        />

        {/* Descripción */}
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: 3,
            lineHeight: 1.8,
          }}
        >
          {product.descripcion}
        </Typography>

        {/* ──── Especificaciones dinámicas (BSON) ──── */}
        {dynamicAttrs.length > 0 && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Especificaciones
            </Typography>
            <Grid container spacing={1} sx={{ mb: 3 }}>
              {dynamicAttrs.map((attr) => (
                <Grid item xs={6} key={attr.label}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mb: 0.25 }}
                  >
                    {attr.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {attr.value}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* ──── Etiquetas ──── */}
        {product.etiquetas && product.etiquetas.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            gap={0.5}
            sx={{ mb: 3 }}
          >
            {product.etiquetas.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                color="secondary"
              />
            ))}
          </Stack>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* ──── Selector de cantidad + Botones de acción ──── */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap' }}>
          {/* Controles de cantidad */}
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              backgroundColor: '#fafafa',
            }}
          >
            <IconButton
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              disabled={cantidad <= 1}
              size="small"
            >
              <RemoveIcon fontSize="small" />
            </IconButton>

            <Typography
              sx={{
                px: 2,
                fontWeight: 700,
                minWidth: 40,
                textAlign: 'center',
                fontSize: '1.1rem',
              }}
            >
              {cantidad}
            </Typography>

            <IconButton
              onClick={() =>
                setCantidad((c) => Math.min(product.stock ?? 0, c + 1))
              }
              disabled={cantidad >= (product.stock ?? 0) || agotado}
              size="small"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Stack>

          {/* Botón Agregar al Carrito */}
          <Button
            variant="contained"
            size="large"
            startIcon={<ShoppingCartIcon />}
            onClick={handleAddToCart}
            disabled={agotado}
            sx={{
              flex: 1,
              minWidth: 150,
              py: 1.5,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            {agotado ? 'Agotado' : 'Agregar al carrito'}
          </Button>

          {/* Botón Favorito */}
          <IconButton
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              backgroundColor: '#fafafa',
              '&:hover': {
                backgroundColor: '#f0f0f0',
                color: 'error.main',
              },
              transition: 'all 0.2s',
            }}
            onClick={() => {
              // TODO: Implementar wishlist
            }}
          >
            <FavoriteBorderIcon />
          </IconButton>
        </Stack>
      </Grid>
    </Grid>
  )
}
