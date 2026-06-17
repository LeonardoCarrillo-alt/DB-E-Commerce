import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, FormControl, InputLabel,
  Select, MenuItem, Typography, Alert,
} from '@mui/material'
import { useEnvioByPedido, useCreateEnvio, useUpdateEnvio } from '../../hooks/useEnvio'
import type { Order } from '../../api/orderApi'

const PROVEEDORES = [
  'DHL',
  'UPS',
  'FedEx',
  'Correo Argentino',
  'Andreani',
  'OCA',
  'Personalizado',
]

const ESTADOS_ENVIO = [
  'PREPARANDO',
  'EN_TRANSITO',
  'EN_REPARTO',
  'ENTREGADO',
  'DEVUELTO',
]

interface Props {
  open: boolean
  onClose: () => void
  order: Order | null
}

export default function EnvioDialog({ open, onClose, order }: Props) {
  const pedidoId = order?.id
  const { data: envio, isLoading: loadingEnvio } = useEnvioByPedido(pedidoId)
  const createEnvio = useCreateEnvio()
  const updateEnvio = useUpdateEnvio()

  const [trackingNumber, setTrackingNumber] = useState('')
  const [proveedor, setProveedor] = useState('')
  const [estado, setEstado] = useState('PREPARANDO')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (envio) {
      setTrackingNumber(envio.tracking_number)
      setProveedor(envio.proveedor)
      setEstado(envio.estado)
    } else {
      setTrackingNumber('')
      setProveedor('')
      setEstado('PREPARANDO')
    }
  }, [envio])

  const handleSave = async () => {
    if (!pedidoId) return
    setError(null)

    if (!trackingNumber.trim()) {
      setError('El número de tracking es obligatorio')
      return
    }
    if (!proveedor.trim()) {
      setError('El proveedor es obligatorio')
      return
    }

    try {
      if (envio) {
        await updateEnvio.mutateAsync({
          id: envio.id,
          data: {
            tracking_number: trackingNumber.trim(),
            proveedor: proveedor.trim(),
            estado,
          },
        })
      } else {
        await createEnvio.mutateAsync({
          pedido_id: pedidoId,
          tracking_number: trackingNumber.trim(),
          proveedor: proveedor.trim(),
          estado,
        })
      }
      onClose()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr?.response?.data?.message || 'Error al guardar el envío')
    }
  }

  const isSaving = createEnvio.isPending || updateEnvio.isPending

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Gestión de envío — Pedido #{order?.id?.slice(0, 8) ?? ''}
      </DialogTitle>
      <DialogContent>
        {loadingEnvio ? (
          <Typography color="text.secondary">Cargando...</Typography>
        ) : (
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Número de tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="TRK-2026-00001"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Proveedor</InputLabel>
                <Select
                  value={proveedor}
                  label="Proveedor"
                  onChange={(e) => setProveedor(e.target.value)}
                >
                  {PROVEEDORES.map((p) => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado del envío</InputLabel>
                <Select
                  value={estado}
                  label="Estado del envío"
                  onChange={(e) => setEstado(e.target.value)}
                >
                  {ESTADOS_ENVIO.map((e) => (
                    <MenuItem key={e} value={e}>{e}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {order?.direccion_envio && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Dirección de envío: {order.direccion_envio}
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
