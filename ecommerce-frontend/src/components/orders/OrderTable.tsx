import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Select, MenuItem, Typography,
} from '@mui/material'
import { ORDER_STATUS, ORDER_STATUS_COLOR } from '../../utils/constants'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDateShort } from '../../utils/formatDate'
import type { Order } from '../../api/orderApi'
import type { OrderStatus } from '../../utils/constants'

interface Props {
  orders: Order[]
  onStatusChange?: (id: string, estado: OrderStatus) => void
}

export default function OrderTable({ orders, onStatusChange }: Props) {
  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: 'grey.50' }}>
          <TableRow>
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
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">No hay pedidos</Typography>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
              // ✅ Extraer fecha con fallback
              const fechaOrden = order.createdAt || order.fecha_creacion || new Date()
              
              // ✅ Extraer y validar total
              const totalMonto = parseFloat((order.total || 0).toString())
              const totalFormato = isNaN(totalMonto) ? 'Bs 0,00' : formatCurrency(totalMonto)

              return (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>#{order.id}</TableCell>
                  <TableCell>
                    {/* ✅ Usar fallback de fecha */}
                    {formatDateShort(fechaOrden)}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                    {order.usuarioId || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {/* ✅ Validar total */}
                    {totalFormato}
                  </TableCell>
                  <TableCell>
                    {onStatusChange ? (
                      <Select
                        value={order.estado || 'PENDIENTE'}
                        size="small"
                        onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
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