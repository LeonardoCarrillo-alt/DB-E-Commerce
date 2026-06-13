import { Card, CardContent, Typography } from '@mui/material'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { formatCurrency } from '../../utils/formatCurrency'

interface DataPoint {
  fecha: string
  ventas: number
  pedidos: number
}

interface Props {
  data: DataPoint[]
}

const mockData: DataPoint[] = [
  { fecha: 'Ene', ventas: 4000, pedidos: 24 },
  { fecha: 'Feb', ventas: 3000, pedidos: 18 },
  { fecha: 'Mar', ventas: 5000, pedidos: 31 },
  { fecha: 'Abr', ventas: 4800, pedidos: 27 },
  { fecha: 'May', ventas: 7000, pedidos: 45 },
  { fecha: 'Jun', ventas: 6500, pedidos: 39 },
]

export default function SalesChart({ data = mockData }: Props) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Ventas por mes
        </Typography>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `Bs${v}`} tick={{ fontSize: 12 }} width={65} />
            <Tooltip formatter={(value, name) => [
              name === 'ventas' ? formatCurrency(Number(value)) : value,
              name === 'ventas' ? 'Ventas' : 'Pedidos'
            ]} />
            <Legend />
            <Line type="monotone" dataKey="ventas" stroke="#5c6bc0" strokeWidth={2.5} dot={false} name="ventas" />
            <Line type="monotone" dataKey="pedidos" stroke="#ff6f61" strokeWidth={2} dot={false} name="pedidos" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
