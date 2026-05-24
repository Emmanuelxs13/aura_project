import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { user, logout, isAdmin } = useAuth()
  const { totalItems, setIsOpen } = useCart()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) =>
    location.pathname === path ? 'text-accent font-semibold' : 'text-gray-600 hover:text-gray-900'

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
      setSearchOpen(false)
    }
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-secondary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-accent">Aura</span>
              <span className="text-gray-900">Store</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`text-sm font-medium transition-colors ${isActive('/')}`}>Inicio</Link>
            <Link to="/celulares" className={`text-sm font-medium transition-colors ${isActive('/celulares')}`}>Celulares</Link>
            <Link to="/laptops" className={`text-sm font-medium transition-colors ${isActive('/laptops')}`}>Laptops</Link>
            <Link to="/accesorios" className={`text-sm font-medium transition-colors ${isActive('/accesorios')}`}>Accesorios</Link>
            <Link to="/nosotros" className={`text-sm font-medium transition-colors ${isActive('/nosotros')}`}>Nosotros</Link>
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-gray-500 hover:text-accent transition-colors rounded-lg hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <button onClick={() => setIsOpen(true)} className="relative p-2 text-gray-500 hover:text-accent transition-colors rounded-lg hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                {isAdmin && (
                  <Link to="/admin" className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-lg hover:bg-accent/20 transition-colors">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2 pl-3 border-l border-gray-200">
                  <div className="w-7 h-7 bg-gradient-to-br from-accent to-secondary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.name}</span>
                  <button onClick={logout} className="text-xs text-gray-400 hover:text-danger transition-colors ml-1">Salir</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hidden md:inline-flex btn-primary text-sm py-2 px-5">
                Ingresar
              </Link>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-500 hover:text-accent rounded-lg hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <form onSubmit={handleSearch} className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar productos... (ej: iPhone, MacBook, AirPods)"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-accent/30 focus:bg-white transition-all text-sm"
                autoFocus
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary text-xs py-1.5 px-4">
                Buscar
              </button>
            </form>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-4 space-y-1">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Inicio</Link>
            <Link to="/celulares" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Celulares</Link>
            <Link to="/laptops" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Laptops</Link>
            <Link to="/accesorios" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Accesorios</Link>
            <Link to="/nosotros" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Nosotros</Link>

            <div className="border-t border-gray-100 pt-3 mt-3">
              {user ? (
                <div className="space-y-1 px-4">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                  {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block text-sm text-accent font-medium">Panel Admin</Link>}
                  <button onClick={() => { logout(); setMenuOpen(false) }} className="text-sm text-danger font-medium">Cerrar sesion</button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block mx-4 btn-primary text-center text-sm py-2.5">Ingresar</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
