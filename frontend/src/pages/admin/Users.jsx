import { useState, useEffect } from 'react'
import { admin as adminApi } from '../../services/api'

const ROLES = ['Customer', 'Admin', 'Operador', 'Auditor', 'Administrator']
const STATUSES = ['Active', 'Suspended']

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUsers = () => {
    setLoading(true)
    adminApi.listUsers()
      .then(({ data }) => setUsers(data.users))
      .catch(() => setError('Error al cargar usuarios'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const handleRoleChange = async (id, role) => {
    try {
      await adminApi.updateUserRole(id, role)
      fetchUsers()
    } catch {
      setError('Error al actualizar rol')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await adminApi.updateUserStatus(id, status)
      fetchUsers()
    } catch {
      setError('Error al actualizar estado')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-gray-500 mt-1">Gestion de usuarios y roles</p>
      </div>

      {error && (
        <div className="bg-red-50 text-danger text-sm p-4 rounded-lg mb-6">
          {error}
          <button onClick={() => setError('')} className="float-right font-bold">&times;</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Cargando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No hay usuarios</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-white font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user.id, e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-accent focus:outline-none"
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleStatusChange(user.id, user.status === 'Active' ? 'Suspended' : 'Active')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          user.status === 'Active'
                            ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700'
                            : 'bg-red-100 text-red-700 hover:bg-green-100 hover:text-green-700'
                        }`}
                      >
                        {user.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(user.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
