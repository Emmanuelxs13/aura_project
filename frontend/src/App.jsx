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
import Search from './pages/Search'
import Account from './pages/Account'

import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminUsers from './pages/admin/Users'

import AdminRoute from './components/AdminRoute'

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  )
}

function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      {children}
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><AdminLayout><AdminProducts /></AdminLayout></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />

      <Route path="*" element={<PublicLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/celulares" element={<Celulares />} />
          <Route path="/laptops" element={<Laptops />} />
          <Route path="/accesorios" element={<Accesorios />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </PublicLayout>} />
    </Routes>
  )
}
