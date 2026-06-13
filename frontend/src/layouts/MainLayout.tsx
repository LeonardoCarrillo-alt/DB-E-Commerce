import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import CartDrawer from '../components/cart/CartDrawer'

export default function MainLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1, pt: 2, pb: 6 }}>
        <Outlet />
      </Box>
      <Footer />
      <CartDrawer />
    </Box>
  )
}
