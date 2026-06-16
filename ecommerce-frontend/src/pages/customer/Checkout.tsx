import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import {
  Container, Typography, Grid, Card, CardContent,
  Box, Alert, Stepper, Step, StepLabel,
} from '@mui/material'
import CheckoutForm from '../../components/forms/CheckoutForm'
import CartSummary from '../../components/cart/CartSummary'
import { useCart, useAuth } from '../../store/hooks/useAuth'
import { useAppDispatch } from '../../store/hooks/useAuth'
import { clearCart } from '../../store/slices/cartSlice'
import { useCreateOrder } from '../../hooks/useOrders'
import { cartService } from '../../services/cartService'
import { orderService } from '../../services/orderService'
import type { CheckoutFormValues } from '../../schemas'

export default function Checkout() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items } = useCart()
  const { user } = useAuth()
  const createOrder = useCreateOrder()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [activeStep, setActiveStep] = useState(1)

  if (items.length === 0 && !success) {
    return <Navigate to="/cart" replace />
  }

  const handleSubmit = async (data: CheckoutFormValues) => {
    setError(null)
    try {
      // Paso 1: Procesar checkout → reserva stock (POST /carrito/checkout/procesar)
      setActiveStep(2)
      const { reservaId, carritoId } = await cartService.procesarCheckout()

      // Paso 2: Crear orden con el reservaId y carritoId retornados
      if (!user?.id) throw new Error('Usuario no autenticado')
      await orderService.create(reservaId, carritoId, data, user.id)

      // Paso 3: Limpiar carrito local y redirigir
      setSuccess(true)
      dispatch(clearCart())
      setTimeout(() => navigate('/orders'), 2000)
    } catch (err: unknown) {
      setActiveStep(1)
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(
        axiosErr.response?.data?.message ??
        'Ocurrió un error al procesar tu pedido. Intenta nuevamente.'
      )
    }
  }

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Alert severity="success" sx={{ fontSize: 16 }}>
          ¡Pedido realizado con éxito! Redirigiendo a tus pedidos...
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>Checkout</Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4, display: { xs: 'none', sm: 'flex' } }}>
        <Step completed><StepLabel>Carrito</StepLabel></Step>
        <Step active={activeStep === 1}><StepLabel>Envío y pago</StepLabel></Step>
        <Step active={activeStep === 2}><StepLabel>Confirmación</StepLabel></Step>
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <CheckoutForm onSubmit={handleSubmit} loading={createOrder.isPending} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 90 }}>
            <CardContent>
              <CartSummary />
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">
                  {items.length} producto(s) en tu carrito
                </Typography>
                {items.map((item) => (
                  <Box key={item.productId} sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                      {item.nombre} × {item.cantidad}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
