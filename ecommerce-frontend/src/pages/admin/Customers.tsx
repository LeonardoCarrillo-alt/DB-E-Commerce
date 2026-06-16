import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box, Typography, TextField, InputAdornment, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  Avatar, Stack, IconButton, Tooltip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { userApi } from '../../api/userApi'
import Loading from '../../components/common/Loading'
import { formatDateShort } from '../../utils/formatDate'
import { getInitials, stringToColor } from '../../utils/helpers'

export default function Customers() {
  const [search, setSearch] = useState('')

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getAll().then((res) => res.data),
  })

  const filtered = users
    ?.filter((u) => u.rol === 'CLIENTE')
    .filter(
      (u) =>
        u.nombre.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    ) ?? []

  if (isLoading) return <Loading />

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Clientes
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {users?.length ?? 0} usuarios registrados
      </Typography>

      <TextField
        fullWidth
        placeholder="Buscar por nombre o email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        sx={{ mb: 3, maxWidth: 400, bgcolor: 'background.paper' }}
      />

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              {['Cliente', 'Email', 'Rol', 'UUID', 'Registro', 'Estado', ''].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary' }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No se encontraron clientes</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 700, bgcolor: stringToColor(user.nombre) }}>
                        {getInitials(user.nombre)}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>{user.nombre}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                      <Chip
                        label={user.rol}
                        size="small"
                        color={user.rol === 'SUPER_ADMIN' ? 'error' : user.rol === 'ADMIN_TIENDA' ? 'primary' : user.rol === 'VENDEDOR' ? 'warning' : 'default'}
                        sx={{ fontWeight: 600 }}
                      />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {user.id.slice(0, 8)}...
                    </Typography>
                  </TableCell>
                  <TableCell>{user.fecha_creacion ? formatDateShort(user.fecha_creacion) : '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.activo ? 'Activo' : 'Inactivo'}
                      size="small"
                      color={user.activo ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={user.activo ? 'Desactivar' : 'Activar'}>
                      <IconButton size="small" color={user.activo ? 'error' : 'success'}>
                        {user.activo ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
