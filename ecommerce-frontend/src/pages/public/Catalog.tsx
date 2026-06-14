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
import { useProductSearch } from '../../hooks/useProducts'
import { DEFAULT_PAGE_SIZE } from '../../utils/constants'
import type { ProductSearchBody } from '../../api/productApi'

export default function Catalog() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [searchParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)

  // Estado del cuerpo de búsqueda — usa POST /productos/buscar
  const [searchBody, setSearchBody] = useState<ProductSearchBody>({
    categoria: searchParams.get('categoria') ?? undefined,
  })

  const [busqueda, setBusqueda] = useState(searchParams.get('busqueda') ?? '')

  // Combina búsqueda de texto con filtros del panel y añade paginación requerida por el backend
  const queryBody: ProductSearchBody = {
    ...searchBody,
    pagina: page,             // Enviamos la página actual al backend
    limite: DEFAULT_PAGE_SIZE, // Enviamos el tamaño de página al backend
    ...(busqueda ? { busqueda } : {}),
  }

  const { data, isLoading, isFetching } = useProductSearch(queryBody)

  const handleFilterChange = (newFilters: Partial<ProductSearchBody>) => {
    setSearchBody((prev) => ({ ...prev, ...newFilters }))
    setPage(1)
  }

  const handleReset = () => {
    setSearchBody({})
    setBusqueda('')
    setPage(1)
  }

  const handleSearch = (q: string) => {
    setBusqueda(q)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // DETECTAR FORMATO DE RESPUESTA (Validación de contingencia)
  // 1. Extraemos la lista real de productos
  const listaProductos = Array.isArray(data) 
    ? data 
    : (data?.products ?? []); // Si tu backend usa snake_case mapeado a 'products' o un DTO personalizado

  // 2. Extraemos el total de ítems existentes
  const totalItems = Array.isArray(data) 
    ? data.length 
    : (data?.total ?? listaProductos.length);

  const totalPages = Math.max(1, Math.ceil(totalItems / DEFAULT_PAGE_SIZE)) || 1;

  const filtersPanel = (
    <ProductFilters
      filters={{ categoria: searchBody.categoria, precioMin: searchBody.precioMin, precioMax: searchBody.precioMax }}
      onChange={handleFilterChange}
      onReset={handleReset}
    ></ProductFilters>
  )

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Catálogo de productos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {data ? `${totalItems} productos encontrados` : 'Cargando productos...'}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <ProductSearch value={busqueda} onChange={handleSearch} />
        {isMobile && (
          <Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setMobileFiltersOpen(true)} sx={{ flexShrink: 0 }}>
            Filtros
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {!isMobile && (
          <Grid item xs={12} md={3}>
            <Box sx={{ position: 'sticky', top: 90, bgcolor: 'background.paper', p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              {filtersPanel}
            </Box>
          </Grid>
        )}

        <Grid item xs={12} md={9}>
          {/* CORREGIDO: Le pasamos la lista de productos procesada dinámicamente */}
          <ProductList products={listaProductos} loading={isLoading || isFetching} />
          <Pagination page={page} count={totalPages} onChange={handlePageChange} />
        </Grid>
      </Grid>

      <Drawer anchor="left" open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}>
        <Box sx={{ width: 300, p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <IconButton onClick={() => setMobileFiltersOpen(false)}><CloseIcon /></IconButton>
          </Box>
          {filtersPanel}
        </Box>
      </Drawer>
    </Container>
  )
}