import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      const adminRoles = ['Administrator', 'Admin', 'Operador', 'Auditor']
      navigate(adminRoles.includes(data.user.role) ? '/admin' : '/')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bienvenido de vuelta</h1>
          <p className="text-gray-500 mt-2">Ingresa a tu cuenta de Aura Store</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="bg-red-50 text-danger text-sm p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electronico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="tu@correo.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="Tu contraseña"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Ingresando...' : 'Iniciar sesion'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>¿No tienes cuenta?{' '}
              <Link to="/register" className="text-accent font-semibold hover:text-accent-dark">
                Registrate aqui
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-3">Cuentas de prueba</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg">
                <div>
                  <span className="font-semibold text-gray-700">Admin</span>
                  <p className="text-gray-400 font-mono">admin@aura.co</p>
                </div>
                <code className="bg-white px-2 py-1 rounded border border-gray-200 text-gray-600 font-mono">admin123</code>
              </div>
              <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg">
                <div>
                  <span className="font-semibold text-gray-700">Cliente</span>
                  <p className="text-gray-400 font-mono">client@aura.co</p>
                </div>
                <code className="bg-white px-2 py-1 rounded border border-gray-200 text-gray-600 font-mono">client123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
