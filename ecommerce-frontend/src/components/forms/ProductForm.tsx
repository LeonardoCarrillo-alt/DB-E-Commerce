import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect, type ChangeEvent } from 'react'
import {
  TextField, Button, Box, Grid, FormControl, InputLabel,
  Select, MenuItem, FormHelperText, Typography, Chip, Divider,
  Stack,
} from '@mui/material'
import { productSchema, type ProductFormValues } from '../../schemas'
import { CATEGORIES } from '../../utils/constants'
import { getProductImageSrc, DEFAULT_PRODUCT_IMAGE, type Product } from '../../api/productApi'

interface Props {
  initialData?: Product | null
  onSubmit: (values: ProductFormValues, extraAttrs: Record<string, unknown>, imageFile: File | null) => void
  loading?: boolean
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

/**
 * Campos dinámicos por categoría — refleja el esquema BSON flexible de MongoDB.
 * Electrónica → voltaje, ram | Ropa → tallas, material | etc.
 */
const DYNAMIC_FIELDS: Record<string, { key: string; label: string; type: 'text' | 'tags' }[]> = {
  electronica: [
    { key: 'voltaje', label: 'Voltaje (ej. 220V)', type: 'text' },
    { key: 'ram', label: 'RAM (ej. 16GB)', type: 'text' },
  ],
  ropa: [
    { key: 'tallas', label: 'Tallas (separadas por coma: S,M,L)', type: 'tags' },
    { key: 'material', label: 'Material', type: 'text' },
  ],
  muebles: [
    { key: 'dimensiones', label: 'Dimensiones (ej. 120x60x75 cm)', type: 'text' },
    { key: 'material', label: 'Material', type: 'text' },
  ],
  adornos: [
    { key: 'material', label: 'Material', type: 'text' },
    { key: 'estilo', label: 'Estilo', type: 'text' },
  ],
  utensilios_cocina: [
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
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nombre: initialData?.nombre ?? '',
      descripcion: initialData?.descripcion ?? '',
      precio: initialData?.precio ?? 0,
      stock: initialData?.stock ?? initialData?.stock_disponible ?? 0,
      categoria: initialData?.categoria ?? '',
      marca:
        initialData?.atributos?.marca
          ? String(initialData.atributos.marca)
          : (initialData as any)?.marca ?? '',
      etiquetas: initialData?.etiquetas?.join(', ') ?? '',
    },
  })

  const categoria = watch('categoria')
  const dynamicFields = DYNAMIC_FIELDS[categoria] ?? []

  // Estado para atributos dinámicos según categoría
  const [extraAttrs, setExtraAttrs] = useState<Record<string, string>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null)
  const initialImagePreview = getProductImageSrc(initialData, DEFAULT_PRODUCT_IMAGE)

  // Pre-cargar atributos dinámicos si estamos editando
  useEffect(() => {
    reset({
      nombre: initialData?.nombre ?? '',
      descripcion: initialData?.descripcion ?? '',
      precio: initialData?.precio ?? 0,
      stock: initialData?.stock ?? initialData?.stock_disponible ?? 0,
      categoria: initialData?.categoria ?? '',
      marca: initialData?.atributos?.marca ? String(initialData.atributos.marca) : '',
      etiquetas: initialData?.etiquetas?.join(', ') ?? '',
    })

    if (initialData) {
      const attrs: Record<string, string> = {}
      
      // 🛠️ CAPA DE PROTECCIÓN: Si es nulo o no existe, usamos un objeto vacío
      const atributosDb = (initialData.atributos as Record<string, unknown>) || {}

      Object.entries(DYNAMIC_FIELDS).forEach(([, fields]) => {
        fields.forEach((f) => {
          const val = atributosDb[f.key] // 🌟 Ahora lee de forma segura sin colapsar
          if (val !== undefined && val !== null) {
            attrs[f.key] = Array.isArray(val) ? val.join(', ') : String(val)
          }
        })
      })
      setExtraAttrs(attrs)
    } else {
      setExtraAttrs({})
    }
    setImageFile(null)
    setImageError(null)
    setSelectedImagePreview(null)
  }, [initialData, reset])

  useEffect(() => {
    if (!imageFile) {
      setSelectedImagePreview(null)
      return
    }

    const objectUrl = URL.createObjectURL(imageFile)
    setSelectedImagePreview(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [imageFile])

  const handleDynamicChange = (key: string, value: string) => {
    setExtraAttrs((prev) => ({ ...prev, [key]: value }))
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null

    if (!file) {
      setImageError(null)
      setImageFile(null)
      event.target.value = ''
      return
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setImageError('Solo se permiten imágenes JPG o PNG')
      setImageFile(null)
      event.target.value = ''
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('La imagen no puede superar 5MB')
      setImageFile(null)
      event.target.value = ''
      return
    }

    setImageError(null)
    setImageFile(file)
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
    onSubmit(values, transformed, imageFile)
  }

  const previewSrc = selectedImagePreview ?? initialImagePreview

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
          <TextField 
            fullWidth 
            label="Marca" 
            {...register('marca')} 
            error={!!errors.marca} 
            helperText={errors.marca?.message} 
          />
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

        <Grid item xs={12}>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Imagen del producto
              </Typography>
              <Button component="label" variant="outlined" size="small">
                Seleccionar JPG o PNG
                <input hidden type="file" accept="image/jpeg,image/png" onChange={handleImageChange} />
              </Button>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
                Tamaño máximo: 5MB. Si no seleccionas una nueva imagen, se conserva la actual.
              </Typography>
              {imageError && (
                <FormHelperText error sx={{ mt: 0.5 }}>
                  {imageError}
                </FormHelperText>
              )}
            </Box>

            <Box
              component="img"
              src={previewSrc}
              alt="Vista previa del producto"
              sx={{
                width: '100%',
                maxWidth: 360,
                height: 220,
                objectFit: 'cover',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
              }}
            />
          </Stack>
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