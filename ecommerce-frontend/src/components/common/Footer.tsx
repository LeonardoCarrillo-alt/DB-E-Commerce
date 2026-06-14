import { Box, Container, Typography, Grid, Link as MuiLink, Divider } from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
        color: 'rgba(255,255,255,0.75)',
        pt: 6,
        pb: 3,
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Brand */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <StorefrontIcon sx={{ color: '#8e99f3' }} />
              <Typography variant="h6" fontWeight={800} color="white">MultiStore</Typography>
            </Box>
            <Typography variant="body2" sx={{ maxWidth: 280, lineHeight: 1.7 }}>
              Plataforma de e-commerce multitienda con tecnología de persistencia políglota.
            </Typography>
          </Grid>

          {/* Links */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" fontWeight={700} color="white" gutterBottom>Tienda</Typography>
            {[['Catálogo', '/catalog'], ['Novedades', '/catalog']].map(([label, to]) => (
              <MuiLink key={label} component={Link} to={to} display="block" mb={0.5}
                sx={{ color: 'inherit', fontSize: 14, '&:hover': { color: '#8e99f3' } }}>
                {label}
              </MuiLink>
            ))}
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" fontWeight={700} color="white" gutterBottom>Cuenta</Typography>
            {[['Mi perfil', '/profile'], ['Mis pedidos', '/orders'], ['Lista de deseos', '/wishlist']].map(([label, to]) => (
              <MuiLink key={label} component={Link} to={to} display="block" mb={0.5}
                sx={{ color: 'inherit', fontSize: 14, '&:hover': { color: '#8e99f3' } }}>
                {label}
              </MuiLink>
            ))}
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 3 }} />

        <Typography variant="caption" sx={{ opacity: 0.45 }}>
          © {new Date().getFullYear()} MultiStore — Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  )
}
