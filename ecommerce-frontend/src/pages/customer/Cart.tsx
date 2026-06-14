import { Container, Typography, Grid, Box, Button, Card, CardContent } from '@mui/material'
import { Link } from 'react-router-dom'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useCart } from '../../store/hooks/useAuth'
import CartItem from '../../components/cart/CartItem'
import CartSummary from '../../components/cart/CartSummary'

export default function Cart() {
  const { items } = useCart()

  if (items.length === 0) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', py: { xs: 8, md: 12 } }}>
          <ShoppingCartOutlinedIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Tu carrito está vacío
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Explora nuestro catálogo y encuentra productos increíbles.
          </Typography>
          <Button component={Link} to="/catalog" variant="contained" size="large" endIcon={<ArrowForwardIcon />}>
            Ir al catálogo
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Mi carrito
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {items.reduce((s, i) => s + i.cantidad, 0)} artículo(s) en tu carrito
      </Typography>

      <Grid container spacing={3}>
        {/* Lista de items */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Resumen */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 90 }}>
            <CardContent>
              <CartSummary />
              <Button
                component={Link}
                to="/checkout"
                fullWidth
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 3, py: 1.5 }}
              >
                Proceder al pago
              </Button>
              <Button component={Link} to="/catalog" fullWidth variant="text" sx={{ mt: 1 }}>
                Seguir comprando
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
