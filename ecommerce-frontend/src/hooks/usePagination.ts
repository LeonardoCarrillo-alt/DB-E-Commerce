import { useState, useMemo } from 'react'

interface UsePaginationProps {
  totalItems: number
  itemsPerPage?: number
  initialPage?: number
}

export function usePagination({ totalItems, itemsPerPage = 12, initialPage = 1 }: UsePaginationProps) {
  const [page, setPage] = useState(initialPage)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / itemsPerPage)), [totalItems, itemsPerPage])

  const goToPage = (newPage: number) => {
    setPage(Math.min(Math.max(1, newPage), totalPages))
  }

  return {
    page,
    totalPages,
    setPage: goToPage,
    offset: (page - 1) * itemsPerPage,
    limit: itemsPerPage,
  }
}

export default usePagination
