import { Grid, Typography, Box } from '@mui/material'
import ProductCard from './ProductCard'
import { ProductGridSkeleton } from '../common/Loading'
import type { Product } from '../../api/productApi'
import InventoryIcon from '@mui/icons-material/Inventory2Outlined'

interface Props {
  products: Product[]
  loading?: boolean
}

export default function ProductList({ products, loading = false }: Props) {
  if (loading) return <ProductGridSkeleton />

  if (products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <InventoryIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No se encontraron productos
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Intenta ajustar los filtros de búsqueda
        </Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  )
}
