import {
  Box, Typography, FormControl, InputLabel, Select, MenuItem,
  Slider, Button, Chip, Stack, Divider,
} from '@mui/material'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import { CATEGORIES, CATEGORY_LABELS } from '../../utils/constants'
import { formatCurrency } from '../../utils/formatCurrency'
import type { ProductSearchBody } from '../../api/productApi'

interface FilterState {
  categoria?: string
  precioMin?: number
  precioMax?: number
  marca?: string
}

interface Props {
  filters: FilterState
  onChange: (filters: Partial<ProductSearchBody>) => void
  onReset: () => void
}

const BRANDS = ['Samsung', 'Apple', 'LG', 'Adidas', 'Nike', 'IKEA', 'Genérico']

export default function ProductFilters({ filters, onChange, onReset }: Props) {
  const priceRange: [number, number] = [filters.precioMin ?? 0, filters.precioMax ?? 5000]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1" fontWeight={700}>Filtros</Typography>
        <Button size="small" startIcon={<FilterAltOffIcon />} onClick={onReset} color="secondary">
          Limpiar
        </Button>
      </Box>

      <Divider />

      {/* Categoría */}
      <FormControl fullWidth size="small">
        <InputLabel>Categoría</InputLabel>
        <Select
          value={filters.categoria ?? ''}
          label="Categoría"
          onChange={(e) => onChange({ categoria: e.target.value || undefined })}
        >
          <MenuItem value="">Todas</MenuItem>
          {CATEGORIES.map((cat) => (
            <MenuItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Marca — se envía dentro de atributos al backend */}
      <FormControl fullWidth size="small">
        <InputLabel>Marca</InputLabel>
        <Select
          value={filters.marca ?? ''}
          label="Marca"
          onChange={(e) => onChange({ atributos: e.target.value ? { marca: e.target.value } : undefined })}
        >
          <MenuItem value="">Todas</MenuItem>
          {BRANDS.map((brand) => (
            <MenuItem key={brand} value={brand}>{brand}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Rango de precio */}
      <Box>
        <Typography variant="body2" fontWeight={600} gutterBottom>Precio</Typography>
        <Slider
          value={priceRange}
          min={0}
          max={5000}
          step={50}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => formatCurrency(v)}
          onChange={(_, value) => {
            const [min, max] = value as [number, number]
            onChange({ precioMin: min, precioMax: max })
          }}
          color="primary"
        />
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">{formatCurrency(priceRange[0])}</Typography>
          <Typography variant="caption" color="text.secondary">{formatCurrency(priceRange[1])}</Typography>
        </Stack>
      </Box>

      {/* Filtros activos */}
      {filters.categoria && (
        <>
          <Divider />
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Filtros activos:
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.5}>
              <Chip
                label={CATEGORY_LABELS[filters.categoria] ?? filters.categoria}
                size="small"
                onDelete={() => onChange({ categoria: undefined })}
                color="primary"
                variant="outlined"
              />
            </Stack>
          </Box>
        </>
      )}
    </Box>
  )
}
