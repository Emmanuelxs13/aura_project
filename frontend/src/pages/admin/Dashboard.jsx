import { useState, useEffect } from 'react'
import { admin as adminApi } from '../../services/api'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title)

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getDashboard()
      .then(({ data: d }) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Error al cargar datos del dashboard</p>
      </div>
    )
  }

  const { metrics, topProducts, monthlySales, salesByCategory } = data

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)
  }

  const revenueChart = {
    labels: monthlySales?.map(m => m.month) || [],
    datasets: [{
      label: 'Ingresos',
      data: monthlySales?.map(m => Number(m.revenue)) || [],
      borderColor: '#FA812F',
      backgroundColor: 'rgba(250, 129, 47, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  }

  const categoryChart = {
    labels: salesByCategory?.map(c => c.category) || [],
    datasets: [{
      label: 'Unidades vendidas',
      data: salesByCategory?.map(c => c.units_sold) || [],
      backgroundColor: ['#FA812F', '#FAB12F', '#FEF3E2', '#DD0303', '#FFD700', '#FF6B6B'],
    }],
  }

  const topProductsChart = {
    labels: topProducts?.map(p => p.name.substring(0, 20)) || [],
    datasets: [{
      label: 'Total vendido',
      data: topProducts?.map(p => p.total_sold) || [],
      backgroundColor: '#FAB12F',
      borderColor: '#FA812F',
      borderWidth: 1,
    }],
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Metricas y analisis de tu tienda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Ingresos totales</span>
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(metrics?.orders?.total_revenue || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">{metrics?.orders?.total_orders || 0} pedidos</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Productos</span>
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics?.products?.total_products || 0}</p>
          <p className="text-xs text-gray-400 mt-1">{metrics?.products?.total_stock || 0} unidades en stock</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Usuarios</span>
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics?.users?.total_users || 0}</p>
          <p className="text-xs text-gray-400 mt-1">{metrics?.users?.customers || 0} clientes</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Pedidos pendientes</span>
            <div className="w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics?.orders?.pending_orders || 0}</p>
          <p className="text-xs text-gray-400 mt-1">{metrics?.orders?.delivered_orders || 0} entregados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ingresos por mes</h3>
          {monthlySales?.length > 0 ? (
            <Line data={revenueChart} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { callback: v => '$' + (v/1000000).toFixed(0) + 'M' } } },
            }} />
          ) : (
            <p className="text-gray-400 text-center py-8">Sin datos de ventas aun</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ventas por categoria</h3>
          {salesByCategory?.length > 0 ? (
            <Doughnut data={categoryChart} options={{
              responsive: true,
              plugins: { legend: { position: 'bottom' } },
            }} />
          ) : (
            <p className="text-gray-400 text-center py-8">Sin datos de ventas aun</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 productos mas vendidos</h3>
          {topProducts?.length > 0 ? (
            <>
              <Bar data={topProductsChart} options={{
                responsive: true,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
              }} />
              <div className="mt-4 space-y-2">
                {topProducts.slice(0, 5).map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">
                      <span className="font-bold text-accent mr-2">#{i+1}</span>
                      {p.name}
                    </span>
                    <span className="font-medium">{p.total_sold} vendidos</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center py-8">Sin datos de ventas aun</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen de ventas por categoria</h3>
          {salesByCategory?.length > 0 ? (
            <div className="space-y-4">
              {salesByCategory.map(cat => (
                <div key={cat.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{cat.category}</p>
                    <p className="text-sm text-gray-500">{cat.units_sold} unidades vendidas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent">{formatPrice(cat.revenue)}</p>
                    <p className="text-xs text-gray-400">{cat.order_count} pedidos</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Sin datos de ventas aun</p>
          )}
        </div>
      </div>
    </div>
  )
}
