import { Box, Paper, Typography } from '@mui/material'
import { Outlet, Link } from 'react-router-dom'
import StorefrontIcon from '@mui/icons-material/Storefront'

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #26418f 0%, #5c6bc0 50%, #8e99f3 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <StorefrontIcon sx={{ color: 'primary.main', fontSize: 36 }} />
              <Typography variant="h5" fontWeight={800} color="primary.dark">
                MultiStore
              </Typography>
            </Box>
          </Link>
        </Box>

        <Outlet />
      </Paper>
    </Box>
  )
}
