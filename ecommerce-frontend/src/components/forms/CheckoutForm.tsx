import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  TextField, Button, Box, Typography, Grid, FormControl,
  InputLabel, Select, MenuItem, FormHelperText, Divider,
} from '@mui/material'
import { checkoutSchema, type CheckoutFormValues } from '../../schemas'
import { PAYMENT_METHODS } from '../../utils/constants'

interface Props {
  onSubmit: (data: CheckoutFormValues) => void
  loading?: boolean
}

export default function CheckoutForm({ onSubmit, loading = false }: Props) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { metodoPago: 'EFECTIVO' },
  })

  const metodoPago = watch('metodoPago')

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
                <Select {...field} label="Método de pago">
                  {PAYMENT_METHODS.map((m) => (
                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                  ))}
                </Select>
                {errors.metodoPago && <FormHelperText>{errors.metodoPago.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        {metodoPago === 'TARJETA' && (
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

      <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ mt: 4, py: 1.5 }}>
        {loading ? 'Procesando...' : 'Confirmar pedido'}
      </Button>
    </Box>
  )
}
