import { useState } from 'react'
import { Box, Typography, Tabs, Tab, Snackbar, Alert } from '@mui/material'
import OrderTable from '../../components/orders/OrderTable'
import EnvioDialog from '../../components/orders/EnvioDialog'
import { useAllOrders, useUpdateOrderStatus } from '../../hooks/useOrders'
import { ORDER_STATUS } from '../../utils/constants'
import Loading from '../../components/common/Loading'
import type { OrderStatus } from '../../utils/constants'
import type { Order } from '../../api/orderApi'

const TABS: { label: string; value: OrderStatus | 'TODOS' }[] = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Pendientes', value: ORDER_STATUS.PENDING },
  { label: 'Pagados', value: ORDER_STATUS.PAID },
  { label: 'Enviados', value: ORDER_STATUS.SHIPPED },
  { label: 'Entregados', value: ORDER_STATUS.DELIVERED },
]

export default function AdminOrders() {
  const [tab, setTab] = useState(0)
  const { data: orders, isLoading } = useAllOrders()
  const updateStatus = useUpdateOrderStatus()
  const [snackbar, setSnackbar] = useState(false)
  const [envioDialogOpen, setEnvioDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const handleStatusChange = async (id: string, estado: OrderStatus) => {
    await updateStatus.mutateAsync({ id, estado })
    setSnackbar(true)
  }

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order)
    setEnvioDialogOpen(true)
  }

  const filtered = orders?.filter((o) => {
    const status = TABS[tab].value
    return status === 'TODOS' ? true : o.estado === status
  }) ?? []

  if (isLoading) return <Loading />

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Gestión de pedidos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {orders?.length ?? 0} pedidos totales
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {TABS.map((t) => <Tab key={t.value} label={t.label} />)}
      </Tabs>

      <OrderTable orders={filtered} onStatusChange={handleStatusChange} onRowClick={handleRowClick} />

      <EnvioDialog
        open={envioDialogOpen}
        onClose={() => setEnvioDialogOpen(false)}
        order={selectedOrder}
      />

      <Snackbar open={snackbar} autoHideDuration={2500} onClose={() => setSnackbar(false)}>
        <Alert severity="success">Estado del pedido actualizado</Alert>
      </Snackbar>
    </Box>
  )
}
