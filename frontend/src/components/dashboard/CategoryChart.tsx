import { Card, CardContent, Typography, Box } from '@mui/material'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

interface CategoryData {
  name: string
  value: number
}

interface Props {
  data?: CategoryData[]
}

const DEFAULT_DATA: CategoryData[] = [
  { name: 'Electrónica', value: 35 },
  { name: 'Ropa', value: 28 },
  { name: 'Muebles', value: 17 },
  { name: 'Adornos', value: 12 },
  { name: 'Cocina', value: 8 },
]

const COLORS = ['#5c6bc0', '#ff6f61', '#66bb6a', '#ffa726', '#29b6f6']

export default function CategoryChart({ data = DEFAULT_DATA }: Props) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Ventas por categoría
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Participación']} />
              <Legend iconType="circle" iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}
