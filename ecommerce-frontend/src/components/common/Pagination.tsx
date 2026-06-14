import { Box, Pagination as MuiPagination } from '@mui/material'

interface Props {
  page: number
  count: number
  onChange: (page: number) => void
}

export default function Pagination({ page, count, onChange }: Props) {
  if (count <= 1) return null
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <MuiPagination
        page={page}
        count={count}
        color="primary"
        shape="rounded"
        onChange={(_, value) => onChange(value)}
      />
    </Box>
  )
}
