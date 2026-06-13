import { useState } from 'react'
import {
  Container, Typography, Card, CardContent, Grid, TextField,
  Button, Avatar, Box, Divider, Alert, Tabs, Tab,
} from '@mui/material'
import { useAuth } from '../../store/hooks/useAuth'
import { getInitials, stringToColor } from '../../utils/helpers'

export default function Profile() {
  const { user } = useAuth()
  const [tab, setTab] = useState(0)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    nombre: user?.nombre ?? '',
    email: user?.email ?? '',
    telefono: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Mi perfil
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: stringToColor(user?.nombre ?? ''), fontSize: 24, fontWeight: 700 }}>
            {getInitials(user?.nombre ?? '')}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>{user?.nombre}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            <Typography variant="caption" color="primary.main" fontWeight={700}>
              {user?.rol === 'ADMIN' ? 'Administrador' : 'Cliente'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          <Tab label="Información personal" />
          <Tab label="Seguridad" />
        </Tabs>

        <CardContent>
          {saved && <Alert severity="success" sx={{ mb: 2 }}>Cambios guardados correctamente</Alert>}

          {tab === 0 && (
            <Box component="form" onSubmit={handleSaveProfile}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Nombre completo" value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Email" type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Teléfono" value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  />
                </Grid>
              </Grid>
              <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                Guardar cambios
              </Button>
            </Box>
          )}

          {tab === 1 && (
            <Box component="form" onSubmit={handleChangePassword}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Cambiar contraseña
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Contraseña actual" type="password" value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Nueva contraseña" type="password" value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Confirmar nueva contraseña" type="password" value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </Grid>
              </Grid>
              <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                Actualizar contraseña
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}
