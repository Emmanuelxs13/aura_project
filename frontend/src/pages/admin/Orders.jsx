import { useState, useEffect } from 'react'
import { admin as adminApi } from '../../services/api'

const STATUSES = ['Pending', 'Paid', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled']
const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Paid: 'bg-blue-100 text-blue-700',
  Processing: 'bg-indigo-100 text-indigo-700',
  Packed: 'bg-purple-100 text-purple-700',
  Shipped: 'bg-cyan-100 text-cyan-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [error, setError] = useState('')

  const fetchOrders = () => {
    setLoading(true)
    const params = {}
    if (filter) params.status = filter
    adminApi.listOrders(params)
      .then(({ data }) => setOrders(data.orders))
      .catch(() => setError('Error al cargar pedidos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [filter])

  const handleStatusChange = async (id, status) => {
    try {
      await adminApi.updateOrderStatus(id, status)
      fetchOrders()
    } catch {
      setError('Error al actualizar estado')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-500 mt-1">Gestiona los pedidos de tu tienda</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-danger text-sm p-4 rounded-lg mb-6">
          {error}
          <button onClick={() => setError('')} className="float-right font-bold">&times;</button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          !filter ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}>Todos</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filter === s ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>{s}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8">Cargando...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No hay pedidos</td></tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">#{order.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{order.shipping_name}</p>
                      <p className="text-xs text-gray-400">{order.shipping_email}</p>
                    </td>
                    <td className="px-6 py-4 font-medium">{formatPrice(order.total_amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-accent focus:outline-none"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
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
