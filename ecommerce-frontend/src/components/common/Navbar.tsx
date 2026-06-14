import {
  AppBar, Toolbar, Typography, Button, IconButton, Badge,
  Box, Avatar, Menu, MenuItem, Container, Divider,
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import StorefrontIcon from '@mui/icons-material/Storefront'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, useCartItemCount } from '../../store/hooks/useAuth'
import { useAppDispatch } from '../../store/hooks/useAuth'
import { logout } from '../../store/slices/authSlice'
import { openCart } from '../../store/slices/cartSlice'
import { getInitials } from '../../utils/helpers'

export default function Navbar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const cartCount = useCartItemCount()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleLogout = () => {
    dispatch(logout())
    setAnchorEl(null)
    navigate('/')
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'linear-gradient(90deg, #1a1a2e 0%, #26418f 60%, #5c6bc0 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ gap: 2 }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
            <StorefrontIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
              MultiStore
            </Typography>
          </Link>

          {/* Nav links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, ml: 3 }}>
            <Button color="inherit" component={Link} to="/" sx={{ fontWeight: 500 }}>
              Inicio
            </Button>
            <Button color="inherit" component={Link} to="/catalog" sx={{ fontWeight: 500 }}>
              Catálogo
            </Button>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Carrito */}
          <IconButton color="inherit" onClick={() => dispatch(openCart())} aria-label="carrito">
            <Badge badgeContent={cartCount} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {/* Auth */}
          {isAuthenticated && user ? (
            <>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
                <Avatar sx={{ bgcolor: 'secondary.main', width: 34, height: 34, fontSize: 14, fontWeight: 700 }}>
                  {getInitials(user.nombre)}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled sx={{ opacity: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem component={Link} to="/profile" onClick={() => setAnchorEl(null)}>
                  Mi perfil
                </MenuItem>
                <MenuItem component={Link} to="/orders" onClick={() => setAnchorEl(null)}>
                  Mis pedidos
                </MenuItem>
                {(user.rol === 'SUPER_ADMIN' || user.rol === 'ADMIN_TIENDA') && (
                  <MenuItem component={Link} to="/admin/dashboard" onClick={() => setAnchorEl(null)}>
                    Panel admin
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  Cerrar sesión
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" component={Link} to="/login" variant="outlined" size="small"
                sx={{ borderColor: 'rgba(255,255,255,0.4)', '&:hover': { borderColor: 'white' } }}>
                Ingresar
              </Button>
              <Button component={Link} to="/register" variant="contained" color="secondary" size="small">
                Registrarse
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  )
}
