import { useState, useCallback } from 'react'
import { InputAdornment, TextField, IconButton } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function ProductSearch({ value, onChange, placeholder = 'Buscar productos...' }: Props) {
  const [local, setLocal] = useState(value)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      onChange(local.trim())
    },
    [local, onChange]
  )

  const handleClear = () => {
    setLocal('')
    onChange('')
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <TextField
        fullWidth
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: local ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
        sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
      />
    </form>
  )
}
