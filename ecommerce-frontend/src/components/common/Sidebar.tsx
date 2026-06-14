import {
  List, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Divider, Avatar,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import InventoryIcon from '@mui/icons-material/Inventory'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import PeopleIcon from '@mui/icons-material/People'
import BarChartIcon from '@mui/icons-material/BarChart'
import StorefrontIcon from '@mui/icons-material/Storefront'
import LogoutIcon from '@mui/icons-material/Logout'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks/useAuth'
import { useAuth } from '../../store/hooks/useAuth'
import { logout } from '../../store/slices/authSlice'
import { getInitials } from '../../utils/helpers'

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { label: 'Productos', icon: <InventoryIcon />, path: '/admin/products' },
  { label: 'Pedidos', icon: <ShoppingBagIcon />, path: '/admin/orders' },
  { label: 'Clientes', icon: <PeopleIcon />, path: '/admin/customers' },
  { label: 'Reportes', icon: <BarChartIcon />, path: '/admin/reports' },
]

interface Props {
  onClose?: () => void
}

export default function Sidebar({ onClose }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAuth()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', color: 'white' }}>
      {/* Branding */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <StorefrontIcon sx={{ fontSize: 28 }} />
        <Typography variant="h6" fontWeight={800}>
          MultiStore
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

      {/* User info */}
      {user && (
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#ff6f61', width: 38, height: 38, fontWeight: 700, fontSize: 14 }}>
            {getInitials(user.nombre)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600} noWrap>{user.nombre}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>Administrador</Typography>
          </Box>
        </Box>
      )}

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              onClick={onClose}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: active ? 'white' : 'rgba(255,255,255,0.65)',
                bgcolor: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: 14 }} />
            </ListItemButton>
          )
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Logout */}
      <List sx={{ px: 1.5, py: 1 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{ borderRadius: 2, color: 'rgba(255,111,97,0.85)', '&:hover': { bgcolor: 'rgba(255,111,97,0.15)', color: '#ff6f61' } }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Cerrar sesión" primaryTypographyProps={{ fontWeight: 500, fontSize: 14 }} />
        </ListItemButton>
      </List>
    </Box>
  )
}
