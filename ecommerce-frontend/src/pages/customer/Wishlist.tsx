import { useState, useEffect } from 'react'
import { Container, Typography, Box, Button, Grid, IconButton } from '@mui/material'
import { Link } from 'react-router-dom'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import ProductCard from '../../components/products/ProductCard'
import { useProducts } from '../../hooks/useProducts'
import { ProductGridSkeleton } from '../../components/common/Loading'

const WISHLIST_KEY = 'wishlist_ids'

export function getWishlist(): string[] {
  return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]')
}

export function toggleWishlist(productId: string) {
  const current = getWishlist()
  const updated = current.includes(productId)
    ? current.filter((id) => id !== productId)
    : [...current, productId]
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated))
  return updated
}

export default function Wishlist() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([])

  useEffect(() => {
    setWishlistIds(getWishlist())
  }, [])

  // Trae todos los productos y filtra por los que están en la wishlist
  // (en un escenario real, se haría una llamada con los IDs específicos)
  const { data: products, isLoading } = useProducts()

  const wishlistProducts = products?.filter((p) => wishlistIds.includes(p._id)) ?? []

  const handleRemove = (productId: string) => {
    const updated = toggleWishlist(productId)
    setWishlistIds(updated)
  }

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <ProductGridSkeleton count={4} />
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Mi lista de deseos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {wishlistProducts.length} producto(s) guardado(s)
      </Typography>

      {wishlistProducts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <FavoriteBorderIcon sx={{ fontSize: 70, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Tu lista de deseos está vacía
          </Typography>
          <Button component={Link} to="/catalog" variant="contained" sx={{ mt: 2 }} startIcon={<ShoppingCartIcon />}>
            Explorar productos
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {wishlistProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Box sx={{ position: 'relative' }}>
                <ProductCard product={product} />
                <IconButton
                  size="small"
                  onClick={() => handleRemove(product._id)}
                  sx={{
                    position: 'absolute', top: 8, right: 8,
                    bgcolor: 'rgba(255,255,255,0.95)', '&:hover': { bgcolor: 'white' },
                    color: 'secondary.main',
                  }}
                >
                  <FavoriteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}
