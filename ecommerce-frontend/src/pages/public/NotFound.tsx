import { Box, Typography, Button, Container } from '@mui/material'
import { Link } from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home'
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied'

export default function NotFound() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ textAlign: 'center', py: { xs: 8, md: 14 } }}>
        <SentimentDissatisfiedIcon sx={{ fontSize: 90, color: 'primary.light', mb: 2 }} />
        <Typography variant="h1" fontWeight={900} sx={{ fontSize: { xs: '4rem', md: '6rem' }, color: 'primary.main', lineHeight: 1 }}>
          404
        </Typography>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 2 }}>
          Página no encontrada
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Lo sentimos, la página que buscas no existe o fue movida.
        </Typography>
        <Button component={Link} to="/" variant="contained" size="large" startIcon={<HomeIcon />}>
          Volver al inicio
        </Button>
      </Box>
    </Container>
  )
}
