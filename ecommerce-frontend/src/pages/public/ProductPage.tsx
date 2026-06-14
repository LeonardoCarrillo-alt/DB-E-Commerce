import { useParams, Navigate, Link } from 'react-router-dom'
import { Container, Breadcrumbs, Typography, Box } from '@mui/material'
import { useProduct } from '../../hooks/useProducts'
import ProductDetails from '../../components/products/ProductDetails'
import Loading from '../../components/common/Loading'

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading, isError } = useProduct(id)

  if (isLoading) return <Loading minHeight="70vh" />
  if (isError || !product) return <Navigate to="/404" replace />

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          <Typography variant="body2">Inicio</Typography>
        </Link>
        <Link to="/catalog" style={{ color: 'inherit', textDecoration: 'none' }}>
          <Typography variant="body2">Catálogo</Typography>
        </Link>
        <Link to={`/catalog?categoria=${encodeURIComponent(product.categoria)}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          <Typography variant="body2">{product.categoria}</Typography>
        </Link>
        <Typography variant="body2" color="text.primary" fontWeight={600}>
          {product.nombre}
        </Typography>
      </Breadcrumbs>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, p: { xs: 2, md: 4 }, border: '1px solid', borderColor: 'divider' }}>
        <ProductDetails product={product} />
      </Box>
    </Container>
  )
}
