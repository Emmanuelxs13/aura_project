import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const { totalItems, setIsOpen } = useCart()
  const location = useLocation()

  const isActive = (path) => location.pathname === path ? 'text-accent font-semibold' : 'text-gray-700 hover:text-accent'

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/celulares', label: 'Celulares' },
    { to: '/laptops', label: 'Laptops' },
    { to: '/accesorios', label: 'Accesorios' },
    { to: '/nosotros', label: 'Nosotros' },
  ]

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">
              <span className="text-accent">Aura</span>
              <span className="text-secondary">Store</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className={`${isActive(link.to)} transition-colors duration-200 text-sm font-medium`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={() => setIsOpen(true)} className="relative p-2 text-gray-700 hover:text-accent transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>

            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                {isAdmin && (
                  <Link to="/admin" className="text-sm font-medium text-accent hover:text-accent-dark transition-colors">
                    Admin
                  </Link>
                )}
                <span className="text-sm text-gray-600">{user.name}</span>
                <button onClick={logout} className="btn-secondary text-sm py-2 px-4">
                  Salir
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-4 hidden md:block">
                Ingresar
              </Link>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className={`block py-2 ${isActive(link.to)}`}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block py-2 text-accent">Admin</Link>}
                <button onClick={() => { logout(); setMenuOpen(false) }} className="block py-2 text-danger">Cerrar sesion</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-accent font-medium">Ingresar</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
