import { Box, CircularProgress, Skeleton, Grid, Card } from '@mui/material'

// ─── Spinner centrado ─────────────────────────────────────────────────────────
export function Loading({ minHeight = '60vh' }: { minHeight?: string | number }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight }}>
      <CircularProgress color="primary" />
    </Box>
  )
}

// ─── Skeleton de tarjeta de producto ─────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={220} animation="wave" />
      <Box sx={{ p: 2 }}>
        <Skeleton width="60%" height={20} />
        <Skeleton width="40%" height={16} sx={{ mt: 0.5 }} />
        <Skeleton width="30%" height={24} sx={{ mt: 1 }} />
      </Box>
    </Card>
  )
}

// ─── Grid de skeletons para catálogo ─────────────────────────────────────────
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
          <ProductCardSkeleton />
        </Grid>
      ))}
    </Grid>
  )
}

export default Loading
