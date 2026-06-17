import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Select, MenuItem, Typography, Tooltip, IconButton,
} from '@mui/material'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import DescriptionIcon from '@mui/icons-material/Description'
import { ORDER_STATUS, ORDER_STATUS_COLOR } from '../../utils/constants'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDateShort } from '../../utils/formatDate'
import type { Order } from '../../api/orderApi'
import type { OrderStatus } from '../../utils/constants'

interface Props {
  orders: Order[]
  onStatusChange?: (id: string, estado: OrderStatus) => void
  onRowClick?: (order: Order) => void
  onFacturaClick?: (order: Order) => void
}

export default function OrderTable({ orders, onStatusChange, onRowClick, onFacturaClick }: Props) {
  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: 'grey.50' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary', width: 40 }} />
            <TableCell sx={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary', width: 40 }} />
            {['#', 'Fecha', 'Cliente ID', 'Total', 'Estado'].map((h) => (
              <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary' }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">No hay pedidos</Typography>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
              const fechaOrden = order.fecha_creacion || new Date().toISOString()
              const totalMonto = parseFloat((order.total || 0).toString())
              const totalFormato = isNaN(totalMonto) ? 'Bs 0,00' : formatCurrency(totalMonto)
              const hasEnvio = order.direccion_envio || false

              return (
                <TableRow
                  key={order.id}
                  hover
                  onClick={() => onRowClick?.(order)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  <TableCell sx={{ p: 1 }}>
                    <Tooltip title="Factura">
                      <IconButton
                        size="small"
                        color="default"
                        onClick={(e) => { e.stopPropagation(); onFacturaClick?.(order) }}
                      >
                        <DescriptionIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ p: 1 }}>
                    <Tooltip title={hasEnvio ? 'Ver envío' : 'Gestionar envío'}>
                      <IconButton size="small" color={hasEnvio ? 'primary' : 'default'}>
                        <LocalShippingIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>#{order.id?.slice(0, 8)}</TableCell>
                  <TableCell>
                    {formatDateShort(fechaOrden)}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                    {order.usuarioId || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {totalFormato}
                  </TableCell>
                  <TableCell>
                    {onStatusChange ? (
                      <Select
                        value={order.estado || 'PENDIENTE'}
                        size="small"
                        onChange={(e) => {
                          e.stopPropagation()
                          onStatusChange(order.id, e.target.value as OrderStatus)
                        }}
                        sx={{ minWidth: 130 }}
                      >
                        {Object.values(ORDER_STATUS).map((s) => (
                          <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <Chip
                        label={order.estado || 'PENDIENTE'}
                        color={ORDER_STATUS_COLOR[order.estado] ?? 'default'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}