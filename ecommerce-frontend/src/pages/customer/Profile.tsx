import { useState } from 'react'
import {
  Container, Typography, Card, CardContent, Grid, TextField,
  Button, Avatar, Box, Divider, Alert, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, IconButton,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import AddCardIcon from '@mui/icons-material/AddCard'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AddLocationIcon from '@mui/icons-material/AddLocation'
import { useAuth } from '../../store/hooks/useAuth'
import { getInitials, stringToColor } from '../../utils/helpers'
import { usePaymentMethods, useCreatePaymentMethod, useDeletePaymentMethod } from '../../hooks/usePaymentMethods'
import { useDirecciones, useCreateDireccion, useUpdateDireccion, useDeleteDireccion } from '../../hooks/useDirecciones'
import type { Direccion } from '../../api/direccionApi'

const CARD_TYPES = [
  { value: 'VISA', label: 'Visa' },
  { value: 'MASTERCARD', label: 'Mastercard' },
  { value: 'AMEX', label: 'American Express' },
  { value: 'NARANJA', label: 'Naranja' },
  { value: 'CABAL', label: 'Cabal' },
]

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

  // ─── Payment Methods ────────────────────────────────────────────────────
  const userId = user?.uuid || user?.id
  const { data: paymentMethods, isLoading: loadingPaymentMethods } = usePaymentMethods(userId)
  const createPaymentMethod = useCreatePaymentMethod()
  const deletePaymentMethod = useDeletePaymentMethod()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newCard, setNewCard] = useState({ tipo: 'VISA', ultimosDigitos: '' })

  // ─── Direcciones ──────────────────────────────────────────────────────
  const { data: direcciones, isLoading: loadingDirecciones } = useDirecciones(userId)
  const createDireccion = useCreateDireccion()
  const updateDireccion = useUpdateDireccion()
  const deleteDireccion = useDeleteDireccion()
  const [dirDialogOpen, setDirDialogOpen] = useState(false)
  const [editingDir, setEditingDir] = useState<Direccion | null>(null)
  const [newDir, setNewDir] = useState({ calle: '', ciudad: '', codigo_postal: '', pais: '' })

  const resetDirForm = () => {
    setNewDir({ calle: '', ciudad: '', codigo_postal: '', pais: '' })
    setEditingDir(null)
  }

  const openAddDir = () => {
    resetDirForm()
    setDirDialogOpen(true)
  }

  const openEditDir = (dir: Direccion) => {
    setNewDir({ calle: dir.calle, ciudad: dir.ciudad, codigo_postal: dir.codigo_postal, pais: dir.pais })
    setEditingDir(dir)
    setDirDialogOpen(true)
  }

  const handleSaveDir = async () => {
    if (!userId) return
    if (editingDir) {
      await updateDireccion.mutateAsync({ id: editingDir.id, data: newDir })
    } else {
      await createDireccion.mutateAsync({ usuario_id: userId, ...newDir })
    }
    resetDirForm()
    setDirDialogOpen(false)
  }

  const handleDeleteDir = async (id: string) => {
    await deleteDireccion.mutateAsync(id)
  }

  const handleAddCard = async () => {
    if (!userId || newCard.ultimosDigitos.length !== 4) return
    await createPaymentMethod.mutateAsync({
      usuario_id: userId,
      token_tarjeta: `tok_${crypto.randomUUID().replace(/-/g, '')}`,
      tipo: newCard.tipo,
      ultimos_digitos: newCard.ultimosDigitos,
    })
    setNewCard({ tipo: 'VISA', ultimosDigitos: '' })
    setDialogOpen(false)
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
              {(user?.rol === 'SUPER_ADMIN' || user?.rol === 'ADMIN_TIENDA') ? 'Administrador' : 'Cliente'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          <Tab label="Información personal" />
          <Tab label="Seguridad" />
          <Tab label="Métodos de pago" />
          <Tab label="Direcciones" />
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

          {tab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700}>Tus tarjetas guardadas</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddCardIcon />}
                  onClick={() => setDialogOpen(true)}
                >
                  Agregar tarjeta
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {loadingPaymentMethods ? (
                <Typography color="text.secondary">Cargando...</Typography>
              ) : paymentMethods && paymentMethods.length > 0 ? (
                paymentMethods.map((pm) => (
                  <Box
                    key={pm.id}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      p: 2, mb: 1, borderRadius: 1,
                      border: '1px solid', borderColor: 'divider',
                    }}
                  >
                    <CreditCardIcon color="primary" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {pm.tipo} **** {pm.ultimos_digitos}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deletePaymentMethod.mutate(pm.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No tienes tarjetas guardadas
                </Typography>
              )}
            </Box>
          )}

          {tab === 3 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700}>Tus direcciones guardadas</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddLocationIcon />}
                  onClick={openAddDir}
                >
                  Agregar dirección
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {loadingDirecciones ? (
                <Typography color="text.secondary">Cargando...</Typography>
              ) : direcciones && direcciones.length > 0 ? (
                direcciones.map((dir) => (
                  <Box
                    key={dir.id}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      p: 2, mb: 1, borderRadius: 1,
                      border: '1px solid', borderColor: 'divider',
                    }}
                  >
                    <LocationOnIcon color="primary" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {dir.calle}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dir.ciudad}, {dir.pais}{dir.codigo_postal ? ` - CP: ${dir.codigo_postal}` : ''}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => openEditDir(dir)}>
                      <Typography variant="caption" color="primary" fontWeight={600}>Editar</Typography>
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteDir(dir.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No tienes direcciones guardadas
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ─── Dialog: Agregar tarjeta ───────────────────────────────────── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Agregar tarjeta</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo de tarjeta</InputLabel>
                <Select
                  value={newCard.tipo}
                  label="Tipo de tarjeta"
                  onChange={(e) => setNewCard({ ...newCard, tipo: e.target.value })}
                >
                  {CARD_TYPES.map((ct) => (
                    <MenuItem key={ct.value} value={ct.value}>{ct.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Últimos 4 dígitos"
                value={newCard.ultimosDigitos}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                  setNewCard({ ...newCard, ultimosDigitos: val })
                }}
                inputProps={{ maxLength: 4 }}
                helperText="Ingresa los últimos 4 dígitos de tu tarjeta"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleAddCard}
            disabled={newCard.ultimosDigitos.length !== 4 || createPaymentMethod.isPending}
          >
            {createPaymentMethod.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Dialog: Agregar/Editar dirección ─────────────────────────── */}
      <Dialog open={dirDialogOpen} onClose={() => { resetDirForm(); setDirDialogOpen(false) }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingDir ? 'Editar dirección' : 'Agregar dirección'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Calle y número"
                value={newDir.calle}
                onChange={(e) => setNewDir({ ...newDir, calle: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ciudad"
                value={newDir.ciudad}
                onChange={(e) => setNewDir({ ...newDir, ciudad: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código postal"
                value={newDir.codigo_postal}
                onChange={(e) => setNewDir({ ...newDir, codigo_postal: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="País"
                value={newDir.pais}
                onChange={(e) => setNewDir({ ...newDir, pais: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { resetDirForm(); setDirDialogOpen(false) }}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSaveDir}
            disabled={!newDir.calle || !newDir.ciudad || !newDir.pais || createDireccion.isPending || updateDireccion.isPending}
          >
            {createDireccion.isPending || updateDireccion.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
