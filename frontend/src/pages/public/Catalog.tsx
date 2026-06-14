import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Container, Grid, Typography, Box, Drawer, IconButton,
  useMediaQuery, useTheme, Button,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import CloseIcon from '@mui/icons-material/Close'
import ProductList from '../../components/products/ProductList'
import ProductFilters from '../../components/products/ProductFilters'
import ProductSearch from '../../components/products/ProductSearch'
import Pagination from '../../components/common/Pagination'
import { useProducts } from '../../hooks/useProducts'
import { DEFAULT_PAGE_SIZE } from '../../utils/constants'
import type { ProductFilters as Filters } from '../../api/productApi'

export default function Catalog() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [searchParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    categoria: searchParams.get('categoria') ?? undefined,
    busqueda: searchParams.get('busqueda') ?? undefined,
  })

  const { data, isLoading, isFetching } = useProducts(filters)
  console.log(data)
  console.log("DATA =", data);
  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handleReset = () => {
    setFilters({ page: 1, limit: DEFAULT_PAGE_SIZE })
  }

  const handleSearch = (busqueda: string) => {
    setFilters((prev) => ({ ...prev, busqueda: busqueda || undefined, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // const totalPages = data ? Math.max(1, Math.ceil(data.total / DEFAULT_PAGE_SIZE)) : 1
  const totalPages = Math.max(
  1,
  Math.ceil((Number(data?.total) || 0) / DEFAULT_PAGE_SIZE))
  const filtersPanel = (
    <ProductFilters filters={filters} onChange={handleFilterChange} onReset={handleReset} />
  )

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Catálogo de productos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {data ? `${data.total} productos encontrados` : 'Cargando productos...'}
      </Typography>

      {/* Búsqueda + botón de filtros mobile */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <ProductSearch value={filters.busqueda ?? ''} onChange={handleSearch} />
        {isMobile && (
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setMobileFiltersOpen(true)}
            sx={{ flexShrink: 0 }}
          >
            Filtros
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Filtros desktop */}
        {!isMobile && (
          <Grid item xs={12} md={3}>
            <Box sx={{ position: 'sticky', top: 90, bgcolor: 'background.paper', p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              {filtersPanel}
            </Box>
          </Grid>
        )}

        {/* Productos */}
        <Grid item xs={12} md={9}>
          <ProductList products={data?.products ?? []} loading={isLoading || isFetching} />
          <Pagination page={filters.page ?? 1} count={totalPages} onChange={handlePageChange} />
        </Grid>
      </Grid>

      {/* Filtros mobile (drawer) */}
      <Drawer anchor="left" open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}>
        <Box sx={{ width: 300, p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <IconButton onClick={() => setMobileFiltersOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          {filtersPanel}
        </Box>
      </Drawer>
    </Container>
  )
}
