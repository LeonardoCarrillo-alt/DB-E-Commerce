import { Container, Typography, Box, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import { useMyOrders } from '../../hooks/useOrders'
import OrderCard from '../../components/orders/OrderCard'
import Loading from '../../components/common/Loading'

export default function Orders() {
  const { data: orders, isLoading } = useMyOrders()

  if (isLoading) return <Loading />

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Mis pedidos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Historial de todas tus compras
      </Typography>

      {!orders || orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <ReceiptLongIcon sx={{ fontSize: 70, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aún no tienes pedidos
          </Typography>
          <Button component={Link} to="/catalog" variant="contained" sx={{ mt: 2 }}>
            Empezar a comprar
          </Button>
        </Box>
      ) : (
        orders.map((order) => <OrderCard key={order.id} order={order} />)
      )}
    </Container>
  )
}
