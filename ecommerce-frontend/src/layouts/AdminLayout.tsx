import { useState } from 'react'
import { Box, Drawer, AppBar, Toolbar, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar'

const DRAWER_WIDTH = 240

export default function AdminLayout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar (solo mobile) */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{ zIndex: theme.zIndex.drawer + 1, background: 'linear-gradient(90deg, #26418f, #5c6bc0)' }}
        >
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={700}>
              Panel Admin
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar — permanente en desktop, temporal en mobile */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
          >
            <Sidebar onClose={() => setMobileOpen(false)} />
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                borderRight: 'none',
                background: 'linear-gradient(180deg, #1a1a2e 0%, #26418f 100%)',
              },
            }}
            open
          >
            <Sidebar />
          </Drawer>
        )}
      </Box>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: isMobile ? 8 : 0,
          background: '#f4f6f9',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
