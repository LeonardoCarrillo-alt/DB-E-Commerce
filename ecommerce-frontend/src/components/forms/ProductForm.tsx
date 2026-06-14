import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import {
  TextField, Button, Box, Grid, FormControl, InputLabel,
  Select, MenuItem, FormHelperText, Typography, Chip, Divider,
} from '@mui/material'
import { productSchema, type ProductFormValues } from '../../schemas'
import { CATEGORIES } from '../../utils/constants'
import type { Product } from '../../api/productApi'

interface Props {
  initialData?: Product | null
  onSubmit: (values: ProductFormValues, extraAttrs: Record<string, unknown>) => void
  loading?: boolean
}

/**
 * Campos dinámicos por categoría — refleja el esquema BSON flexible de MongoDB.
 * Electrónica → voltaje, ram | Ropa → tallas, material | etc.
 */
const DYNAMIC_FIELDS: Record<string, { key: string; label: string; type: 'text' | 'tags' }[]> = {
  'Electrónica': [
    { key: 'voltaje', label: 'Voltaje (ej. 220V)', type: 'text' },
    { key: 'ram', label: 'RAM (ej. 16GB)', type: 'text' },
  ],
  'Ropa': [
    { key: 'tallas', label: 'Tallas (separadas por coma: S,M,L)', type: 'tags' },
    { key: 'material', label: 'Material', type: 'text' },
  ],
  'Muebles': [
    { key: 'dimensiones', label: 'Dimensiones (ej. 120x60x75 cm)', type: 'text' },
    { key: 'material', label: 'Material', type: 'text' },
  ],
  'Adornos': [
    { key: 'material', label: 'Material', type: 'text' },
    { key: 'estilo', label: 'Estilo', type: 'text' },
  ],
  'Utensilios de cocina': [
    { key: 'material', label: 'Material', type: 'text' },
    { key: 'capacidad', label: 'Capacidad (ej. 1.5L)', type: 'text' },
  ],
}

export default function ProductForm({ initialData, onSubmit, loading = false }: Props) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          nombre: initialData.nombre,
          descripcion: initialData.descripcion,
          precio: initialData.precio,
          stock: initialData.stock,
          categoria: initialData.categoria,
          
          etiquetas: initialData.etiquetas?.join(', ') ?? '',
        }
      : { precio: 0, stock: 0, etiquetas: '' },
  })

  const categoria = watch('categoria')
  const dynamicFields = DYNAMIC_FIELDS[categoria] ?? []

  // Estado para atributos dinámicos según categoría
  const [extraAttrs, setExtraAttrs] = useState<Record<string, string>>({})

  // Pre-cargar atributos dinámicos si estamos editando
  useEffect(() => {
    if (initialData) {
      const attrs: Record<string, string> = {}
      Object.entries(DYNAMIC_FIELDS).forEach(([, fields]) => {
        fields.forEach((f) => {
          const val = (initialData.atributos as Record<string, unknown>)[f.key]
          if (val !== undefined) {
            attrs[f.key] = Array.isArray(val) ? val.join(', ') : String(val)
          }
        })
      })
      setExtraAttrs(attrs)
    }
  }, [initialData])

  const handleDynamicChange = (key: string, value: string) => {
    setExtraAttrs((prev) => ({ ...prev, [key]: value }))
  }

  const onFormSubmit = (values: ProductFormValues) => {
    // Transforma los campos dinámicos al formato final (arreglos para 'tags')
    const transformed: Record<string, unknown> = {}
    dynamicFields.forEach((field) => {
      const raw = extraAttrs[field.key]
      if (!raw) return
      transformed[field.key] = field.type === 'tags'
        ? raw.split(',').map((v) => v.trim()).filter(Boolean)
        : raw
    })
    onSubmit(values, transformed)
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)}>
      <Grid container spacing={2.5}>
        {/* Datos básicos */}
        <Grid item xs={12} sm={8}>
          <TextField fullWidth label="Nombre del producto" {...register('nombre')} error={!!errors.nombre} helperText={errors.nombre?.message} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Controller
            name="categoria"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.categoria}>
                <InputLabel>Categoría</InputLabel>
                <Select {...field} label="Categoría">
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
                {errors.categoria && <FormHelperText>{errors.categoria.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Descripción"
            {...register('descripcion')}
            error={!!errors.descripcion}
            helperText={errors.descripcion?.message}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Precio (Bs)"
            type="number"
            inputProps={{ step: '0.01', min: 0 }}
            {...register('precio')}
            error={!!errors.precio}
            helperText={errors.precio?.message}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Stock"
            type="number"
            inputProps={{ min: 0 }}
            {...register('stock')}
            error={!!errors.stock}
            helperText={errors.stock?.message}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Marca" {...register('marca')} error={!!errors.marca} helperText={errors.marca?.message} />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Etiquetas (separadas por coma)"
            placeholder="oferta, nuevo, destacado"
            {...register('etiquetas')}
            error={!!errors.etiquetas}
            helperText={errors.etiquetas?.message || 'Se almacenan como arreglo en MongoDB'}
          />
        </Grid>

        {/* Atributos dinámicos según categoría */}
        {dynamicFields.length > 0 && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Atributos específicos de {categoria}
              </Typography>
              <Chip label="Esquema dinámico BSON" size="small" color="info" variant="outlined" sx={{ mb: 2 }} />
            </Grid>
            {dynamicFields.map((field) => (
              <Grid item xs={12} sm={6} key={field.key}>
                <TextField
                  fullWidth
                  label={field.label}
                  value={extraAttrs[field.key] ?? ''}
                  onChange={(e) => handleDynamicChange(field.key, e.target.value)}
                />
              </Grid>
            ))}
          </>
        )}
      </Grid>

      <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 4, py: 1.5, px: 5 }}>
        {loading ? 'Guardando...' : initialData ? 'Actualizar producto' : 'Crear producto'}
      </Button>
    </Box>
  )
}
