import { Box, Container, Typography, Button, Grid, Chip, Stack } from '@mui/material'
import { Link } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { CATEGORIES } from '../../utils/constants'

export default function Home() {
  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #26418f 50%, #5c6bc0 100%)',
          color: 'white',
          py: { xs: 8, md: 14 },
          px: 2,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -2,
            left: 0,
            right: 0,
            height: 60,
            background: '#f8f9fa',
            clipPath: 'ellipse(55% 100% at 50% 100%)',
          },
        }}
      >
        <Container maxWidth="md">
          <Chip label="Persistencia Políglota" color="secondary" size="small" sx={{ mb: 2, fontWeight: 700 }} />
          <Typography variant="h2" fontWeight={900} sx={{ mb: 2, fontSize: { xs: '2.2rem', md: '3.5rem' }, lineHeight: 1.1 }}>
            Todo lo que necesitas,
            <Box component="span" sx={{ color: '#ff9e80' }}> en un solo lugar</Box>
          </Typography>
          <Typography variant="h6" sx={{ mb: 5, opacity: 0.8, fontWeight: 400, maxWidth: 560, mx: 'auto' }}>
            Ropa, electrónica, muebles y más — con la potencia de PostgreSQL y MongoDB trabajando juntos.
          </Typography>
          <Button
            component={Link}
            to="/catalog"
            variant="contained"
            color="secondary"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ py: 1.5, px: 4, fontSize: 16 }}
          >
            Explorar catálogo
          </Button>
        </Container>
      </Box>

      {/* Categorías */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Explora por categoría
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Desde electrónica de última generación hasta muebles para el hogar.
        </Typography>

        <Grid container spacing={2}>
          {CATEGORIES.map((cat, idx) => {
            const emojis = ['👕', '💻', '🛋️', '🎨', '🍳']
            const colors = ['#5c6bc0', '#ff6f61', '#66bb6a', '#ffa726', '#29b6f6']
            return (
              <Grid item xs={6} sm={4} md={2} key={cat}>
                <Box
                  component={Link}
                  to={`/catalog?categoria=${encodeURIComponent(cat)}`}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 3,
                    borderRadius: 3,
                    textDecoration: 'none',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: colors[idx],
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${colors[idx]}30`,
                    },
                  }}
                >
                  <Typography fontSize={36}>{emojis[idx]}</Typography>
                  <Typography variant="body2" fontWeight={700} color="text.primary" textAlign="center">
                    {cat}
                  </Typography>
                </Box>
              </Grid>
            )
          })}
        </Grid>
      </Container>

      {/* CTA */}
      <Box sx={{ bgcolor: 'primary.main', py: 8, textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Typography variant="h4" fontWeight={800} color="white" gutterBottom>
            ¿Nuevo en MultiStore?
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
            Créate una cuenta y empieza a comprar en minutos.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button component={Link} to="/register" variant="contained" color="secondary" size="large">
              Registrarse gratis
            </Button>
            <Button component={Link} to="/catalog" variant="outlined" size="large"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white' } }}>
              Ver catálogo
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
