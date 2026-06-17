import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, Typography, Alert, MenuItem,
} from '@mui/material'
import { useFacturaByPedido, useCreateFactura, useUpdateFactura, useGenerarFactura } from '../../hooks/useFacturas'
import type { Order } from '../../api/orderApi'

const REGIMENES_FISCALES = [
  { code: '601', label: 'General de Ley Personas Morales' },
  { code: '605', label: 'Sueldos y Salarios e Ingresos Asimilados a Salarios' },
  { code: '606', label: 'Arrendamiento' },
  { code: '608', label: 'Demás ingresos' },
  { code: '612', label: 'Personas Físicas con Actividades Empresariales y Profesionales' },
  { code: '614', label: 'Ingresos por intereses' },
  { code: '616', label: 'Sin obligaciones fiscales' },
  { code: '621', label: 'Incorporación Fiscal' },
  { code: '626', label: 'Régimen Simplificado de Confianza' },
]

interface Props {
  open: boolean
  onClose: () => void
  order: Order | null
}

export default function FacturaDialog({ open, onClose, order }: Props) {
  const pedidoId = order?.id
  const { data: factura, isLoading: loadingFactura } = useFacturaByPedido(pedidoId)
  const createFactura = useCreateFactura()
  const updateFactura = useUpdateFactura()
  const generarFactura = useGenerarFactura()

  const [rfc, setRfc] = useState('')
  const [razonSocial, setRazonSocial] = useState('')
  const [codigoPostal, setCodigoPostal] = useState('')
  const [regimenFiscal, setRegimenFiscal] = useState('601')
  const [xmlUrl, setXmlUrl] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (factura) {
      setRfc(factura.rfc)
      setRazonSocial('')
      setCodigoPostal('')
      setRegimenFiscal('601')
      setXmlUrl(factura.xml_url ?? '')
      setPdfUrl(factura.pdf_url ?? '')
    } else {
      setRfc('')
      setRazonSocial('')
      setCodigoPostal('')
      setRegimenFiscal('601')
      setXmlUrl('')
      setPdfUrl('')
    }
  }, [factura])

  const handleSave = async () => {
    if (!pedidoId) return
    setError(null)

    if (!rfc.trim()) {
      setError('El RFC es obligatorio')
      return
    }

    try {
      if (factura) {
        await updateFactura.mutateAsync({
          id: factura.id,
          data: {
            rfc: rfc.trim(),
            xml_url: xmlUrl.trim() || undefined,
            pdf_url: pdfUrl.trim() || undefined,
          },
        })
      } else {
        await createFactura.mutateAsync({
          pedido_id: pedidoId,
          rfc: rfc.trim(),
          xml_url: xmlUrl.trim() || undefined,
          pdf_url: pdfUrl.trim() || undefined,
        })
      }
      onClose()
    } catch {
      setError('Error al guardar la factura')
    }
  }

  const handleGenerar = async () => {
    if (!pedidoId) return
    setError(null)

    if (!rfc.trim()) {
      setError('El RFC es obligatorio')
      return
    }
    if (!razonSocial.trim()) {
      setError('La razón social es obligatoria')
      return
    }
    if (!codigoPostal.trim()) {
      setError('El código postal es obligatorio')
      return
    }

    try {
      await generarFactura.mutateAsync({
        pedido_id: pedidoId,
        rfc: rfc.trim(),
        razon_social: razonSocial.trim(),
        codigo_postal: codigoPostal.trim(),
        regimen_fiscal: regimenFiscal,
      })
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al generar la factura'
      setError(msg)
    }
  }

  const isSaving = createFactura.isPending || updateFactura.isPending || generarFactura.isPending

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {factura ? 'Editar factura' : 'Nueva factura'} — Pedido #{order?.id?.slice(0, 8) ?? ''}
      </DialogTitle>
      <DialogContent>
        {loadingFactura ? (
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
                label="RFC"
                value={rfc}
                onChange={(e) => setRfc(e.target.value)}
                placeholder="XAXX010101000"
                inputProps={{ maxLength: 20 }}
              />
            </Grid>

            {!factura && (
              <>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Razón social"
                    value={razonSocial}
                    onChange={(e) => setRazonSocial(e.target.value)}
                    placeholder="Juan Pérez"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="C.P."
                    value={codigoPostal}
                    onChange={(e) => setCodigoPostal(e.target.value)}
                    placeholder="12345"
                    inputProps={{ maxLength: 10 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Régimen fiscal"
                    value={regimenFiscal}
                    onChange={(e) => setRegimenFiscal(e.target.value)}
                  >
                    {REGIMENES_FISCALES.map((r) => (
                      <MenuItem key={r.code} value={r.code}>
                        {r.code} — {r.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL del XML"
                value={xmlUrl}
                onChange={(e) => setXmlUrl(e.target.value)}
                placeholder="https://storage.example.com/factura.xml"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL del PDF"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="https://storage.example.com/factura.pdf"
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        {!factura && (
          <Button
            variant="contained"
            color="success"
            onClick={handleGenerar}
            disabled={isSaving}
          >
            {generarFactura.isPending ? 'Generando...' : 'Generar con Facturapi'}
          </Button>
        )}
        <Button variant="outlined" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Guardando...' : factura ? 'Actualizar' : 'Guardar manual'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
