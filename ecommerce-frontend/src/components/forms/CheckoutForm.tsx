import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  TextField, Button, Box, Typography, Grid, FormControl,
  InputLabel, Select, MenuItem, FormHelperText, Divider, ListSubheader,
} from '@mui/material'
import { checkoutSchema, type CheckoutFormValues } from '../../schemas'
import { PAYMENT_METHODS } from '../../utils/constants'
import type { MetodoPago } from '../../api/paymentApi'
import type { Direccion } from '../../api/direccionApi'

interface Props {
  onSubmit: (data: CheckoutFormValues) => void
  loading?: boolean
  savedPaymentMethods?: MetodoPago[]
  savedDirecciones?: Direccion[]
}

export default function CheckoutForm({ onSubmit, loading = false, savedPaymentMethods, savedDirecciones }: Props) {
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<string | null>(null)
  const [selectedDirId, setSelectedDirId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { metodoPago: 'EFECTIVO' },
  })

  const metodoPago = watch('metodoPago')
  const isSavedCardSelected = selectedSavedCardId !== null

  const handleSelectDireccion = (dirId: string) => {
    setSelectedDirId(dirId)
    const dir = savedDirecciones?.find((d) => d.id === dirId)
    if (dir) {
      setValue('calle', dir.calle)
      setValue('ciudad', dir.ciudad)
      setValue('codigoPostal', dir.codigo_postal || '')
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h6" fontWeight={700} gutterBottom>Datos de contacto</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <TextField fullWidth label="Nombre" {...register('nombre')} error={!!errors.nombre} helperText={errors.nombre?.message} />
        </Grid>
        <Grid item xs={6}>
          <TextField fullWidth label="Apellido" {...register('apellido')} error={!!errors.apellido} helperText={errors.apellido?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Email" type="email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Teléfono" {...register('telefono')} error={!!errors.telefono} helperText={errors.telefono?.message} />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />
      <Typography variant="h6" fontWeight={700} gutterBottom>Dirección de envío</Typography>

      {savedDirecciones && savedDirecciones.length > 0 && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Dirección guardada</InputLabel>
          <Select
            value={selectedDirId ?? ''}
            label="Dirección guardada"
            onChange={(e) => {
              const val = e.target.value
              if (val) handleSelectDireccion(val)
            }}
          >
            {savedDirecciones.map((dir) => (
              <MenuItem key={dir.id} value={dir.id}>
                {dir.calle}, {dir.ciudad}, {dir.pais}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <TextField fullWidth label="Calle y número" {...register('calle')} error={!!errors.calle} helperText={errors.calle?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Ciudad" {...register('ciudad')} error={!!errors.ciudad} helperText={errors.ciudad?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Departamento" {...register('departamento')} error={!!errors.departamento} helperText={errors.departamento?.message} />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />
      <Typography variant="h6" fontWeight={700} gutterBottom>Método de pago</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            name="metodoPago"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.metodoPago}>
                <InputLabel>Método de pago</InputLabel>
                <Select
                  {...field}
                  label="Método de pago"
                  onChange={(e) => {
                    const val = e.target.value
                    if (val.startsWith('SAVED:')) {
                      setSelectedSavedCardId(val.replace('SAVED:', ''))
                      field.onChange('TARJETA')
                    } else {
                      setSelectedSavedCardId(null)
                      field.onChange(val)
                    }
                  }}
                  renderValue={(value) => {
                    if (value === 'TARJETA' && selectedSavedCardId) {
                      const card = savedPaymentMethods?.find((pm) => pm.id === selectedSavedCardId)
                      if (card) return `${card.tipo} **** ${card.ultimos_digitos}`
                    }
                    const method = PAYMENT_METHODS.find((m) => m.value === value)
                    return method?.label ?? value
                  }}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                  ))}
                  {savedPaymentMethods && savedPaymentMethods.length > 0 && [
                    <Divider key="divider" sx={{ my: 1 }} />,
                    <ListSubheader key="subheader" sx={{ lineHeight: '32px', fontWeight: 700 }}>Tus tarjetas guardadas</ListSubheader>,
                    ...savedPaymentMethods.map((pm) => (
                      <MenuItem key={pm.id} value={`SAVED:${pm.id}`}>
                        {pm.tipo} **** {pm.ultimos_digitos}
                      </MenuItem>
                    )),
                  ]}
                </Select>
                {errors.metodoPago && <FormHelperText>{errors.metodoPago.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        {metodoPago === 'TARJETA' && !isSavedCardSelected && (
          <>
            <Grid item xs={12}>
              <TextField fullWidth label="Número de tarjeta" {...register('numeroTarjeta')} placeholder="**** **** **** ****" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Nombre en la tarjeta" {...register('nombreTarjeta')} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth label="Expiración (MM/AA)" {...register('expiracion')} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth label="CVV" {...register('cvv')} type="password" />
            </Grid>
          </>
        )}
      </Grid>

      {isSavedCardSelected && savedPaymentMethods && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Usando tarjeta guardada:{' '}
          {savedPaymentMethods.find((pm) => pm.id === selectedSavedCardId)?.tipo} ****{' '}
          {savedPaymentMethods.find((pm) => pm.id === selectedSavedCardId)?.ultimos_digitos}
        </Typography>
      )}

      <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ mt: 4, py: 1.5 }}>
        {loading ? 'Procesando...' : 'Confirmar pedido'}
      </Button>
    </Box>
  )
}
