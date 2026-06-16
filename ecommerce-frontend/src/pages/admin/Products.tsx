import { useState, useMemo } from 'react'
import {
  Box, Typography, Button, Grid, Card, CardContent, IconButton,
  Dialog, DialogTitle, DialogContent, Chip, TextField, InputAdornment,
  Avatar, Stack, Pagination as MuiPagination, Snackbar, Alert,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../hooks/useProducts'
import ProductForm from '../../components/forms/ProductForm'
import { formatCurrency } from '../../utils/formatCurrency'
import { ProductGridSkeleton } from '../../components/common/Loading'
import { useAuth } from '../../store/hooks/useAuth'
import type { Product } from '../../api/productApi'
import type { ProductFormValues } from '../../schemas'

const PAGE_SIZE = 12

export default function AdminProducts() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const { data: products, isLoading } = useProducts()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (product: Product) => {
    console.log('🔍 Editando producto:', product._id || product.id, product)
    setEditingProduct(product)
    setDialogOpen(true)
  }


const handleSubmit = async (values: ProductFormValues, extraAttrs: Record<string, unknown>) => {
  try {
    const listaEtiquetas = typeof values.etiquetas === 'string'
      ? (values.etiquetas as string).split(',').map(t => t.trim()).filter(Boolean)
      : values.etiquetas;

    const productoId = editingProduct ? (editingProduct._id || editingProduct.id) : undefined;
    const currentTiendaId = user?.tiendaId || editingProduct?.tiendaId || '';

    if (!currentTiendaId) {
      throw new Error('❌ No se pudo determinar el ID de la tienda.');
    }

    const { stock, ...restValues } = values;
    const cantidadStock = stock ? Number(stock) : 0;

    // 🌟 CONSTRUCCIÓN DEL PAYLOAD CON LOS NOMBRES EXACTOS PARA JAVA DTO
    
    const payload = {
      id: productoId,                  // Coincide con 'public String id;'
      nombre: values.nombre,
      descripcion: values.descripcion,
      precio: Number(values.precio),
      categoria: values.categoria,

      // 1. Enviamos en camelCase para que tu DTO lo reciba sin perderse
      tiendaId: currentTiendaId,       // Coincide con 'public String tiendaId;'

      // 2. Enviamos true/false en lugar de null
      disponible: cantidadStock > 0,   // Coincide con 'public Boolean disponible;'

      // 3. CAMELCASE OBLIGATORIO (Sin guion bajo)
      stock_disponible: cantidadStock,  // Coincide con 'public Integer stockDisponible;'

      atributos: extraAttrs || {}, 
      etiquetas: listaEtiquetas
    };

    if (editingProduct) {
      console.log('📝 Enviando actualización de producto:', productoId, payload);
      
      await updateProduct.mutateAsync({
        id: productoId!,
        data: payload as any,
      });

      setSnackbar({ open: true, message: 'Producto actualizado correctamente', severity: 'success' });
    } else {
      console.log('✨ Creando nuevo producto:', payload);

      await createProduct.mutateAsync(payload as any);

      setSnackbar({ open: true, message: 'Producto creado correctamente', severity: 'success' });
    }
    setDialogOpen(false);
  } catch (error) {
    console.error('❌ Error en handleSubmit:', error);
    setSnackbar({
      open: true,
      message: error instanceof Error ? error.message : 'Ocurrió un error. Intenta nuevamente.',
      severity: 'error',
    });
  }
};
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    try {
      await deleteProduct.mutateAsync(id)
      setSnackbar({ open: true, message: 'Producto eliminado', severity: 'success' })
    } catch {
      setSnackbar({ open: true, message: 'No se pudo eliminar el producto', severity: 'error' })
    }
  }

  const filtered = useMemo(() => {
    if (!products) return []
    return products.filter((p) => !search || p.nombre.toLowerCase().includes(search.toLowerCase()))
  }, [products, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Productos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {products ? `${products.length} productos en el catálogo` : 'Cargando...'}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Nuevo producto
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Buscar productos..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        sx={{ mb: 3, maxWidth: 400, bgcolor: 'background.paper' }}
      />

      {isLoading ? (
        <ProductGridSkeleton />
      ) : (
        <Grid container spacing={2}>
          {paginated.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id || product.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                    <Avatar
                      src={product.imagenes?.[0]}
                      variant="rounded"
                      sx={{ width: 56, height: 56, bgcolor: 'grey.100' }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {product.nombre}
                      </Typography>
                      <Chip label={product.categoria} size="small" sx={{ mt: 0.5 }} />
                    </Box>
                  </Box>

                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                      {formatCurrency(product.precio)}
                    </Typography>
                    <Chip
                      label={`Stock: ${product.stock ?? 0}`}
                      size="small"
                      color={(product.stock ?? 0) > 0 ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenEdit(product)}
                    >
                      Editar
                    </Button>
                    <IconButton size="small" color="error" onClick={() => handleDelete(product._id || product.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <MuiPagination
            page={page}
            count={totalPages}
            color="primary"
            onChange={(_, v) => setPage(v)}
          />
        </Box>
      )}

      {/* Dialog Crear/Editar */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={700}>
          {editingProduct ? 'Editar producto' : 'Nuevo producto'}
        </DialogTitle>
        <DialogContent>
          <ProductForm
            initialData={editingProduct}
            onSubmit={handleSubmit}
            loading={createProduct.isPending || updateProduct.isPending}
          />
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}