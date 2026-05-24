import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import AdminSidebar from './components/AdminSidebar'

import Home from './pages/Home'
import Celulares from './pages/Celulares'
import Laptops from './pages/Laptops'
import Accesorios from './pages/Accesorios'
import Nosotros from './pages/Nosotros'
import Login from './pages/Login'
import Register from './pages/Register'
import ProductDetail from './pages/ProductDetail'

import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminUsers from './pages/admin/Users'

import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        <Route path="/admin" element={<AdminRoute><AdminSidebar /><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminSidebar /><AdminProducts /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminSidebar /><AdminOrders /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminSidebar /><AdminUsers /></AdminRoute>} />
        <Route path="*" element={
          <>
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/celulares" element={<Celulares />} />
                <Route path="/laptops" element={<Laptops />} />
                <Route path="/accesorios" element={<Accesorios />} />
                <Route path="/nosotros" element={<Nosotros />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
              </Routes>
            </main>
            <Footer />
            <CartDrawer />
          </>
        } />
      </Routes>
    </div>
  )
}
