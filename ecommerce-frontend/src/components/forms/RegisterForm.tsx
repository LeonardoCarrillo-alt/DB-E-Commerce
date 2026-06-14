import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TextField, Button, Box, Typography, Alert, CircularProgress, Link as MuiLink } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppDispatch } from '../../store/hooks/useAuth'
import { useAuth } from '../../store/hooks/useAuth'
import { register as registerUser, clearError } from '../../store/slices/authSlice'
import { registerSchema, type RegisterFormValues } from '../../schemas'

export default function RegisterForm() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  useEffect(() => {
    return () => { dispatch(clearError()) }
  }, [dispatch])

  const onSubmit = ({ confirmPassword: _, ...data }: RegisterFormValues) => {
    dispatch(registerUser(data))
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Crear cuenta
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Únete a MultiStore hoy
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Nombre completo" fullWidth {...register('nombre')} error={!!errors.nombre} helperText={errors.nombre?.message} />
        <TextField label="Correo electrónico" type="email" fullWidth {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
        <TextField label="Teléfono (opcional)" fullWidth {...register('telefono')} error={!!errors.telefono} helperText={errors.telefono?.message} />
        <TextField label="Contraseña" type="password" fullWidth {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
        <TextField label="Confirmar contraseña" type="password" fullWidth {...register('confirmPassword')} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />

        <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ py: 1.5, mt: 1 }}>
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Crear cuenta'}
        </Button>
      </Box>

      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
        ¿Ya tienes cuenta?{' '}
        <MuiLink component={Link} to="/login" fontWeight={600}>Iniciar sesión</MuiLink>
      </Typography>
    </Box>
  )
}
