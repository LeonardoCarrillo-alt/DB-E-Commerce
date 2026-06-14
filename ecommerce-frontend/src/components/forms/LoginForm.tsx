import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TextField, Button, Box, Typography, Alert, CircularProgress, Link as MuiLink } from '@mui/material'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks/useAuth'
import { useAuth } from '../../store/hooks/useAuth'
import { login, clearError } from '../../store/slices/authSlice'
import { loginSchema, type LoginFormValues } from '../../schemas'
import { useEffect } from 'react'

export default function LoginForm() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error, isAuthenticated, user } = useAuth()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate((user.rol === 'SUPER_ADMIN' || user.rol === 'ADMIN_TIENDA') ? '/admin/dashboard' : from, { replace: true })
    }
  }, [isAuthenticated, user, navigate, from])

  useEffect(() => {
    return () => { dispatch(clearError()) }
  }, [dispatch])

  const onSubmit = (data: LoginFormValues) => {
    dispatch(login(data))
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Bienvenido de vuelta
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Ingresa tus credenciales para continuar
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label="Correo electrónico"
          type="email"
          fullWidth
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          label="Contraseña"
          type="password"
          fullWidth
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
          sx={{ py: 1.5 }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Iniciar sesión'}
        </Button>
      </Box>

      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
        ¿No tienes cuenta?{' '}
        <MuiLink component={Link} to="/register" fontWeight={600}>
          Regístrate
        </MuiLink>
      </Typography>
    </Box>
  )
}
